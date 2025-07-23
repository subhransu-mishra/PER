const mongoose = require("mongoose");
const PettyCash = require("./models/pettycash");
const Expense = require("./models/expense");
const Revenue = require("./models/revenue");
const User = require("./models/user");
const Organization = require("./models/organisation");

require("dotenv").config();

async function checkDatabase() {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI, {
      serverSelectionTimeoutMS: 30000,
      socketTimeoutMS: 45000,
      maxPoolSize: 10,
    });
    console.log("Connected to MongoDB");

    // Check organizations
    const orgs = await Organization.find();
    console.log("\n=== ORGANIZATIONS ===");
    console.log(`Total organizations: ${orgs.length}`);
    orgs.forEach(org => {
      console.log(`- ${org.name} (ID: ${org._id})`);
    });

    // Check users
    const users = await User.find();
    console.log("\n=== USERS ===");
    console.log(`Total users: ${users.length}`);
    users.forEach(user => {
      console.log(`- ${user.name} (${user.email}) - Org: ${user.organizationId}`);
    });

    // Check petty cash
    const pettyCash = await PettyCash.find();
    console.log("\n=== PETTY CASH ===");
    console.log(`Total petty cash records: ${pettyCash.length}`);
    pettyCash.slice(0, 3).forEach(pc => {
      console.log(`- ${pc.description} - Amount: ${pc.amount} - Org: ${pc.organizationId} - Status: ${pc.status}`);
    });

    // Check expenses
    const expenses = await Expense.find();
    console.log("\n=== EXPENSES ===");
    console.log(`Total expense records: ${expenses.length}`);
    expenses.slice(0, 3).forEach(exp => {
      console.log(`- ${exp.description} - Amount: ${exp.amount} - Org: ${exp.organizationId} - Status: ${exp.status}`);
    });

    // Check revenue
    const revenue = await Revenue.find();
    console.log("\n=== REVENUE ===");
    console.log(`Total revenue records: ${revenue.length}`);
    revenue.slice(0, 3).forEach(rev => {
      console.log(`- ${rev.description} - Amount: ${rev.amount} - Org: ${rev.organizationId} - Status: ${rev.status}`);
    });

    // Check data distribution by organization
    if (orgs.length > 0) {
      console.log("\n=== DATA BY ORGANIZATION ===");
      for (const org of orgs) {
        const orgPettyCash = await PettyCash.countDocuments({ organizationId: org._id });
        const orgExpenses = await Expense.countDocuments({ organizationId: org._id });
        const orgRevenue = await Revenue.countDocuments({ organizationId: org._id });
        
        console.log(`Organization: ${org.name} (${org._id})`);
        console.log(`  - Petty Cash: ${orgPettyCash}`);
        console.log(`  - Expenses: ${orgExpenses}`);
        console.log(`  - Revenue: ${orgRevenue}`);
      }
    }

  } catch (error) {
    console.error("Error:", error);
  } finally {
    await mongoose.disconnect();
    console.log("\nDisconnected from MongoDB");
  }
}

checkDatabase();
