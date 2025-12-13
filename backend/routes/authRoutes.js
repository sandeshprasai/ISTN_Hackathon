const express = require("express");
const loginValidation = require("./../middlewares/loginValidation");
const loginController = require("../controllers/loginController");

const authRouter = express.Router();

authRouter.post("/admin-login", loginValidation, loginController);

module.exports = authRouter;