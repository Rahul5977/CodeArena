import Razorpay from "razorpay";
import crypto from "crypto";

// Lazy Razorpay client so the API boots even when payment keys aren't set
// (donations are optional; everything on CodeArena is free). The client is
// only constructed on first use, and errors surface as a failed donation.
let _razorpay;
const client = () => {
  if (!_razorpay) {
    const { RAZORPAY_KEY_ID, RAZORPAY_KEY_SECRET } = process.env;
    if (!RAZORPAY_KEY_ID || !RAZORPAY_KEY_SECRET) {
      throw new Error("Razorpay keys are not configured");
    }
    _razorpay = new Razorpay({ key_id: RAZORPAY_KEY_ID, key_secret: RAZORPAY_KEY_SECRET });
  }
  return _razorpay;
};

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

// Bounded external call: per-call timeout + limited retries + a lightweight circuit
// breaker, so a Razorpay slowdown/outage fails FAST instead of piling up in-flight
// requests until the process runs out of resources. Callers translate PAYMENTS_UNAVAILABLE
// into a friendly 503.
const breaker = { failures: 0, openUntil: 0 };
async function withGuard(label, fn, { timeoutMs = 8000, retries = 2 } = {}) {
  if (Date.now() < breaker.openUntil) throw new Error("PAYMENTS_UNAVAILABLE");
  let lastErr;
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      const result = await Promise.race([
        fn(),
        new Promise((_, rej) => setTimeout(() => rej(new Error("timeout")), timeoutMs)),
      ]);
      breaker.failures = 0;
      return result;
    } catch (e) {
      lastErr = e;
      if (attempt < retries) await sleep(200 * (attempt + 1) + Math.floor(Math.random() * 150));
    }
  }
  breaker.failures += 1;
  if (breaker.failures >= 5) breaker.openUntil = Date.now() + 30_000; // trip open for 30s
  console.error(`[payments] ${label} failed:`, lastErr?.message);
  throw lastErr;
}

export const createRazorpayOrder = (amount, currency = "INR") =>
  withGuard("orders.create", () =>
    client().orders.create({
      amount: Math.round(amount * 100), // paise
      currency,
      receipt: `receipt_${Date.now()}`,
      payment_capture: 1,
    })
  );

// Reconciliation reads — used by the cron to self-heal donations whose webhook was missed.
export const fetchOrder = (orderId) => withGuard("orders.fetch", () => client().orders.fetch(orderId));
export const fetchOrderPayments = (orderId) => withGuard("orders.fetchPayments", () => client().orders.fetchPayments(orderId));

export const verifyRazorpayPayment = (razorpayOrderId, razorpayPaymentId, razorpaySignature) => {
  try {
    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET || "")
      .update(`${razorpayOrderId}|${razorpayPaymentId}`)
      .digest("hex");
    // constant-time compare
    const a = Buffer.from(expectedSignature, "utf8");
    const b = Buffer.from(razorpaySignature || "", "utf8");
    return a.length === b.length && crypto.timingSafeEqual(a, b);
  } catch (error) {
    console.error("Error verifying payment:", error);
    return false;
  }
};

export const refundPayment = (paymentId, amount) =>
  withGuard("payments.refund", () => client().payments.refund(paymentId, { amount: Math.round(amount * 100) }));
