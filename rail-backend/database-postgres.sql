-- PostgreSQL Database Schema for RailQR Project

-- Create inventory table
CREATE TABLE IF NOT EXISTS inventory (
    id SERIAL PRIMARY KEY,
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

-- Insert sample data
INSERT INTO inventory (
    vendor, vendor_id, lot_number, item_type, item_material,
    manufacture_date, install_date, warranty_period, rail_pole_number,
    inspector_code, inspection_date, defect_type
) VALUES 
('ABC Steel Ltd', 'V001', 'LOT2024001', 'Rail Clips', 'Steel Alloy', '2024-01-15', '2024-02-01', '5 Years', 'RP001', 'INS001', '2024-02-15', NULL),
('XYZ Materials', 'V002', 'LOT2024002', 'Rubber Pad', 'EPDM Rubber', '2024-01-20', '2024-02-05', '2 Years', 'RP002', 'INS002', '2024-02-20', NULL),
('DEF Components', 'V003', 'LOT2024003', 'Sleeper', 'Concrete', '2024-01-25', '2024-02-10', '7 Years', 'RP003', 'INS001', '2024-02-25', 'Minor crack'),
('GHI Industries', 'V004', 'LOT2024004', 'Liner', 'Plastic Composite', '2024-02-01', '2024-02-15', '1 Year', 'RP004', 'INS003', '2024-03-01', NULL),
('JKL Manufacturing', 'V005', 'LOT2024005', 'Rail Clips', 'Carbon Steel', '2024-02-05', '2024-02-20', '5 Years', 'RP005', 'INS002', '2024-03-05', NULL);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_inventory_item_type ON inventory(item_type);
CREATE INDEX IF NOT EXISTS idx_inventory_vendor ON inventory(vendor);
CREATE INDEX IF NOT EXISTS idx_inventory_created_at ON inventory(created_at);
CREATE INDEX IF NOT EXISTS idx_inventory_install_date ON inventory(install_date);