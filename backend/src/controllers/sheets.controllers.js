import { db } from "../libs/db.js";
import { createRazorpayOrder, verifyRazorpayPayment } from "../libs/payments.lib.js";

export const createSheet = async (req, res) => {
  try {
    const {
      title,
      description,
      topic,
      difficulty,
      problemIds,
      price,
      type,
      estimatedHours,
      prerequisites,
    } = req.body;

    if (req.user.role !== "ADMIN") {
      return res.status(403).json({
        success: false,
        message: "Only admins can create sheets",
      });
    }

    // Validate inputs
    if (!title || !description || !topic || !difficulty || !problemIds?.length) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields",
      });
    }

    if (type === "PREMIUM" && (!price || price <= 0)) {
      return res.status(400).json({
        success: false,
        message: "Premium sheets must have a valid price",
      });
    }

    // Verify all problems exist
    const problems = await db.problem.findMany({
      where: { id: { in: problemIds } },
    });

    if (problems.length !== problemIds.length) {
      return res.status(400).json({
        success: false,
        message: "One or more problems not found",
      });
    }

    const sheet = await db.sheet.create({
      data: {
        title,
        description,
        topic,
        difficulty,
        problemIds,
        price: type === "PREMIUM" ? parseFloat(price) : 0,
        type,
        estimatedHours,
        prerequisites: prerequisites || [],
      },
    });

    res.status(201).json({
      success: true,
      message: "Sheet created successfully",
      sheet,
    });
  } catch (error) {
    console.error("Error creating sheet:", error);
    res.status(500).json({
      success: false,
      message: "Failed to create sheet",
    });
  }
};

export const getAllSheets = async (req, res) => {
  try {
    const { topic, difficulty, type, page = 1, limit = 10 } = req.query;
    const userId = req.user.id;

    let whereClause = { isActive: true };

    if (topic) whereClause.topic = topic;
    if (difficulty) whereClause.difficulty = difficulty;
    if (type) whereClause.type = type;

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [sheets, userSheets] = await Promise.all([
      db.sheet.findMany({
        where: whereClause,
        skip,
        take: parseInt(limit),
        orderBy: { createdAt: "desc" },
      }),
      db.userSheet.findMany({
        where: { userId, isActive: true },
        select: { sheetId: true },
      }),
    ]);

    const userSheetIds = userSheets.map((us) => us.sheetId);

    const sheetsWithAccess = await Promise.all(
      sheets.map(async (sheet) => {
        const hasAccess = sheet.type === "FREE" || userSheetIds.includes(sheet.id);

        let progress = null;
        if (hasAccess) {
          const completedCount = await db.sheetProgress.count({
            where: {
              userId,
              sheetId: sheet.id,
              completed: true,
            },
          });

          progress = {
            completed: completedCount,
            total: sheet.problemIds.length,
            percentage:
              sheet.problemIds.length > 0
                ? Math.round((completedCount / sheet.problemIds.length) * 100)
                : 0,
          };
        }

        return {
          ...sheet,
          hasAccess,
          progress,
          problemCount: sheet.problemIds.length,
        };
      })
    );

    res.status(200).json({
      success: true,
      sheets: sheetsWithAccess,
    });
  } catch (error) {
    console.error("Error fetching sheets:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch sheets",
    });
  }
};

