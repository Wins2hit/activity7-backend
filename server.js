 
require("dotenv").config();
const express = require("express");
const cors = require("cors");
const db = require("./db");

const app = express();

const origins = (process.env.CLIENT_ORIGINS || "")
  .split(",").map(v => v.trim()).filter(Boolean);

app.use(cors({ origin: origins }));
app.use(express.json());

// ---- GET / : API guide ----
app.get("/", (req, res) => {
  const base = `${req.protocol}://${req.get("host")}`;
  res.type("html").send(`<!DOCTYPE html>
<html lang="en"><head><meta charset="UTF-8">
<title>Campus Maintenance Request API</title>
<style>
  body{font-family:system-ui,sans-serif;max-width:920px;margin:2rem auto;padding:0 1rem;line-height:1.6;color:#222}
  h1{color:#1f4e79}h2{border-bottom:2px solid #1f4e79;padding-bottom:.25rem}
  table{border-collapse:collapse;width:100%;margin:1rem 0}
  th,td{border:1px solid #ccc;padding:.5rem .75rem;text-align:left}
  th{background:#eef3f8}
  code,pre{background:#f4f4f4;padding:.15rem .35rem;border-radius:4px}
  pre{padding:1rem;overflow-x:auto}
  .note{background:#fff8e1;border-left:4px solid #f0b429;padding:.75rem 1rem}
</style></head><body>
<h1>Campus Maintenance Request API</h1>
<p><strong>Student:</strong> [Your Name] &nbsp;|&nbsp; <strong>Student No:</strong> [Your Student Number]</p>
<p><strong>System:</strong> Backend API that stores and manages campus maintenance requests.</p>
<p><strong>Live base URL:</strong> <code>${base}</code></p>
<p>Quick links: <a href="/health">/health</a> &middot; <a href="/api/records">/api/records</a></p>

<h2>Routes</h2>
<table>
<tr><th>Method</th><th>Route</th><th>Purpose</th></tr>
<tr><td>GET</td><td>/</td><td>This guide</td></tr>
<tr><td>GET</td><td>/health</td><td>Server + DB status</td></tr>
<tr><td>GET</td><td>/api/records</td><td>Read all records</td></tr>
<tr><td>GET</td><td>/api/records/:id</td><td>Read one record</td></tr>
<tr><td>POST</td><td>/api/records</td><td>Create a record</td></tr>
<tr><td>PUT</td><td>/api/records/:id</td><td>Update a record</td></tr>
<tr><td>DELETE</td><td>/api/records/:id</td><td>Delete a record</td></tr>
</table>

<h2>Input fields</h2>
<ul>
<li><code>title</code> — 3 to 80 chars</li>
<li><code>category</code> — 2 to 40 chars</li>
<li><code>description</code> — 5 to 300 chars</li>
<li><code>status</code> — <code>Pending</code> | <code>In progress</code> | <code>Completed</code></li>
</ul>

<h2>Example POST / PUT body</h2>
<pre>{
  "title": "Broken classroom light",
  "category": "Electrical",
  "description": "The light in Room B12 does not switch on.",
  "status": "Pending"
}</pre>

<h2>Response codes</h2>
<ul>
<li><strong>200</strong> OK</li><li><strong>201</strong> Created</li>
<li><strong>400</strong> Invalid input / malformed JSON</li>
<li><strong>404</strong> Record or route not found</li>
<li><strong>500</strong> Server error</li>
<li><strong>503</strong> DB unavailable (from /health)</li>
</ul>
<p class="note">The service may take a few seconds to wake up if idle. Send a request to <code>/health</code> first.</p>
</body></html>`);
});

// ---- GET /health ----
app.get("/health", (req, res) => {
  try {
    db.prepare("SELECT 1 AS ok").get();
    res.status(200).json({ status: "ok", database: "ok" });
  } catch (err) {
    res.status(503).json({ status: "error", database: "unavailable", message: err.message });
  }
});

// ---- Records router ----
app.use("/api/records", require("./routes/records"));

// ---- 404 ----
app.use((req, res) => res.status(404).json({ message: "Route not found." }));

// ---- Error handler ----
app.use((err, req, res, next) => {
  console.error(err);
  if (err.type === "entity.parse.failed" || err instanceof SyntaxError) {
    return res.status(400).json({ message: "Malformed JSON in request body." });
  }
  res.status(500).json({ message: "Internal server error." });
});

const port = process.env.PORT || 3000;
app.listen(port, "0.0.0.0", () => console.log(`Server listening on port ${port}`));