import nodemailer from "nodemailer";

// Sends via SMTP when configured (SMTP_HOST + SMTP_USER); otherwise logs the
// link in dev so flows are testable. Tokens are never returned to clients.
let _transport;
const transport = () => {
  if (_transport !== undefined) return _transport;
  const { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS } = process.env;
  if (!SMTP_HOST || !SMTP_USER) {
    _transport = null;
    return null;
  }
  _transport = nodemailer.createTransport({
    host: SMTP_HOST,
    port: Number(SMTP_PORT) || 587,
    secure: Number(SMTP_PORT) === 465,
    auth: { user: SMTP_USER, pass: SMTP_PASS },
  });
  return _transport;
};

const from = () => process.env.SMTP_FROM || process.env.SMTP_USER || "CodeArena <no-reply@codearena.dev>";
const origin = () => process.env.FRONTEND_ORIGIN || "http://localhost:3000";

// Reserved, guaranteed-undeliverable domains (RFC 2606 / 7505). Never actually
// send to these — otherwise test accounts (e.g. our own smoke tests) bounce
// straight back into the sender's inbox. Real users are unaffected.
const isUndeliverable = (email) => {
  const e = String(email || "").toLowerCase().trim();
  return /@example\.(com|net|org)$/.test(e) || /\.(test|invalid|example|localhost)$/.test(e);
};

// Warm, branded HTML shell (inline styles — required for email clients) with a
// button and a copy-paste fallback link.
const shell = (heading, body, btnLabel, btnUrl, footnote = "") => `
<div style="background:#f5ead8;padding:32px 16px;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif">
  <div style="max-width:480px;margin:0 auto;background:#ebddc5;border-radius:20px;padding:30px 28px">
    <div style="font-family:Georgia,'Times New Roman',serif;font-size:22px;color:#201e1d;margin-bottom:4px">CodeArena</div>
    <h1 style="font-size:20px;color:#201e1d;margin:14px 0 10px">${heading}</h1>
    <p style="font-size:15px;line-height:1.6;color:#4a4642;margin:0 0 22px">${body}</p>
    <a href="${btnUrl}" style="display:inline-block;background:#c67139;color:#fdf6ea;text-decoration:none;padding:12px 26px;border-radius:999px;font-weight:600;font-size:15px">${btnLabel}</a>
    <p style="font-size:12px;color:#8a8378;margin:22px 0 0;line-height:1.5">Or paste this link into your browser:<br><a href="${btnUrl}" style="color:#8c491a;word-break:break-all">${btnUrl}</a></p>
    ${footnote ? `<p style="font-size:12px;color:#8a8378;margin:16px 0 0;line-height:1.5">${footnote}</p>` : ""}
  </div>
  <div style="max-width:480px;margin:14px auto 0;text-align:center;font-size:11px;color:#a19786">CodeArena · Practice DSA, free forever</div>
</div>`;

async function send(to, subject, html, text, devLabel, devLink) {
  if (isUndeliverable(to)) {
    console.log(`[email] skipped ${devLabel} → non-deliverable test address ${to}`);
    return;
  }
  const t = transport();
  if (!t) {
    if (process.env.NODE_ENV !== "production") console.log(`[email:dev] ${devLabel} for ${to}: ${devLink}`);
    else console.warn(`[email] SMTP not configured — ${devLabel} for ${to} was not sent`);
    return;
  }
  try {
    await t.sendMail({ from: from(), to, subject, html, text });
  } catch (e) {
    console.error(`[email] failed to send ${devLabel} to ${to}:`, e.message);
  }
}

export const sendPasswordResetEmail = async (email, token) => {
  const link = `${origin()}/reset-password?token=${token}`;
  await send(
    email,
    "Reset your CodeArena password",
    shell(
      "Reset your password",
      "We got a request to reset your CodeArena password. This link expires in 10 minutes.",
      "Reset password",
      link,
      "If you didn't ask for this, you can safely ignore this email — your password won't change."
    ),
    `Reset your CodeArena password (expires in 10 minutes):\n${link}\n\nIf you didn't ask for this, ignore this email.`,
    "password-reset link",
    link
  );
};

export const sendVerificationEmail = async (email, token) => {
  const link = `${origin()}/api/v1/auth/verify-email?token=${token}`;
  await send(
    email,
    "Verify your CodeArena email",
    shell(
      "Welcome to CodeArena 👋",
      "Confirm your email to start submitting solutions and posting in the community.",
      "Verify email",
      link
    ),
    `Welcome to CodeArena! Confirm your email to unlock everything:\n${link}`,
    "verify-email link",
    link
  );
};
