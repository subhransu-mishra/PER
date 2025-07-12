const Contact = require("../models/contact");

const createContact = async (req, res) => {
  const { FullName, Email, Subject, Message } = req.body;
  try {
    if (!FullName || !Email || !Subject || !Message) {
      return res.status(400).json({
        success: false,
        message: "All fields are required.",
      });
    }
    const contact = new Contact({
      FullName,
      Email,
      Subject,
      Message,
    });
    await contact.save();
    return res.status(201).json({
      success: true,
      message: "Contact created successfully.",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Internal server error.",
    });
  }
};

module.exports = {
  createContact,
};
