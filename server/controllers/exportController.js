const PettyCash = require("../models/pettycash");
const Expense = require("../models/expense");
const Revenue = require("../models/revenue");
const PDFDocument = require("pdfkit");
const {
  generatePettyCashPDF,
  // generateRevenuePDF is now implemented in this file
} = require("../utils/pdfGenerator");

// Helper function to format date range for display
const formatDateRange = (from, to) => {
  if (!from || !to) return null;
  const fromDate = new Date(from).toLocaleDateString("en-IN");
  const toDate = new Date(to).toLocaleDateString("en-IN");
  return `Report Period: ${fromDate} to ${toDate}`;
};

// Helper function to build date query
const buildDateQuery = (from, to) => {
  const query = {};
  if (from && to) {
    query.date = {
      $gte: new Date(from),
      $lte: new Date(to),
    };
  }
  return query;
};

// Export Petty Cash PDF
const exportPettyCash = async (req, res) => {
  try {
    const organizationId = req.user.organizationId;
    const { from, to } = req.query;

    const query = {
      organizationId,
      ...buildDateQuery(from, to),
    };

    const vouchers = await PettyCash.find(query)
      .populate("createdBy", "name email")
      .sort({ date: -1 });

    if (!vouchers.length) {
      return res.status(404).json({
        message: "No petty cash vouchers found for the specified criteria",
      });
    }

    const dateRange = formatDateRange(from, to);
    generatePettyCashPDF(vouchers, res, dateRange);
  } catch (err) {
    console.error("Petty Cash PDF Export Error:", err);
    res.status(500).json({ message: "Failed to export petty cash PDF" });
  }
};

