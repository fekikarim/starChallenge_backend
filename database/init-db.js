const sqlite3 = require('sqlite3').verbose();
const fs = require('fs');
const path = require('path');

const dbFile = path.join(__dirname, 'starchallenge.db');
const schemaFile = path.join(__dirname, 'schema.sql');

const db = new sqlite3.Database(dbFile);

const schema = fs.readFileSync(schemaFile, 'utf8');

db.exec(schema, (err) => {
  if (err) {
    console.error("Error creating tables:", err);
  } else {
    console.log("Database schema created successfully.");
  }
  db.close();
});