export const getSheetById = async (req, res) => {
  try {
    const { sheetId } = req.params;
    const userId = req.user.id;

    const sheet = await db.sheet.findUnique({
      where: { id: sheetId, isActive: true },
    });

    if (!sheet) {
      return res.status(404).json({
        success: false,
        message: "Sheet not found",
      });
    }

    // Check if user has access
    const userSheet = await db.userSheet.findUnique({
      where: {
        userId_sheetId: { userId, sheetId },
      },
    });

    const hasAccess = sheet.type === "FREE" || (userSheet && userSheet.isActive);

    if (!hasAccess) {
      return res.status(200).json({
        success: true,
        sheet: {
          ...sheet,
          problems: [],
          hasAccess: false,
          progress: null,
        },
      });
    }

    // Get problems and progress
    const [problems, progressRecords] = await Promise.all([
      db.problem.findMany({
        where: { id: { in: sheet.problemIds } },
        select: {
          id: true,
          title: true,
          difficulty: true,
          tags: true,
        },
      }),
      db.sheetProgress.findMany({
        where: { userId, sheetId },
      }),
    ]);

    const progressMap = progressRecords.reduce((acc, p) => {
      acc[p.problemId] = p;
      return acc;
    }, {});

    const problemsWithProgress = problems.map((problem) => ({
      ...problem,
      completed: progressMap[problem.id]?.completed || false,
      attempts: progressMap[problem.id]?.attempts || 0,
      completedAt: progressMap[problem.id]?.completedAt,
    }));

    const completedCount = progressRecords.filter((p) => p.completed).length;

    res.status(200).json({
      success: true,
      sheet: {
        ...sheet,
        problems: problemsWithProgress,
        hasAccess: true,
        progress: {
          completed: completedCount,
          total: problems.length,
          percentage:
            problems.length > 0 ? Math.round((completedCount / problems.length) * 100) : 0,
        },
      },
    });
  } catch (error) {
    console.error("Error fetching sheet:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch sheet",
    });
  }
};

export const createPaymentOrder = async (req, res) => {
  try {
    const { sheetId } = req.body;
    const userId = req.user.id;

    const sheet = await db.sheet.findUnique({
      where: { id: sheetId, isActive: true },
    });

    if (!sheet) {
      return res.status(404).json({
        success: false,
        message: "Sheet not found",
      });
    }

    if (sheet.type !== "PREMIUM") {
      return res.status(400).json({
        success: false,
        message: "This sheet is free",
      });
    }

    // Check if already purchased
    const existingPurchase = await db.userSheet.findUnique({
      where: {
        userId_sheetId: { userId, sheetId },
      },
    });

    if (existingPurchase && existingPurchase.isActive) {
      return res.status(400).json({
        success: false,
        message: "Sheet already purchased",
      });
    }

    // Create payment order
    const order = await createRazorpayOrder(sheet.price);

    // Save payment record
    await db.payment.create({
      data: {
        userId,
        sheetId,
        amount: sheet.price,
        paymentGateway: "razorpay",
        gatewayOrderId: order.id,
        status: "pending",
        metadata: {
          sheetTitle: sheet.title,
          sheetTopic: sheet.topic,
        },
      },
    });

    res.status(200).json({
      success: true,
      order: {
        id: order.id,
        amount: order.amount,
        currency: order.currency,
        key: process.env.RAZORPAY_KEY_ID,
      },
      sheet: {
        id: sheet.id,
        title: sheet.title,
        price: sheet.price,
      },
    });
  } catch (error) {
    console.error("Error creating payment order:", error);
    res.status(500).json({
      success: false,
      message: "Failed to create payment order",
    });
  }
};

export const verifyPayment = async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, sheetId } = req.body;
    const userId = req.user.id;

    // Verify signature
    const isValid = verifyRazorpayPayment(
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature
    );

    if (!isValid) {
      return res.status(400).json({
        success: false,
        message: "Invalid payment signature",
      });
    }

    // Update payment status
    const payment = await db.payment.update({
      where: { gatewayOrderId: razorpay_order_id },
      data: {
        gatewayPaymentId: razorpay_payment_id,
        status: "completed",
      },
    });

    // Grant access to sheet
    await db.userSheet.upsert({
      where: {
        userId_sheetId: { userId, sheetId },
      },
      update: {
        isActive: true,
        paymentId: razorpay_payment_id,
        amount: payment.amount,
      },
      create: {
        userId,
        sheetId,
        paymentId: razorpay_payment_id,
        amount: payment.amount,
        isActive: true,
      },
    });

    res.status(200).json({
      success: true,
      message: "Payment verified and access granted",
    });
  } catch (error) {
    console.error("Error verifying payment:", error);
    res.status(500).json({
      success: false,
      message: "Failed to verify payment",
    });
  }
};

