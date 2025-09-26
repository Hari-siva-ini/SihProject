const mongoose = require('mongoose');

const inventorySchema = new mongoose.Schema({
  vendor: { type: String, required: true },
  vendor_id: { type: String, required: true },
  lot_number: { type: String, required: true },
  item_type: { 
    type: String, 
    required: true,
    enum: ['Rail Clips', 'Rubber Pad', 'Sleeper', 'Liner']
  },
  item_material: { type: String, required: true },
  manufacture_date: { type: Date, required: true },
  install_date: { type: Date },
  warranty_period: { 
    type: String, 
    required: true,
    enum: ['1 Year', '2 Years', '5 Years', '7 Years']
  },
  rail_pole_number: { type: String },
  inspector_code: { type: String },
  inspection_date: { type: Date },
  defect_type: { type: String }
}, {
  timestamps: true
});

module.exports = mongoose.model('Inventory', inventorySchema);