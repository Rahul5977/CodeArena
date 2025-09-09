import Razorpay from "razorpay";
import crypto from "crypto";

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

export const createRazorpayOrder = async (amount, currency = "INR") => {
  try {
    const options = {
      amount: Math.round(amount * 100), // Amount in paise
      currency,
      receipt: `receipt_${Date.now()}`,
      payment_capture: 1,
    };

    const order = await razorpay.orders.create(options);
    return order;
  } catch (error) {
    console.error("Error creating Razorpay order:", error);
    throw new Error("Failed to create payment order");
  }
};

export const verifyRazorpayPayment = (razorpayOrderId, razorpayPaymentId, razorpaySignature) => {
  try {
    const body = razorpayOrderId + "|" + razorpayPaymentId;
    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(body.toString())
      .digest("hex");

    return expectedSignature === razorpaySignature;
  } catch (error) {
    console.error("Error verifying payment:", error);
    return false;
  }
};

export const refundPayment = async (paymentId, amount) => {
  try {
    const refund = await razorpay.payments.refund(paymentId, {
      amount: Math.round(amount * 100),
    });
    return refund;
  } catch (error) {
    console.error("Error processing refund:", error);
    throw new Error("Failed to process refund");
  }
};
