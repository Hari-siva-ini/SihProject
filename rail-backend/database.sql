-- Create database
CREATE DATABASE IF NOT EXISTS rail_inventory;
USE rail_inventory;

-- Create inventory table
CREATE TABLE IF NOT EXISTS inventory (
  id INT AUTO_INCREMENT PRIMARY KEY,
  vendor VARCHAR(255) NOT NULL,
  vendor_id VARCHAR(100) NOT NULL,
  lot_number VARCHAR(100) NOT NULL,
  item_type ENUM('Rail Clips', 'Rubber Pad', 'Sleeper', 'Liner') NOT NULL,
  item_material VARCHAR(255) NOT NULL,
  manufacture_date DATE NOT NULL,
  install_date DATE,
  warranty_period ENUM('1 Year', '2 Years', '5 Years', '7 Years') NOT NULL,
  rail_pole_number VARCHAR(100),
  inspector_code VARCHAR(100),
  inspection_date DATE,
  defect_type VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Create analytics table for AI analysis
CREATE TABLE IF NOT EXISTS analytics (
  id INT AUTO_INCREMENT PRIMARY KEY,
  item_type VARCHAR(100),
  total_count INT DEFAULT 0,
  defective_count INT DEFAULT 0,
  warranty_expired_count INT DEFAULT 0,
  pending_inspection_count INT DEFAULT 0,
  last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Insert sample analytics data
INSERT INTO analytics (item_type, total_count, defective_count, warranty_expired_count, pending_inspection_count) VALUES
('Rail Clips', 10000000, 2000, 500, 1200),
('Rubber Pad', 8500000, 500, 200, 800),
('Liner', 5000000, 1000, 300, 600),
('Sleeper', 1500000, 150, 50, 400);