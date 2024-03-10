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

function generateRandomLeadId() {
  // Assuming a range of lead IDs (adjust as needed)
  const minId = 10000;
  const maxId = 99999;

  // Generate a random number within the range
  return Math.floor(Math.random() * (maxId - minId + 1)) + minId;
}

// Endpoint to add a new lead
router.post("/add-lead", async (req, res) => {
  try {
    const { course_id, name, email, phone_number, linkedin_profile } = req.body;

    // Generate a random lead ID
    const lead_id = generateRandomLeadId();

    // Insert new lead into Leads table
    const query = await sql`
      INSERT INTO Leads (lead_id, course_id, name, email, phone_number, linkedin_profile)
      VALUES (${lead_id}, ${course_id}, ${name}, ${email}, ${phone_number}, ${linkedin_profile});
    `;

    let maxId = await sql`SELECT MAX(student_id) as max FROM Students;`;
    maxId = maxId[0].max || 10000000;

    query = await sql`
    Insert into Students values(${maxId + 1},  ${name}, ${linkedin_profile})
    `;

    res.status(200).json({ message: "Lead added successfully" });
  } catch (error) {
    res.status(500).json({ error: "Internal Server Error" });
  }
});

router.put("/update-lead/:leadId", async (req, res) => {
  try {
    const leadId = req.params.leadId;
    const { status } = req.body;

    // Update lead status in Leads table
    const updateLeadStatusQuery = await sql`
      UPDATE Leads
      SET status = ${status}
      WHERE lead_id = ${leadId};
    `;

    // Check if the status is confirmed
    if (status === "Confirmed") {
      // Get lead details
      const lead = await sql`
        SELECT * FROM Leads WHERE lead_id = ${leadId};
      `;

      // Insert into Enrollments table
      const enrollmentId = await sql`
        INSERT INTO Enrollments (course_id, student_id)
        VALUES (${lead[0].course_id}, ${lead[0].lead_id});
      `;

      // Update max_seats in Courses table
      const updateSeatsQuery = await sql`
        UPDATE Courses
        SET max_seats = max_seats - 1
        WHERE course_id = ${lead[0].course_id};
      `;
    }

    res.status(200).json({ message: "Lead updated successfully" });
  } catch (error) {
    res.status(500).json({ error: "Internal Server Error" });
  }
});

router.post("/comments", async (req, res) => {
  try {
    const { leadId, comment } = req.body;
    const query = await sql`
      INSERT INTO Comments (lead_id, comment_text)
      VALUES (${leadId}, ${comment});
    `;

    res.json({ message: "Comment added successfully", data: query });
  } catch (error) {
    res.status(500).json({ error: "Internal Server Error" });
  }
});

router.get("/leads/search", async (req, res) => {
  try {
    const { name, email } = req.query;

    // Implement logic to search leads by name or email
    const leads = await sql`
      SELECT * FROM Leads
      WHERE name ILIKE ${name || "%"}
      AND email ILIKE ${email || "%"};
    `;

    res.json({ message: "Leads found successfully", data: leads });
  } catch (error) {
    res.status(500).json({ error: "Internal Server Error" });
  }
});

module.exports = router;
