const router = require("express").Router();
const sql = require("../config/dbConfig");

router.get("/get-all-instructors", async (req, res) => {
  try {
    const instructors = await sql`
      SELECT * FROM Instructors;
    `;
    res.json(instructors);
  } catch (error) {
    console.error("Error fetching instructors:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

router.post("/new-instructor", async (req, res) => {
  try {
    let maxId = await sql`SELECT MAX(instructor_id) as max FROM Instructors;`;

    maxId = maxId[0].max || 0;

    let { name, email } = req.body;

    const query = await sql`
      INSERT INTO Instructors (instructor_id, name, email)
      VALUES (${maxId + 1}, ${name}, ${email})
    `;
    if (query) {
      res.status(200).json({ message: "New Instructor added Successfully" });
    } else {
      throw new Error("Error inserting data");
    }
  } catch (error) {
    console.error("Error inserting data:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

module.exports = router;
