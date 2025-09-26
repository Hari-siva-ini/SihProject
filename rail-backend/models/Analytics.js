const mongoose = require('mongoose');

const analyticsSchema = new mongoose.Schema({
  item_type: { type: String, required: true },
  total_count: { type: Number, default: 0 },
  defective_count: { type: Number, default: 0 },
  warranty_expired_count: { type: Number, default: 0 },
  pending_inspection_count: { type: Number, default: 0 }
}, {
  timestamps: true
});

module.exports = mongoose.model('Analytics', analyticsSchema);