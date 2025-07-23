const PDFDocument = require("pdfkit");

// Helper function to format currency
const formatCurrency = (amount) => {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    minimumFractionDigits: 2,
  }).format(amount);
};

// Helper function to format date
const formatDate = (date) => {
  return new Date(date).toLocaleDateString("en-IN", {
    year: "numeric",
    month: "short",
    day: "2-digit",
  });
};

// Helper function to add header
const addHeader = (doc, title, dateRange = null) => {
  doc.fontSize(20).font("Helvetica-Bold").text(title, { align: "center" });
  doc.moveDown(0.5);

  if (dateRange) {
    doc.fontSize(12).font("Helvetica").text(dateRange, { align: "center" });
    doc.moveDown(0.5);
  }

  doc.fontSize(10).text(`Generated on: ${new Date().toLocaleString("en-IN")}`, {
    align: "center",
  });
  doc.moveDown(1);

  // Add a line separator
  doc.moveTo(50, doc.y).lineTo(550, doc.y).stroke();
  doc.moveDown(0.5);
};

// Helper function to add summary
const addSummary = (doc, data, amountField = "amount") => {
  const totalAmount = data.reduce(
    (sum, item) => sum + (item[amountField] || 0),
    0
  );
  const totalCount = data.length;

  doc.moveDown(1);
  doc.moveTo(50, doc.y).lineTo(550, doc.y).stroke();
  doc.moveDown(0.5);

  doc.fontSize(14).font("Helvetica-Bold").text("Summary", { align: "left" });
  doc.moveDown(0.3);

  doc
    .fontSize(12)
    .font("Helvetica")
    .text(`Total Records: ${totalCount}`, { align: "left" })
    .text(`Total Amount: ${formatCurrency(totalAmount)}`, { align: "left" });
};

// Generate Petty Cash PDF
const generatePettyCashPDF = (data, res, dateRange = null) => {
  const doc = new PDFDocument({ margin: 50 });

  // Add PDFKit error logging
  doc.on("error", (err) => {
    console.error("PDFKit error:", err);
  });
  res.on("finish", () => {
    console.log("PDF response sent successfully");
  });

  res.setHeader("Content-Type", "application/pdf");
  res.setHeader(
    "Content-Disposition",
    `attachment; filename=petty-cash-report-${Date.now()}.pdf`
  );

  doc.pipe(res);

  try {
    // Add header
    const title = "Petty Cash Voucher Report";
    addHeader(doc, title, dateRange);

    // Table column positions (x)
    const colX = [50, 80, 140, 200, 260, 340, 410, 470];
    // S.No, Voucher No, Date, Type, Category, Amount, Status, Description
    const colWidths = [30, 60, 60, 60, 80, 70, 60, 100];

    // Table headers
    const startY = doc.y;
    doc.fontSize(10).font("Helvetica-Bold");
    doc.text("S.No", colX[0], startY, { width: colWidths[0], align: "left" });
    doc.text("Voucher No", colX[1], startY, {
      width: colWidths[1],
      align: "left",
    });
    doc.text("Date", colX[2], startY, { width: colWidths[2], align: "left" });
    doc.text("Type", colX[3], startY, { width: colWidths[3], align: "left" });
    doc.text("Category", colX[4], startY, {
      width: colWidths[4],
      align: "left",
    });
    doc.text("Amount", colX[5], startY, {
      width: colWidths[5],
      align: "right",
    });
    doc.text("Status", colX[6], startY, { width: colWidths[6], align: "left" });
    doc.text("Description", colX[7], startY, {
      width: colWidths[7],
      align: "left",
    });

    doc.moveDown(0.5);
    doc
      .moveTo(colX[0], doc.y)
      .lineTo(colX[7] + colWidths[7], doc.y)
      .stroke();
    doc.moveDown(0.3);

    // Table data
    data.forEach((entry, index) => {
      let rowY = doc.y;
      doc.fontSize(9).font("Helvetica");
      // Defensive: use safe defaults for all fields
      const safeVoucherNumber = entry.voucherNumber || "N/A";
      const safeDate = entry.date ? formatDate(entry.date) : "N/A";
      const safeType = entry.transactionType || "N/A";
      const safeCategory = entry.categoryType || "N/A";
      const safeAmount = formatCurrency(entry.amount ?? 0);
      const safeStatus = entry.status || "pending";
      const safeDescription = entry.description || "N/A";

      // Calculate height for each cell
      const cellHeights = [
        doc.heightOfString(`${index + 1}`, { width: colWidths[0] }),
        doc.heightOfString(safeVoucherNumber, { width: colWidths[1] }),
        doc.heightOfString(safeDate, { width: colWidths[2] }),
        doc.heightOfString(safeType, { width: colWidths[3] }),
        doc.heightOfString(safeCategory, { width: colWidths[4] }),
        doc.heightOfString(safeAmount, { width: colWidths[5] }),
        doc.heightOfString(safeStatus, { width: colWidths[6] }),
        doc.heightOfString(safeDescription, { width: colWidths[7] }),
      ];
      const maxHeight = Math.max(...cellHeights);

      // Check if we need a new page
      if (rowY + maxHeight > 750) {
        doc.addPage();
        rowY = doc.y = 50;
      }

      // Render all cells at rowY
      doc.text(`${index + 1}`, colX[0], rowY, {
        width: colWidths[0],
        align: "left",
      });
      doc.text(safeVoucherNumber, colX[1], rowY, {
        width: colWidths[1],
        align: "left",
      });
      doc.text(safeDate, colX[2], rowY, { width: colWidths[2], align: "left" });
      doc.text(safeType, colX[3], rowY, { width: colWidths[3], align: "left" });
      doc.text(safeCategory, colX[4], rowY, {
        width: colWidths[4],
        align: "left",
      });
      doc.text(safeAmount, colX[5], rowY, {
        width: colWidths[5],
        align: "right",
      });
      doc.text(safeStatus, colX[6], rowY, {
        width: colWidths[6],
        align: "left",
      });
      doc.text(safeDescription, colX[7], rowY, {
        width: colWidths[7],
        align: "left",
      });

      // Move y to the next row
      doc.y = rowY + maxHeight + 2;
    });

    // Add summary
    addSummary(doc, data);
  } catch (err) {
    // Write error message in PDF if something goes wrong
    doc.moveDown(2);
    doc
      .fontSize(14)
      .fillColor("red")
      .text("Error generating PDF report.", { align: "center" });
    doc.fontSize(10).fillColor("black").text(err.message, { align: "center" });
  } finally {
    doc.end();
  }
};

