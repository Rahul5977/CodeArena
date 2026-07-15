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

async function send(to, subject, html, devLabel, devLink) {
  const t = transport();
  if (!t) {
    if (process.env.NODE_ENV !== "production") console.log(`[email:dev] ${devLabel} for ${to}: ${devLink}`);
    else console.warn(`[email] SMTP not configured — ${devLabel} for ${to} was not sent`);
    return;
  }
  try {
    await t.sendMail({ from: from(), to, subject, html });
  } catch (e) {
    console.error(`[email] failed to send ${devLabel} to ${to}:`, e.message);
  }
}

export const sendPasswordResetEmail = async (email, token) => {
  const link = `${origin()}/reset-password?token=${token}`;
  await send(
    email,
    "Reset your CodeArena password",
    `<p>We got a request to reset your password. Click below (expires in 10 minutes):</p><p><a href="${link}">${link}</a></p><p>If you didn't ask for this, you can ignore this email.</p>`,
    "password-reset link",
    link
  );
};

export const sendVerificationEmail = async (email, token) => {
  const link = `${origin()}/api/v1/auth/verify-email?token=${token}`;
  await send(
    email,
    "Verify your CodeArena email",
    `<p>Welcome to CodeArena! Confirm your email to unlock everything:</p><p><a href="${link}">${link}</a></p>`,
    "verify-email link",
    link
  );
};
