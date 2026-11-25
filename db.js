require('dotenv').config();
const { Pool } = require('pg');

// Render provides the DATABASE_URL. We need SSL for it to connect.
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

// Create table and seed data
pool.query(`
  CREATE TABLE IF NOT EXISTS records (
    id SERIAL PRIMARY KEY,
    title VARCHAR(80) NOT NULL,
    category VARCHAR(40) NOT NULL,
    description VARCHAR(300) NOT NULL,
    status VARCHAR(20) NOT NULL
  )
`).then(() => {
  return pool.query('SELECT COUNT(*) FROM records');
}).then(res => {
  if (parseInt(res.rows[0].count) === 0) {
    const seedData = [
      ["Python Study Bootcamp", "Academic", "Weekend workshop on Python basics.", "Pending"],
      ["Inter-class Football Match", "Sport", "Friendly football tournament.", "In progress"],
      ["Cultural Dance Night", "Culture", "An evening of traditional dance.", "Pending"],
      ["Database Design Workshop", "Academic", "Hands-on workshop on normalisation.", "Completed"],
      ["Charity Fun Run", "Sport", "A 5 km fun run for charity.", "Pending"],
      ["Poetry Slam Evening", "Culture", "Students recite original poems.", "In progress"],
      ["AI and Ethics Seminar", "Academic", "Guest talk on AI ethics.", "Pending"],
      ["Inter-house Basketball", "Sport", "Basketball games between houses.", "Completed"]
    ];
    
    seedData.forEach(record => {
      pool.query(
        'INSERT INTO records (title, category, description, status) VALUES ($1, $2, $3, $4)',
        record
      );
    });
    console.log("Database seeded!");
  }
}).catch(err => console.error("Database error:", err));

module.exports = pool;