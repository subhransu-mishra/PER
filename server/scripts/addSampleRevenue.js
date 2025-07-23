const mongoose = require('mongoose');
const Revenue = require('../models/revenue');

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/per', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const sampleRevenueData = [
  {
    date: new Date('2024-01-15'),
    clientName: 'ABC Corp',
    companyName: 'ABC Corporation',
    amount: 50000,
    source: 'sales',
    receivedThrough: 'bank',
    description: 'Product sales revenue',
    status: 'received',
    organizationId: new mongoose.Types.ObjectId('60f1b2b3c4d5e6f7a8b9c0d1'), // Replace with actual org ID
    tenantId: new mongoose.Types.ObjectId('60f1b2b3c4d5e6f7a8b9c0d2'), // Replace with actual tenant ID
  },
  {
    date: new Date('2024-01-20'),
    clientName: 'XYZ Ltd',
    companyName: 'XYZ Limited',
    amount: 75000,
    source: 'services',
    receivedThrough: 'UPI',
    description: 'Consulting services revenue',
    status: 'received',
    organizationId: new mongoose.Types.ObjectId('60f1b2b3c4d5e6f7a8b9c0d1'),
    tenantId: new mongoose.Types.ObjectId('60f1b2b3c4d5e6f7a8b9c0d2'),
  },
  {
    date: new Date('2024-02-10'),
    clientName: 'Tech Solutions',
    companyName: 'Tech Solutions Inc',
    amount: 120000,
    source: 'investment',
    receivedThrough: 'bank',
    description: 'Investment funding',
    status: 'received',
    organizationId: new mongoose.Types.ObjectId('60f1b2b3c4d5e6f7a8b9c0d1'),
    tenantId: new mongoose.Types.ObjectId('60f1b2b3c4d5e6f7a8b9c0d2'),
  },
  {
    date: new Date('2024-02-15'),
    clientName: 'Global Services',
    companyName: 'Global Services Ltd',
    amount: 30000,
    source: 'others',
    receivedThrough: 'card',
    description: 'Other revenue source',
    status: 'pending',
    organizationId: new mongoose.Types.ObjectId('60f1b2b3c4d5e6f7a8b9c0d1'),
    tenantId: new mongoose.Types.ObjectId('60f1b2b3c4d5e6f7a8b9c0d2'),
  },
  {
    date: new Date('2024-03-05'),
    clientName: 'Innovation Hub',
    companyName: 'Innovation Hub Pvt Ltd',
    amount: 85000,
    source: 'sales',
    receivedThrough: 'bank',
    description: 'Product sales Q1',
    status: 'received',
    organizationId: new mongoose.Types.ObjectId('60f1b2b3c4d5e6f7a8b9c0d1'),
    tenantId: new mongoose.Types.ObjectId('60f1b2b3c4d5e6f7a8b9c0d2'),
  }
];

async function addSampleData() {
  try {
    console.log('Adding sample revenue data...');
    
    // Clear existing data (optional)
    // await Revenue.deleteMany({});
    
    // Insert sample data
    const result = await Revenue.insertMany(sampleRevenueData);
    console.log(`Successfully added ${result.length} revenue records`);
    
    // Verify the data
    const count = await Revenue.countDocuments({});
    console.log(`Total revenue records in database: ${count}`);
    
    // Show breakdown by source
    const sourceBreakdown = await Revenue.aggregate([
      {
        $group: {
          _id: '$source',
          count: { $sum: 1 },
          totalAmount: { $sum: '$amount' }
        }
      },
      { $sort: { totalAmount: -1 } }
    ]);
    
    console.log('Revenue by source:');
    sourceBreakdown.forEach(item => {
      console.log(`- ${item._id}: ₹${item.totalAmount.toLocaleString()} (${item.count} records)`);
    });
    
  } catch (error) {
    console.error('Error adding sample data:', error);
  } finally {
    mongoose.connection.close();
  }
}

addSampleData();
