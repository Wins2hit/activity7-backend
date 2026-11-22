const router = require("express").Router();
const pool = require("../db");

const VALID_STATUSES = ["Pending", "In progress", "Completed"];
const COLUMNS = "id, title, category, description, status";

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

function parseId(raw) {
  if (!/^\d+$/.test(raw)) return null;
  const id = Number(raw);
  return Number.isInteger(id) && id > 0 ? id : null;
}

// GET all
router.get("/", async (req, res, next) => {
  try {
    const result = await pool.query(`SELECT ${COLUMNS} FROM records ORDER BY id`);
    res.status(200).json(result.rows);
  } catch (err) { next(err); }
});

// GET one
router.get("/:id", async (req, res, next) => {
  try {
    const id = parseId(req.params.id);
    if (id === null)
      return res.status(400).json({ message: "id must be a positive whole number." });

    const result = await pool.query(`SELECT ${COLUMNS} FROM records WHERE id = $1`, [id]);
    if (result.rows.length === 0) return res.status(404).json({ message: "Record not found." });
    res.status(200).json(result.rows[0]);
  } catch (err) { next(err); }
});

// POST
router.post("/", async (req, res, next) => {
  try {
    const { errors, value } = validateRecord(req.body);
    if (errors.length) return res.status(400).json({ message: errors[0] });

    const result = await pool.query(
      "INSERT INTO records (title, category, description, status) VALUES ($1, $2, $3, $4) RETURNING *",
      [value.title, value.category, value.description, value.status]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) { next(err); }
});

// PUT
router.put("/:id", async (req, res, next) => {
  try {
    const id = parseId(req.params.id);
    if (id === null)
      return res.status(400).json({ message: "id must be a positive whole number." });

    const { errors, value } = validateRecord(req.body);
    if (errors.length) return res.status(400).json({ message: errors[0] });

    const result = await pool.query(
      "UPDATE records SET title = $1, category = $2, description = $3, status = $4 WHERE id = $5 RETURNING *",
      [value.title, value.category, value.description, value.status, id]
    );
    if (result.rows.length === 0) return res.status(404).json({ message: "Record not found." });
    res.status(200).json(result.rows[0]);
  } catch (err) { next(err); }
});

// DELETE
router.delete("/:id", async (req, res, next) => {
  try {
    const id = parseId(req.params.id);
    if (id === null)
      return res.status(400).json({ message: "id must be a positive whole number." });

    const result = await pool.query("DELETE FROM records WHERE id = $1 RETURNING id", [id]);
    if (result.rows.length === 0) return res.status(404).json({ message: "Record not found." });
    res.status(200).json({ message: "Record deleted." });
  } catch (err) { next(err); }
});

module.exports = router;