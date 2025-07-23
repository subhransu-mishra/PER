const mongoose = require('mongoose');
const User = require('../models/user');
const Revenue = require('../models/revenue');

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/per', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

async function checkUserData() {
  try {
    console.log('Checking user data...');
    
    // Get all users
    const users = await User.find({}).select('email organizationId tenantId');
    console.log('Users in database:');
    users.forEach(user => {
      console.log(`- Email: ${user.email}, OrgID: ${user.organizationId}, TenantID: ${user.tenantId}`);
    });
    
    // Check existing revenue data
    const revenueCount = await Revenue.countDocuments({});
    console.log(`\nExisting revenue records: ${revenueCount}`);
    
    if (revenueCount > 0) {
      const sampleRevenue = await Revenue.findOne({}).select('organizationId tenantId source amount');
      console.log('Sample revenue record:', sampleRevenue);
    }
    
  } catch (error) {
    console.error('Error checking data:', error);
  } finally {
    mongoose.connection.close();
  }
}

checkUserData();