// Generate Expense PDF
const generateExpensePDF = (data, res, dateRange = null) => {
  const doc = new PDFDocument({ margin: 50 });

  // Add PDFKit error logging
  doc.on("error", (err) => {
    console.error("PDFKit error:", err);
  });
  res.on("finish", () => {
    console.log("PDF response sent successfully");
  });

  res.setHeader("Content-Type", "application/pdf");
  res.setHeader(
    "Content-Disposition",
    `attachment; filename=expense-report-${Date.now()}.pdf`
  );

  doc.pipe(res);

  try {
    // Add header
    const title = "Expense Report";
    addHeader(doc, title, dateRange);

    // Table headers
    const startY = doc.y;
    doc.fontSize(10).font("Helvetica-Bold");
    doc.text("S.No", 50, startY, { width: 40 });
    doc.text("Serial No", 90, startY, { width: 80 });
    doc.text("Date", 170, startY, { width: 70 });
    doc.text("Category", 240, startY, { width: 80 });
    doc.text("Payment", 320, startY, { width: 60 });
    doc.text("Amount", 380, startY, { width: 70 });
    doc.text("Status", 450, startY, { width: 60 });
    doc.text("Description", 510, startY, { width: 90 });

    doc.moveDown(0.5);
    doc.moveTo(50, doc.y).lineTo(600, doc.y).stroke();
    doc.moveDown(0.3);

    // Table data
    data.forEach((entry, index) => {
      const currentY = doc.y;
      // Defensive: use safe defaults for all fields
      const safeSerial = entry.serialNumber || "N/A";
      const safeDate = entry.date ? formatDate(entry.date) : "N/A";
      const safeCategory = entry.category || "N/A";
      const safePayment = entry.paymentType || "N/A";
      const safeAmount = formatCurrency(entry.amount ?? 0);
      const safeStatus = entry.status || "pending";
      const safeDescription = entry.description || "N/A";

      // Log the entry for debugging
      console.log('Generating row for expense:', entry);

      // Check if we need a new page
      if (currentY > 700) {
        doc.addPage();
        doc.y = 50;
      }

      doc.fontSize(9).font("Helvetica");
      doc.text(`${index + 1}`, 50, doc.y, { width: 40 });
      doc.text(safeSerial, 90, doc.y, { width: 80 });
      doc.text(safeDate, 170, doc.y, { width: 70 });
      doc.text(safeCategory, 240, doc.y, { width: 80 });
      doc.text(safePayment, 320, doc.y, { width: 60 });
      doc.text(safeAmount, 380, doc.y, { width: 70 });
      doc.text(safeStatus, 450, doc.y, { width: 60 });
      doc.text(safeDescription, 510, doc.y, { width: 90 });

      doc.moveDown(0.8);
    });

    // Add summary
    addSummary(doc, data);
  } catch (err) {
    doc.moveDown(2);
    doc
      .fontSize(14)
      .fillColor("red")
      .text("Error generating PDF report.", { align: "center" });
    doc.fontSize(10).fillColor("black").text(err.message, { align: "center" });
  } finally {
    doc.end();
  }
};

