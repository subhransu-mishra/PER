const contactController = require("../controllers/contactController");

const express = require("express");
const router = express.Router();

router.post("/new-contact", contactController.createContact);

module.exports = router;
