import express from "express";
import rateLimit from "express-rate-limit";
import { authMiddleware, checkAdmin } from "../middleware/auth.middleware.js";
import {
  createDonationOrder,
  verifyDonation,
  supportersWall,
  listDonations,
} from "../controllers/donation.controllers.js";

const donationRoutes = express.Router();

// Cap order creation per client so nobody can spam-create Razorpay orders.
const orderLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 8,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: "Too many payment attempts — please slow down a moment." },
});

// Public
donationRoutes.get("/supporters", supportersWall);

// Authenticated supporters
donationRoutes.post("/order", orderLimiter, authMiddleware, createDonationOrder);
donationRoutes.post("/verify", authMiddleware, verifyDonation);

// Admin
donationRoutes.get("/admin", authMiddleware, checkAdmin, listDonations);

export default donationRoutes;
