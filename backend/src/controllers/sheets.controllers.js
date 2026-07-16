import { db } from "../libs/db.js";

// Sheets are free curation (no payments/premium). CRUD + per-user progress.

export const getAllSheets = async (req, res) => {
  try {
    const sheets = await db.sheet.findMany({ where: { isActive: true }, orderBy: { createdAt: "desc" } });
    return res.status(200).json({ success: true, sheets });
  } catch (error) {
    console.error("Error fetching sheets:", error);
    return res.status(500).json({ success: false, message: "Error fetching sheets" });
  }
};

export const getSheetById = async (req, res) => {
  try {
    const sheet = await db.sheet.findUnique({ where: { id: req.params.sheetId } });
    if (!sheet) return res.status(404).json({ success: false, message: "Sheet not found" });

    // Resolve every referenced problem → answer-free cards, ordered, with solved status.
    const structure = Array.isArray(sheet.structure) ? sheet.structure : null;
    const idSet = new Set(sheet.problemIds || []);
    if (structure) for (const b of structure) for (const id of b.problemIds || []) idSet.add(id);
    const ids = [...idSet];

    const [rows, progress, solved] = await Promise.all([
      ids.length ? db.problem.findMany({ where: { id: { in: ids }, published: true }, select: { id: true, slug: true, title: true, difficulty: true, tags: true } }) : [],
      db.sheetProgress.findMany({ where: { sheetId: sheet.id, userId: req.user.id }, select: { problemId: true, completed: true, completedAt: true, attempts: true } }),
      db.problemSolved.findMany({ where: { userId: req.user.id, problemId: { in: ids } }, select: { problemId: true } }),
    ]);
    const byId = new Map(rows.map((p) => [p.id, p]));
    const solvedSet = new Set(solved.map((s) => s.problemId));
    const card = (id) => (byId.has(id) ? { ...byId.get(id), solved: solvedSet.has(id) } : null);

    const problems = (sheet.problemIds || []).map(card).filter(Boolean);
    // Day-by-day view (the Ascent plan order) when a structure is present.
    const days = structure
      ? structure
          .map((b) => ({ phaseIdx: b.phaseIdx, phase: b.phase, day: b.day, focus: b.focus, problems: (b.problemIds || []).map(card).filter(Boolean) }))
          .filter((b) => b.problems.length)
      : null;

    return res.status(200).json({ success: true, sheet, problems, days, progress });
  } catch (error) {
    console.error("Error fetching sheet:", error);
    return res.status(500).json({ success: false, message: "Error fetching sheet" });
  }
};

export const createSheet = async (req, res) => {
  try {
    const { title, description, topic, difficulty, problemIds = [], estimatedHours, prerequisites = [] } = req.body;
    if (!title || !description || !topic || !difficulty) {
      return res.status(400).json({ success: false, message: "title, description, topic and difficulty are required" });
    }
    const sheet = await db.sheet.create({
      data: { title, description, topic, difficulty, problemIds, estimatedHours, prerequisites },
    });
    return res.status(201).json({ success: true, message: "Sheet created", sheet });
  } catch (error) {
    console.error("Error creating sheet:", error);
    return res.status(500).json({ success: false, message: "Error creating sheet" });
  }
};

// Mark a problem in a sheet as completed for the current user.
export const updateProgress = async (req, res) => {
  try {
    const { sheetId, problemId } = req.params;
    const progress = await db.sheetProgress.upsert({
      where: { userId_sheetId_problemId: { userId: req.user.id, sheetId, problemId } },
      update: { completed: true, completedAt: new Date(), attempts: { increment: 1 } },
      create: { userId: req.user.id, sheetId, problemId, completed: true, completedAt: new Date(), attempts: 1 },
    });
    return res.status(200).json({ success: true, progress });
  } catch (error) {
    console.error("Error updating sheet progress:", error);
    return res.status(500).json({ success: false, message: "Error updating progress" });
  }
};

export const getSheetStats = async (req, res) => {
  try {
    const [total, active] = await Promise.all([db.sheet.count(), db.sheet.count({ where: { isActive: true } })]);
    return res.status(200).json({ success: true, stats: { total, active } });
  } catch (error) {
    console.error("Error fetching sheet stats:", error);
    return res.status(500).json({ success: false, message: "Error fetching sheet stats" });
  }
};
