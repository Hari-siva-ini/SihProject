require("dotenv").config();
const mongoose = require("mongoose");
const Analytics = require('./models/Analytics');

// Connect to MongoDB Atlas
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
  .then(async () => {
    console.log("Connected to MongoDB database.");
    
    // Insert sample analytics data
    const analyticsData = [
      { item_type: 'Rail Clips', total_count: 10000000, defective_count: 2000, warranty_expired_count: 500, pending_inspection_count: 1200 },
      { item_type: 'Rubber Pad', total_count: 8500000, defective_count: 500, warranty_expired_count: 200, pending_inspection_count: 800 },
      { item_type: 'Liner', total_count: 5000000, defective_count: 1000, warranty_expired_count: 300, pending_inspection_count: 600 },
      { item_type: 'Sleeper', total_count: 1500000, defective_count: 150, warranty_expired_count: 50, pending_inspection_count: 400 }
    ];

    await Analytics.deleteMany({});
    await Analytics.insertMany(analyticsData);
    
    console.log("Sample analytics data inserted successfully.");
    process.exit(0);
  })
  .catch(err => {
    console.error("Database connection failed:", err);
    process.exit(1);
  });