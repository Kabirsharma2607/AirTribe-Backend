const bodyParser = require("body-parser");
require("dotenv").config();
const express = require("express");
const sql = require("./config/dbConfig");
const app = express();

app.use(express.json());

const port = process.env.PORT || 5000;

const instructorRoute = require("./routes/instructorRoutes");
const userRoute = require("./routes/userRoutes");
const coursesRoute = require("./routes/coursesRoutes");

app.use("/instructor", instructorRoute);
app.use("/user", userRoute);
app.use("/courses", coursesRoute);

app.listen(port, () => {
  console.log(`App is listening on Port: ${port}`);
});
