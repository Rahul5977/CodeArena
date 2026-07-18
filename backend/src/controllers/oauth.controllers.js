import axios from "axios";
import jwt from "jsonwebtoken";
import { db } from "../libs/db.js";

// Manual OAuth (GitHub + Google) — no passport. The registered redirect URI is
// `${FRONTEND_ORIGIN}/api/v1/auth/oauth/<provider>/callback` so cookies land on
// the app origin (via the Vite proxy in dev, Caddy in prod).

const FRONTEND = () => process.env.FRONTEND_ORIGIN || "http://localhost:3000";
const callbackUrl = (provider) => `${FRONTEND()}/api/v1/auth/oauth/${provider}/callback`;
const roleFor = (email) =>
  process.env.ADMIN_EMAIL && email.toLowerCase() === process.env.ADMIN_EMAIL.toLowerCase() ? "ADMIN" : "USER";

const cookieBase = () => ({ httpOnly: true, sameSite: "lax", secure: process.env.NODE_ENV !== "development", path: "/" });
const generateTokens = (userId) => ({
  accessToken: jwt.sign({ id: userId, type: "access" }, process.env.SECRET, { expiresIn: "15m" }),
  refreshToken: jwt.sign({ id: userId, type: "refresh" }, process.env.REFRESH_SECRET || process.env.SECRET, { expiresIn: "7d" }),
});
const setAuthCookies = (res, at, rt) => {
  res.cookie("accessToken", at, { ...cookieBase(), maxAge: 15 * 60 * 1000 });
  res.cookie("refreshToken", rt, { ...cookieBase(), maxAge: 7 * 24 * 60 * 60 * 1000 });
};

// CSRF state — sameSite:lax so it survives the top-level redirect back from the provider.
const setState = (res) => {
  const state = jwt.sign({ t: "oauth" }, process.env.SECRET, { expiresIn: "10m" });
  res.cookie("oauth_state", state, { httpOnly: true, sameSite: "lax", secure: process.env.NODE_ENV !== "development", maxAge: 10 * 60 * 1000 });
  return state;
};
const checkState = (req) => {
  const { state } = req.query;
  const cookie = req.cookies.oauth_state;
  if (!state || !cookie || state !== cookie) return false;
  try {
    jwt.verify(state, process.env.SECRET);
    return true;
  } catch {
    return false;
  }
};

async function finalize(res, provider, providerId, email, name, image) {
  if (!email) return res.redirect(`${FRONTEND()}/login?error=email_required`);

  const existing = await db.oAuthAccount.findUnique({
    where: { provider_providerId: { provider, providerId } },
    include: { user: true },
  });
  let user = existing?.user;

  if (!user) {
    user = await db.user.findUnique({ where: { email: email.toLowerCase() } });
    if (!user) {
      user = await db.user.create({
        data: { email: email.toLowerCase(), name: name || email.split("@")[0], image, role: roleFor(email), emailVerified: true },
      });
    }
    await db.oAuthAccount.create({ data: { userId: user.id, provider, providerId } });
  }

  const { accessToken, refreshToken } = generateTokens(user.id);
  await db.user.update({ where: { id: user.id }, data: { refreshToken, lastLoginAt: new Date(), lastSeenAt: new Date() } });
  setAuthCookies(res, accessToken, refreshToken);
  res.clearCookie("oauth_state", { ...cookieBase(), sameSite: "lax" });
  return res.redirect(`${FRONTEND()}/app`);
}

// ── GitHub ──
export const githubAuth = (req, res) => {
  if (!process.env.GITHUB_CLIENT_ID) return res.redirect(`${FRONTEND()}/login?error=github_not_configured`);
  const state = setState(res);
  const url =
    `https://github.com/login/oauth/authorize?client_id=${process.env.GITHUB_CLIENT_ID}` +
    `&redirect_uri=${encodeURIComponent(callbackUrl("github"))}` +
    `&scope=${encodeURIComponent("read:user user:email")}&state=${state}`;
  res.redirect(url);
};

export const githubCallback = async (req, res) => {
  try {
    if (!checkState(req)) return res.redirect(`${FRONTEND()}/login?error=state`);
    const { data: tok } = await axios.post(
      "https://github.com/login/oauth/access_token",
      { client_id: process.env.GITHUB_CLIENT_ID, client_secret: process.env.GITHUB_CLIENT_SECRET, code: req.query.code, redirect_uri: callbackUrl("github") },
      { headers: { Accept: "application/json" } }
    );
    if (!tok.access_token) return res.redirect(`${FRONTEND()}/login?error=token`);
    const headers = { Authorization: `Bearer ${tok.access_token}`, "User-Agent": "CodeArena" };
    const { data: u } = await axios.get("https://api.github.com/user", { headers });
    let email = u.email;
    if (!email) {
      const { data: emails } = await axios.get("https://api.github.com/user/emails", { headers });
      email = (emails.find((e) => e.primary && e.verified) || emails.find((e) => e.verified) || emails[0])?.email;
    }
    return finalize(res, "github", String(u.id), email, u.name || u.login, u.avatar_url);
  } catch (e) {
    console.error("GitHub OAuth error:", e.response?.data || e.message);
    return res.redirect(`${FRONTEND()}/login?error=oauth`);
  }
};

// ── Google ──
export const googleAuth = (req, res) => {
  if (!process.env.GOOGLE_CLIENT_ID) return res.redirect(`${FRONTEND()}/login?error=google_not_configured`);
  const state = setState(res);
  const url =
    `https://accounts.google.com/o/oauth2/v2/auth?client_id=${process.env.GOOGLE_CLIENT_ID}` +
    `&redirect_uri=${encodeURIComponent(callbackUrl("google"))}` +
    `&response_type=code&scope=${encodeURIComponent("openid email profile")}&state=${state}`;
  res.redirect(url);
};

export const googleCallback = async (req, res) => {
  try {
    if (!checkState(req)) return res.redirect(`${FRONTEND()}/login?error=state`);
    const { data: tok } = await axios.post("https://oauth2.googleapis.com/token", {
      client_id: process.env.GOOGLE_CLIENT_ID,
      client_secret: process.env.GOOGLE_CLIENT_SECRET,
      code: req.query.code,
      grant_type: "authorization_code",
      redirect_uri: callbackUrl("google"),
    });
    const { data: u } = await axios.get("https://www.googleapis.com/oauth2/v2/userinfo", {
      headers: { Authorization: `Bearer ${tok.access_token}` },
    });
    return finalize(res, "google", String(u.id), u.email, u.name, u.picture);
  } catch (e) {
    console.error("Google OAuth error:", e.response?.data || e.message);
    return res.redirect(`${FRONTEND()}/login?error=oauth`);
  }
};
