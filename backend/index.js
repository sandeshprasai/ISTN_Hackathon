const accidentRouter = require("./routes/accidentRoutes");
const databaseConnection = require("./config/dbConfig");
const cors = require("cors");

const express = require("express");
require("dotenv").config();

const app = express();
const port = process.env.PORT || 5000;

databaseConnection();

app.use(
  cors({
    origin: ["http://localhost:3000"],
    credentials: true,
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/api/v1/accidents", accidentRouter);

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
