 
require("dotenv").config();
const Database = require("better-sqlite3");
const fs = require("fs");
const path = require("path");

const dbPath = process.env.DATABASE_PATH || "./data/records.db";
const dbDir = path.dirname(dbPath);

// Create the data folder if missing
if (!fs.existsSync(dbDir)) fs.mkdirSync(dbDir, { recursive: true });

const db = new Database(dbPath);
db.pragma("journal_mode = WAL");

// Create table
db.exec(fs.readFileSync(path.join(__dirname, "schema.sql"), "utf8"));

// Seed only once
const count = db.prepare("SELECT COUNT(*) AS c FROM records").get().c;
if (count === 0) {
  db.exec(fs.readFileSync(path.join(__dirname, "seed.sql"), "utf8"));
  console.log("Seeded 8 records.");
}

module.exports = db;