const postgres = require("postgres");

try {
  const sql = postgres(process.env.DATABASE_URL);
  console.log("Connected to the database successfully!");

  // Export the sql object
  module.exports = sql;
} catch (error) {
  console.error("Error connecting to the database:", error);
}
