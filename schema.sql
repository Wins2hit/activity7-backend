CREATE TABLE IF NOT EXISTS records (
  id SERIAL PRIMARY KEY,
  title TEXT NOT NULL,
  category TEXT NOT NULL,
  description TEXT NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('Pending','In progress','Completed'))
);