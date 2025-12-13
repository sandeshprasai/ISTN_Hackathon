const accidentRouter = require("./routes/accidentRoutes");

const express = require("express");
require("dotenv").config();
const databaseConnection = require("./config/dbConfig");
const app = express();
const port = process.env.PORT || 5000;

databaseConnection();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/api/v1/accidents", accidentRouter);

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
