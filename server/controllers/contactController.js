const Contact = require("../models/contact");

const createContact = async (req, res) => {
  try {
    const { FullName, Email, Subject, Message } = req.body;

    // Validate required fields
    if (!FullName || !Email || !Subject || !Message) {
      return res.status(400).json({
        success: false,
        message: "All fields are required.",
      });
    }

    // Validate email format (basic validation)
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(Email)) {
      return res.status(400).json({
        success: false,
        message: "Please provide a valid email address.",
      });
    }

    // Validate field lengths
    if (FullName.trim().length < 2) {
      return res.status(400).json({
        success: false,
        message: "Full name must be at least 2 characters long.",
      });
    }

    if (Subject.trim().length < 3) {
      return res.status(400).json({
        success: false,
        message: "Subject must be at least 3 characters long.",
      });
    }

    if (Message.trim().length < 10) {
      return res.status(400).json({
        success: false,
        message: "Message must be at least 10 characters long.",
      });
    }

    // Create the contact entry
    const contact = new Contact({
      FullName: FullName.trim(),
      Email: Email.trim().toLowerCase(),
      Subject: Subject.trim(),
      Message: Message.trim(),
    });

    await contact.save();

    console.log("New contact message received:", {
      name: FullName,
      email: Email,
      subject: Subject,
    });

    return res.status(201).json({
      success: true,
      message: "Message sent successfully! We'll get back to you soon.",
    });
  } catch (error) {
    console.error("Contact form error:", error);

    // Handle specific database errors
    if (error.name === "ValidationError") {
      const validationErrors = Object.values(error.errors).map(
        (err) => err.message
      );
      return res.status(400).json({
        success: false,
        message: "Validation failed",
        errors: validationErrors,
      });
    }

    // Handle duplicate email or other database constraints
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message:
          "A message with this email was recently submitted. Please wait before sending another message.",
      });
    }

    return res.status(500).json({
      success: false,
      message:
        "We're experiencing technical difficulties. Please try again later.",
    });
  }
};

module.exports = {
  createContact,
};
