-- Railway MySQL Database Setup
CREATE TABLE IF NOT EXISTS inventory (
  id INT AUTO_INCREMENT PRIMARY KEY,
  vendor VARCHAR(255),
  vendor_id VARCHAR(255),
  lot_number VARCHAR(255),
  item_type VARCHAR(255),
  item_material VARCHAR(255),
  manufacture_date DATE,
  install_date DATE,
  warranty_period VARCHAR(255),
  rail_pole_number VARCHAR(255),
  inspector_code VARCHAR(255),
  inspection_date DATE,
  defect_type VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insert sample data for testing
INSERT INTO inventory (vendor, vendor_id, lot_number, item_type, item_material, manufacture_date, install_date, warranty_period, rail_pole_number) VALUES
('ABC Railways', '101', 'LOT001', 'Rail Clips', 'Steel', '2024-01-15', '2024-02-01', '5 Years', 'RP001'),
('XYZ Components', '102', 'LOT002', 'Rubber Pad', 'Rubber', '2024-01-20', '2024-02-05', '2 Years', 'RP002'),
('DEF Industries', '103', 'LOT003', 'Sleeper', 'Concrete', '2024-01-25', '2024-02-10', '7 Years', 'RP003');