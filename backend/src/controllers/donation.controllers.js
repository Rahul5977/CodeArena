import { db } from "../libs/db.js";
import { createRazorpayOrder, verifyRazorpayPayment } from "../libs/payments.lib.js";
import { settlePayment } from "../libs/donations.lib.js";

// Pay-what-you-want support. A donation grants nothing extra — everything on
// CodeArena is free; this is a thank-you, not a purchase.

const orderPayload = (d) => ({ id: d.gatewayOrderId, amount: Math.round(d.amount * 100), currency: d.currency });

export const createDonationOrder = async (req, res) => {
  try {
    const { amount, name, message, showOnWall = false } = req.body;
    // Idempotency-Key (header or body) dedupes double-clicks / retries into one order.
    const idempotencyKey = req.get("Idempotency-Key") || req.body.idempotencyKey || null;
    const value = Number(amount);
    if (!value || value < 1) return res.status(400).json({ success: false, message: "Please enter a valid amount" });

    // Already have an order for this key? Return it instead of creating a duplicate.
    if (idempotencyKey) {
      const existing = await db.donation.findUnique({ where: { idempotencyKey } });
      if (existing) return res.status(200).json({ success: true, order: orderPayload(existing), keyId: process.env.RAZORPAY_KEY_ID });
    }

    const order = await createRazorpayOrder(value, "INR");
    try {
      await db.donation.create({
        data: {
          userId: req.user?.id || null,
          amount: value,
          currency: "INR",
          idempotencyKey,
          gatewayOrderId: order.id,
          status: "created",
          name: name || null,
          message: message || null,
          showOnWall: !!showOnWall,
        },
      });
    } catch (e) {
      // Raced with a concurrent create using the same key → return the winner's order.
      if (e.code === "P2002" && idempotencyKey) {
        const existing = await db.donation.findUnique({ where: { idempotencyKey } });
        if (existing) return res.status(200).json({ success: true, order: orderPayload(existing), keyId: process.env.RAZORPAY_KEY_ID });
      }
      throw e;
    }

    return res.status(201).json({ success: true, order, keyId: process.env.RAZORPAY_KEY_ID });
  } catch (error) {
    if (error.message === "PAYMENTS_UNAVAILABLE") {
      return res.status(503).json({ success: false, message: "Payments are briefly unavailable — please try again in a moment." });
    }
    console.error("Error creating donation order:", error);
    return res.status(500).json({ success: false, message: "Could not start the donation" });
  }
};

export const verifyDonation = async (req, res) => {
  try {
    const { razorpayOrderId, razorpayPaymentId, razorpaySignature } = req.body;
    const valid = verifyRazorpayPayment(razorpayOrderId, razorpayPaymentId, razorpaySignature);

    if (!valid) {
      await db.donation.updateMany({ where: { gatewayOrderId: razorpayOrderId, status: "created" }, data: { status: "failed" } });
      return res.status(400).json({ success: false, message: "Payment verification failed" });
    }

    // Idempotent, guarded settlement — safe even if the webhook already settled it.
    await settlePayment(razorpayOrderId, razorpayPaymentId);
    const donation = await db.donation.findUnique({ where: { gatewayOrderId: razorpayOrderId }, select: { amount: true } });
    return res.status(200).json({ success: true, message: "Thank you for supporting CodeArena!", amount: donation?.amount });
  } catch (error) {
    console.error("Error verifying donation:", error);
    return res.status(500).json({ success: false, message: "Error verifying donation" });
  }
};

// Public supporters wall (opt-in only).
export const supportersWall = async (req, res) => {
  try {
    const supporters = await db.donation.findMany({
      where: { status: "paid", showOnWall: true, name: { not: null } },
      orderBy: { createdAt: "desc" },
      take: 50,
      select: { name: true, message: true, amount: true, createdAt: true },
    });
    return res.status(200).json({ success: true, supporters });
  } catch (error) {
    console.error("Error fetching supporters:", error);
    return res.status(500).json({ success: false, message: "Error fetching supporters" });
  }
};

// Admin — donation list + total.
export const listDonations = async (req, res) => {
  try {
    const [donations, total] = await Promise.all([
      db.donation.findMany({
        where: { status: "paid" },
        orderBy: { createdAt: "desc" },
        take: 100,
        select: { id: true, amount: true, name: true, message: true, showOnWall: true, createdAt: true },
      }),
      db.donation.aggregate({ _sum: { amount: true }, where: { status: "paid" } }),
    ]);
    return res.status(200).json({ success: true, donations, total: total._sum.amount || 0 });
  } catch (error) {
    console.error("Error listing donations:", error);
    return res.status(500).json({ success: false, message: "Error listing donations" });
  }
};
