// Minimal transactional-email helper.
// Phase 4 wires nodemailer + SMTP (verify-email, password reset). Until then this
// logs the link in dev so flows are testable, and NEVER returns tokens to clients.

const frontendOrigin = () => process.env.FRONTEND_ORIGIN || "http://localhost:3000";

export const sendPasswordResetEmail = async (email, token) => {
  const link = `${frontendOrigin()}/reset-password?token=${token}`;
  if (process.env.NODE_ENV !== "production") {
    console.log(`[email:dev] password-reset link for ${email}: ${link}`);
    return;
  }
  // TODO (Phase 4): deliver via nodemailer + SMTP.
  console.warn(`[email] SMTP not configured — reset email for ${email} was not sent`);
};

export const sendVerificationEmail = async (email, token) => {
  const link = `${frontendOrigin()}/verify-email?token=${token}`;
  if (process.env.NODE_ENV !== "production") {
    console.log(`[email:dev] verify-email link for ${email}: ${link}`);
    return;
  }
  // TODO (Phase 4): deliver via nodemailer + SMTP.
  console.warn(`[email] SMTP not configured — verification email for ${email} was not sent`);
};