export const updateProgress = async (req, res) => {
  try {
    const { sheetId, problemId } = req.params;
    const userId = req.user.id;

    // Verify user has access to sheet
    const sheet = await db.sheet.findUnique({
      where: { id: sheetId, isActive: true },
    });

    if (!sheet) {
      return res.status(404).json({
        success: false,
        message: "Sheet not found",
      });
    }

    if (sheet.type === "PREMIUM") {
      const userSheet = await db.userSheet.findUnique({
        where: {
          userId_sheetId: { userId, sheetId },
        },
      });

      if (!userSheet || !userSheet.isActive) {
        return res.status(403).json({
          success: false,
          message: "Access denied",
        });
      }
    }

    // Verify problem is part of sheet
    if (!sheet.problemIds.includes(problemId)) {
      return res.status(400).json({
        success: false,
        message: "Problem not part of this sheet",
      });
    }

    // Check if user has solved this problem
    const problemSolved = await db.problemSolved.findUnique({
      where: {
        userId_problemId: { userId, problemId },
      },
    });

    if (!problemSolved) {
      return res.status(400).json({
        success: false,
        message: "Problem not solved yet",
      });
    }

    // Update progress
    await db.sheetProgress.upsert({
      where: {
        userId_sheetId_problemId: { userId, sheetId, problemId },
      },
      update: {
        completed: true,
        completedAt: new Date(),
        attempts: { increment: 1 },
      },
      create: {
        userId,
        sheetId,
        problemId,
        completed: true,
        completedAt: new Date(),
        attempts: 1,
      },
    });

    res.status(200).json({
      success: true,
      message: "Progress updated successfully",
    });
  } catch (error) {
    console.error("Error updating progress:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update progress",
    });
  }
};

export const getMySheets = async (req, res) => {
  try {
    const userId = req.user.id;

    const userSheets = await db.userSheet.findMany({
      where: { userId, isActive: true },
      include: {
        sheet: true,
      },
    });

    const sheetsWithProgress = await Promise.all(
      userSheets.map(async (userSheet) => {
        const completedCount = await db.sheetProgress.count({
          where: {
            userId,
            sheetId: userSheet.sheetId,
            completed: true,
          },
        });

        const total = userSheet.sheet.problemIds.length;

        return {
          ...userSheet.sheet,
          progress: {
            completed: completedCount,
            total,
            percentage: total > 0 ? Math.round((completedCount / total) * 100) : 0,
          },
          purchasedAt: userSheet.purchasedAt,
        };
      })
    );

    res.status(200).json({
      success: true,
      sheets: sheetsWithProgress,
    });
  } catch (error) {
    console.error("Error fetching user sheets:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch sheets",
    });
  }
};

export const getSheetStats = async (req, res) => {
  try {
    if (req.user.role !== "ADMIN") {
      return res.status(403).json({
        success: false,
        message: "Admin access required",
      });
    }

    const [totalSheets, premiumSheets, totalSales, activeUsers] = await Promise.all([
      db.sheet.count({ where: { isActive: true } }),
      db.sheet.count({ where: { type: "PREMIUM", isActive: true } }),
      db.payment.aggregate({
        where: { status: "completed" },
        _sum: { amount: true },
      }),
      db.userSheet.count({ where: { isActive: true } }),
    ]);

    res.status(200).json({
      success: true,
      stats: {
        totalSheets,
        premiumSheets,
        totalSales: totalSales._sum.amount || 0,
        activeUsers,
      },
    });
  } catch (error) {
    console.error("Error fetching sheet stats:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch stats",
    });
  }
};
