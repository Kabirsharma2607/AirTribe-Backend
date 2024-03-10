const router = require("express").Router();

const sql = require("../config/dbConfig");

router.get("/get-all-courses", async (req, res) => {
  try {
    const courses = await sql`
    SELECT
        c.course_id,
        c.name AS course_name,
        i.name AS instructor_name,
        c.max_seats AS seats,
        to_char(c.start_date, 'YYYY-MM-DD') AS start_date
    FROM
        Courses c
    JOIN
        Instructors i ON c.instructor_id = i.instructor_id;
`;
    if (courses) {
      return res.send(courses);
    } else {
      throw new Error("Error fetching all courses");
    }
  } catch (error) {
    res.status(500).send(error);
  }
});

router.post("/add-new-course", async (req, res) => {
  try {
    let maxId = await sql`SELECT MAX(instructor_id) as max FROM Courses;`;
    maxId = maxId[0].max || 10000;
    let { instructorId, name, maxSeats, startDate } = req.body;
    let query = await sql`
    INSERT INTO COURSES VALUES(${
      maxId + 1
    }, ${instructorId}, ${name}, ${maxSeats}, ${startDate});
    `;
    if (query) {
      res.status(200).json({ message: "New Course added Successfully" });
    } else {
      throw new Error("Error inserting data");
    }
  } catch (error) {
    res.status(500).json({ error: "Internal Server Error" });
  }
});
router.put("/update-course/:courseId", async (req, res) => {
  try {
    const courseId = req.params.courseId;
    const name = req.body.name || "";
    const startDate = req.body.startDate || null;
    const seats = req.body.seats || null;
    console.log(req.body);
    let updateFields = [];

    if (name != "") {
      let query =
        await sql` UPDATE Courses SET name = ${name} WHERE course_id = ${courseId};
    `;
      if (!query) {
        return res.status(500).send("Error");
      }
    }

    if (startDate !== null) {
      let query =
        await sql` UPDATE Courses SET start_date = ${startDate} WHERE course_id = ${courseId};
    `;
      if (!query) {
        return res.status(500).send("Error");
      }
    }

    if (seats !== null) {
      let query =
        await sql` UPDATE Courses SET max_seats = ${seats} WHERE course_id = ${courseId};
    `;
      if (!query) {
        return res.status(500).send("Error");
      }
    }

    return res.send("Course Details updated successfully");
  } catch (error) {
    res.status(500).send(error.message || "Internal Server Error");
  }
});

router.delete("/delete-course/:courseId", async (req, res) => {
  try {
    const quer = await sql`
        DELETE FROM Courses WHERE course_id=${req.params.courseId};
        `;
    if (quer) {
      res.send("Deleted Successfully");
    } else {
      throw new Error();
    }
  } catch (error) {
    res.status(500).send(error.message || "Internal Server Error");
  }
});

router.post("/register-course", async (req, res) => {
  try {
    // Get the number of available seats
    let seats = await sql`
    SELECT max_seats AS seats FROM Courses WHERE course_id = ${req.body.courseId};
  `;

    // Check if there are available seats
    if (seats[0].seats === 0) {
      return res.send("Maximum seats have been occupied");
    }

    // Get the maximum enrollment ID
    let maxId = await sql`
    SELECT MAX(enrollment_id) AS max FROM Enrollments;
  `;
    maxId = maxId[0].max || 100;

    // Insert into Enrollments table
    let query = await sql`
    INSERT INTO Enrollments VALUES (${maxId + 1}, ${req.body.courseId}, ${
      req.body.studentId
    });
  `;

    // Check if the insertion was successful
    if (!query) {
      return res.status(500).send("Error");
    }

    // Update available seats in the Courses table
    query = await sql`
    UPDATE Courses SET max_seats = ${seats[0].seats - 1} WHERE course_id = ${
      req.body.courseId
    };
  `;

    // Check if the update was successful
    if (!query) {
      return res.status(500).send("Error");
    } else {
      res.send(
        `Congratulations! You have been successfully enrolled in the Course. Your enrollment ID is ${
          maxId + 1
        }`
      );
    }
  } catch (error) {
    res.status(500).send(error.message || "Internal Server Error");
  }
});

router.get("/get-all-registered", async (req, res) => {
  try {
    let enrollments = await sql`
    SELECT 
      e.enrollment_id AS Enrollments_ID,
      e.student_id AS Student_ID,
      c.name AS Course_Name
    FROM 
      Enrollments e
    JOIN
      Courses c ON e.course_id = c.course_id;
  `;

    // Check if there are enrollments
    if (enrollments.length === 0) {
      return res.send("No enrollments found");
    }

    // Return the enrollments data
    res.json(enrollments);
  } catch (error) {
    res.status(500).send(error.message || "Internal Server Error");
  }
});

module.exports = router;
