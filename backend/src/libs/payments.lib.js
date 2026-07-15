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

export const createRazorpayOrder = async (amount, currency = "INR") => {
  try {
    return await client().orders.create({
      amount: Math.round(amount * 100), // paise
      currency,
      receipt: `receipt_${Date.now()}`,
      payment_capture: 1,
    });
  } catch (error) {
    console.error("Error creating Razorpay order:", error);
    throw new Error("Failed to create payment order");
  }
};

export const verifyRazorpayPayment = (razorpayOrderId, razorpayPaymentId, razorpaySignature) => {
  try {
    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET || "")
      .update(`${razorpayOrderId}|${razorpayPaymentId}`)
      .digest("hex");
    return expectedSignature === razorpaySignature;
  } catch (error) {
    console.error("Error verifying payment:", error);
    return false;
  }
};

export const refundPayment = async (paymentId, amount) => {
  try {
    return await client().payments.refund(paymentId, { amount: Math.round(amount * 100) });
  } catch (error) {
    console.error("Error processing refund:", error);
    throw new Error("Failed to process refund");
  }
};
