 
const router = require("express").Router();
const db = require("../db");

const VALID_STATUSES = ["Pending", "In progress", "Completed"];
const COLUMNS = "id, title, category, description, status";

// ---- Validation ----
function validateRecord(body) {
  const errors = [];
  const { title, category, description, status } = body || {};

  if (typeof title !== "string") errors.push("Title must be a string.");
  if (typeof category !== "string") errors.push("Category must be a string.");
  if (typeof description !== "string") errors.push("Description must be a string.");
  if (typeof status !== "string") errors.push("Status must be a string.");
  if (errors.length) return { errors };

  const value = {
    title: title.trim(),
    category: category.trim(),
    description: description.trim(),
    status: status.trim(),
  };

  if (value.title.length < 3 || value.title.length > 80)
    errors.push("Title must have 3 to 80 characters.");
  if (value.category.length < 2 || value.category.length > 40)
    errors.push("Category must have 2 to 40 characters.");
  if (value.description.length < 5 || value.description.length > 300)
    errors.push("Description must have 5 to 300 characters.");
  if (!VALID_STATUSES.includes(value.status))
    errors.push("Status must be Pending, In progress, or Completed.");

  return { errors, value };
}

// ---- ID helper ----
function parseId(raw) {
  if (!/^\d+$/.test(raw)) return null;
  const id = Number(raw);
  return Number.isInteger(id) && id > 0 ? id : null;
}

// ---- GET all ----
router.get("/", (req, res, next) => {
  try {
    const rows = db.prepare(`SELECT ${COLUMNS} FROM records ORDER BY id`).all();
    res.status(200).json(rows);
  } catch (err) { next(err); }
});

// ---- GET one ----
router.get("/:id", (req, res, next) => {
  try {
    const id = parseId(req.params.id);
    if (id === null)
      return res.status(400).json({ message: "id must be a positive whole number." });

    const row = db.prepare(`SELECT ${COLUMNS} FROM records WHERE id = ?`).get(id);
    if (!row) return res.status(404).json({ message: "Record not found." });
    res.status(200).json(row);
  } catch (err) { next(err); }
});

// ---- POST ----
router.post("/", (req, res, next) => {
  try {
    const { errors, value } = validateRecord(req.body);
    if (errors.length) return res.status(400).json({ message: errors[0] });

    const info = db.prepare(
      "INSERT INTO records (title, category, description, status) VALUES (?, ?, ?, ?)"
    ).run(value.title, value.category, value.description, value.status);

    const created = db.prepare(`SELECT ${COLUMNS} FROM records WHERE id = ?`).get(info.lastInsertRowid);
    res.status(201).json(created);
  } catch (err) { next(err); }
});

// ---- PUT ----
router.put("/:id", (req, res, next) => {
  try {
    const id = parseId(req.params.id);
    if (id === null)
      return res.status(400).json({ message: "id must be a positive whole number." });

    const { errors, value } = validateRecord(req.body);
    if (errors.length) return res.status(400).json({ message: errors[0] });

    const info = db.prepare(
      "UPDATE records SET title = ?, category = ?, description = ?, status = ? WHERE id = ?"
    ).run(value.title, value.category, value.description, value.status, id);

    if (info.changes === 0)
      return res.status(404).json({ message: "Record not found." });

    const updated = db.prepare(`SELECT ${COLUMNS} FROM records WHERE id = ?`).get(id);
    res.status(200).json(updated);
  } catch (err) { next(err); }
});

// ---- DELETE ----
router.delete("/:id", (req, res, next) => {
  try {
    const id = parseId(req.params.id);
    if (id === null)
      return res.status(400).json({ message: "id must be a positive whole number." });

    const info = db.prepare("DELETE FROM records WHERE id = ?").run(id);
    if (info.changes === 0)
      return res.status(404).json({ message: "Record not found." });

    res.status(200).json({ message: "Record deleted." });
  } catch (err) { next(err); }
});

module.exports = router;