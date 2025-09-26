# Setup Instructions

## Database Setup
1. Install MySQL and create database:
```sql
CREATE DATABASE rail_inventory;
```

2. Run the SQL script:
```bash
mysql -u root -p rail_inventory < rail-backend/database.sql
```

## Backend Setup
```bash
cd rail-backend
npm install

# Install Python dependencies for ML model
pip install -r requirements.txt

# Place your model.pkl file in the rail-backend directory
npm start
```

## Frontend Setup
```bash
cd railtrack-insight
npm install
npm start
```

## Environment Variables
Update `.env` in rail-backend with your MySQL credentials:
```
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=rail_inventory
PORT=5000
INSPECTOR_PASSWORD=rail2025
```

All pages are now connected to MySQL database:
- QRForm: Creates new inventory items
- DetailsPage: Displays and updates item details
- Inventory: Shows real-time inventory statistics
- AIAnalysis: Displays analytics and insights
- Database: Shows all inventory data in table format