// Generate Revenue PDF
const generateRevenuePDF = (data, res, dateRange = null) => {
  const doc = new PDFDocument({ margin: 50 });

  // Add PDFKit error logging
  doc.on("error", (err) => {
    console.error("PDFKit error:", err);
  });
  res.on("finish", () => {
    console.log("PDF response sent successfully");
  });

  res.setHeader("Content-Type", "application/pdf");
  res.setHeader(
    "Content-Disposition",
    `attachment; filename=revenue-report-${Date.now()}.pdf`
  );

  doc.pipe(res);

  try {
    // Add header
    const title = "Revenue Report";
    addHeader(doc, title, dateRange);

    // Table headers
    const startY = doc.y;
    doc.fontSize(10).font("Helvetica-Bold");
    doc.text("S.No", 50, startY, { width: 40 });
    doc.text("Date", 90, startY, { width: 70 });
    doc.text("Client", 160, startY, { width: 80 });
    doc.text("Company", 240, startY, { width: 80 });
    doc.text("Source", 320, startY, { width: 60 });
    doc.text("Payment", 380, startY, { width: 60 });
    doc.text("Amount", 440, startY, { width: 70 });
    doc.text("Status", 510, startY, { width: 60 });

    doc.moveDown(0.5);
    doc.moveTo(50, doc.y).lineTo(570, doc.y).stroke();
    doc.moveDown(0.3);

    // Table data
    data.forEach((entry, index) => {
      const currentY = doc.y;
      // Defensive: use safe defaults for all fields
      const safeDate = entry.date ? formatDate(entry.date) : "N/A";
      const safeClient = entry.clientName || "N/A";
      const safeCompany = entry.companyName || "N/A";
      const safeSource = entry.source || "N/A";
      const safePayment = entry.receivedThrough || entry.paymentMethod || "N/A";
      const safeAmount = formatCurrency(entry.amount ?? 0);
      const safeStatus = entry.status || "pending";
      const safeDescription = entry.description || "";

      // Check if we need a new page
      if (currentY > 700) {
        doc.addPage();
        doc.y = 50;
      }

      doc.fontSize(9).font("Helvetica");
      doc.text(`${index + 1}`, 50, doc.y, { width: 40 });
      doc.text(safeDate, 90, doc.y, { width: 70 });
      doc.text(safeClient, 160, doc.y, { width: 80 });
      doc.text(safeCompany, 240, doc.y, { width: 80 });
      doc.text(safeSource, 320, doc.y, { width: 60 });
      doc.text(safePayment, 380, doc.y, { width: 60 });
      doc.text(safeAmount, 440, doc.y, { width: 70 });
      doc.text(safeStatus, 510, doc.y, { width: 60 });

      doc.moveDown(0.5);

      // Add description on next line if it exists
      if (safeDescription) {
        doc.fontSize(8).font("Helvetica-Oblique");
        doc.text(`Description: ${safeDescription}`, 90, doc.y, { width: 480 });
        doc.moveDown(0.3);
      }

      doc.moveDown(0.3);
    });

    // Add summary
    addSummary(doc, data);
  } catch (err) {
    doc.moveDown(2);
    doc
      .fontSize(14)
      .fillColor("red")
      .text("Error generating PDF report.", { align: "center" });
    doc.fontSize(10).fillColor("black").text(err.message, { align: "center" });
  } finally {
    doc.end();
  }
};

module.exports = {
  generatePettyCashPDF,
  generateExpensePDF,
  generateRevenuePDF,
};
