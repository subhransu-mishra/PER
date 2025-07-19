const contactController = require("../controllers/contactController");

const express = require("express");
const router = express.Router();
const authMiddleware = require("../middlewares/auth");

router.post("/new-contact", authMiddleware, contactController.createContact);
module.exports = router;
