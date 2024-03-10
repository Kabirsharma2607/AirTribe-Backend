const router = require("express").Router();
const sql = require("../config/dbConfig");

router.get("/get-all-students", async (req, res) => {
  try {
    let students = await sql`
    SELECT * FROM Students;
    `;
    console.log(students);
    if (students.length !== 0) {
      return res.send(students);
    } else {
      throw new Error("No student");
    }
  } catch (error) {
    res.status(500).send(error.message);
  }
});

router.post("/new-student", async (req, res) => {
  try {
    let maxId = await sql`SELECT MAX(student_id) as max FROM Students;`;
    maxId = maxId[0].max || 10000000;

    let query = await sql`
    Insert into Students values(${maxId + 1},  ${req.body.name}, ${
      req.body.linkedin
    })
    `;
    if (query) {
      return res.send("You have registered successfully");
    } else {
      throw new Error();
    }
  } catch (error) {
    res.status(500).send(error.message);
  }
});
module.exports = router;