// Export Expenses PDF
const exportExpenses = async (req, res) => {
  try {
    const organizationId = req.user.organizationId;
    const { from, to } = req.query;

    const query = {
      organizationId,
      ...buildDateQuery(from, to),
    };

    const expenses = await Expense.find(query)
      .populate("createdBy", "name email")
      .sort({ date: -1 });

    if (!expenses.length) {
      return res.status(404).json({
        message: "No expenses found for the specified criteria",
      });
    }

    // --- Inlined PDF Generation for Expenses ---
    const doc = new PDFDocument({ margin: 50, size: "A4" });

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="expense-report.pdf"`
    );
    doc.pipe(res);

    // Header
    doc
      .fontSize(20)
      .font("Helvetica-Bold")
      .text("Expense Report", { align: "center" });
    doc.moveDown();

    const dateRangeText = formatDateRange(from, to);
    if (dateRangeText) {
      doc
        .fontSize(10)
        .font("Helvetica")
        .text(dateRangeText, { align: "center" });
    }
    doc
      .fontSize(10)
      .font("Helvetica")
      .text(`Generated on: ${new Date().toLocaleString("en-IN")}`, {
        align: "center",
      });
    doc.moveDown(2);

    // Table
    const tableTop = doc.y;
    const tableHeaders = [
      "S.No",
      "Date",
      "Category",
      "Vendor",
      "Payment",
      "Amount",
      "Status",
    ];
    const columnWidths = [30, 70, 80, 80, 70, 70, 50];
    const columnPositions = [50];
    for (let i = 0; i < columnWidths.length - 1; i++) {
      columnPositions.push(columnPositions[i] + columnWidths[i] + 10);
    }

    // Draw Header
    doc.font("Helvetica-Bold");
    tableHeaders.forEach((header, i) => {
      doc.text(header, columnPositions[i], tableTop, {
        width: columnWidths[i],
        align: "left",
      });
    });
    const headerBottom = doc.y;
    doc.moveTo(50, headerBottom).lineTo(570, headerBottom).stroke();
    doc.font("Helvetica");
    let y = headerBottom + 10;

    let totalAmount = 0;

    // Draw Rows
    expenses.forEach((expense, index) => {
      const amount = expense.amount || 0;
      const rowData = [
        index + 1,
        new Date(expense.date).toLocaleDateString("en-GB", {
          day: "2-digit",
          month: "short",
          year: "numeric",
        }),
        expense.category || "N/A",
        expense.vendor || "N/A",
        expense.paymentMethod || "N/A",
        `₹${amount.toLocaleString("en-IN", {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        })}`,
        expense.status || "Paid",
      ];

      const rowHeight = Math.max(
        ...rowData.map((cell, i) =>
          doc.heightOfString(cell.toString(), { width: columnWidths[i] })
        )
      );

      if (y + rowHeight > 750) {
        // Check for page break
        doc.addPage();
        y = 50;
      }

      rowData.forEach((cell, i) => {
        doc.text(cell.toString(), columnPositions[i], y, {
          width: columnWidths[i],
          align: "left",
        });
      });

      y += rowHeight + 5;

      if (expense.description) {
        doc
          .fontSize(8)
          .font("Helvetica-Oblique")
          .text(`Description: ${expense.description}`, columnPositions[1], y, {
            width: 400,
          });
        y += 20; // Space for description
      } else {
        y += 5;
      }

      totalAmount += amount;
    });

    // Summary
    doc.moveTo(50, y).lineTo(570, y).stroke();
    y += 10;
    doc.font("Helvetica-Bold").fontSize(12).text("Summary", 50, y);
    y += 20;
    doc
      .font("Helvetica")
      .fontSize(10)
      .text(`Total Records: ${expenses.length}`, 50, y);
    y += 15;
    doc.text(
      `Total Amount: ₹${totalAmount.toLocaleString("en-IN", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      })}`,
      50,
      y
    );

    doc.end();
    // --- End of Inlined PDF Generation ---
  } catch (err) {
    console.error("Expense PDF Export Error:", err);
    res.status(500).json({ message: "Failed to export expense PDF" });
  }
};

// Export Revenue PDF
const exportRevenue = async (req, res) => {
  try {
    const organizationId = req.user.organizationId;
    const { from, to } = req.query;

    const query = {
      organizationId,
      ...buildDateQuery(from, to),
    };

    const revenues = await Revenue.find(query)
      .populate("createdBy", "name email")
      .sort({ date: -1 });

    if (!revenues.length) {
      return res.status(404).json({
        message: "No revenue records found for the specified criteria",
      });
    }

    // --- Inlined PDF Generation for Revenue ---
    const doc = new PDFDocument({ margin: 50, size: "A4" });

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="revenue-report.pdf"`
    );
    doc.pipe(res);

    // Header
    doc
      .fontSize(20)
      .font("Helvetica-Bold")
      .text("Revenue Report", { align: "center" });
    doc.moveDown();

    const dateRangeText = formatDateRange(from, to);
    if (dateRangeText) {
      doc
        .fontSize(10)
        .font("Helvetica")
        .text(dateRangeText, { align: "center" });
    }
    doc
      .fontSize(10)
      .font("Helvetica")
      .text(`Generated on: ${new Date().toLocaleString("en-IN")}`, {
        align: "center",
      });
    doc.moveDown(2);

    // Table
    const tableTop = doc.y;
    const tableHeaders = [
      "S.No",
      "Date",
      "Client",
      "Company",
      "Source",
      "Payment",
      "Amount",
      "Status",
    ];
    const columnWidths = [30, 70, 70, 60, 60, 60, 70, 50];
    const columnPositions = [50];
    for (let i = 0; i < columnWidths.length - 1; i++) {
      columnPositions.push(columnPositions[i] + columnWidths[i] + 10);
    }

    // Draw Header
    doc.font("Helvetica-Bold");
    tableHeaders.forEach((header, i) => {
      doc.text(header, columnPositions[i], tableTop, {
        width: columnWidths[i],
        align: "left",
      });
    });
    const headerBottom = doc.y;
    doc.moveTo(50, headerBottom).lineTo(570, headerBottom).stroke();
    doc.font("Helvetica");
    let y = headerBottom + 10;

    let totalAmount = 0;

    // Draw Rows
    revenues.forEach((revenue, index) => {
      const rowData = [
        index + 1,
        new Date(revenue.date).toLocaleDateString("en-GB", {
          day: "2-digit",
          month: "short",
          year: "numeric",
        }),
        revenue.clientName,
        revenue.companyName || "N/A",
        revenue.source,
        revenue.paymentMethod,
        `₹${revenue.amount.toLocaleString("en-IN", {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        })}`,
        revenue.status,
      ];

      const rowHeight = Math.max(
        ...rowData.map((cell, i) =>
          doc.heightOfString(cell.toString(), { width: columnWidths[i] })
        )
      );

      if (y + rowHeight > 750) {
        // Check for page break
        doc.addPage();
        y = 50;
      }

      rowData.forEach((cell, i) => {
        doc.text(cell.toString(), columnPositions[i], y, {
          width: columnWidths[i],
          align: "left",
        });
      });

      y += rowHeight + 5;

      doc
        .fontSize(8)
        .font("Helvetica-Oblique")
        .text(`Description: ${revenue.description}`, columnPositions[1], y, {
          width: 400,
        });

      y += 20; // Space for description

      totalAmount += revenue.amount;
    });

    // Summary
    doc.moveTo(50, y).lineTo(570, y).stroke();
    y += 10;
    doc.font("Helvetica-Bold").fontSize(12).text("Summary", 50, y);
    y += 20;
    doc
      .font("Helvetica")
      .fontSize(10)
      .text(`Total Records: ${revenues.length}`, 50, y);
    y += 15;
    doc.text(
      `Total Amount: ₹${totalAmount.toLocaleString("en-IN", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      })}`,
      50,
      y
    );

    doc.end();
    // --- End of Inlined PDF Generation ---
  } catch (err) {
    console.error("Revenue PDF Export Error:", err);
    res.status(500).json({ message: "Failed to export revenue PDF" });
  }
};

module.exports = {
  exportPettyCash,
  exportExpenses,
  exportRevenue,
};
