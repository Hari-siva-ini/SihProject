# MongoDB Setup Guide

## Prerequisites
1. Install MongoDB Community Server from https://www.mongodb.com/try/download/community
2. Start MongoDB service

## Installation Steps

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Start MongoDB service:**
   - Windows: MongoDB should start automatically after installation
   - Or manually: `net start MongoDB`

3. **Initialize database with sample data:**
   ```bash
   npm run init-db
   ```

4. **Start the server:**
   ```bash
   npm start
   ```

## Environment Variables
Update your `.env` file:
```
MONGODB_URI=mongodb://localhost:27017/rail_inventory
PORT=5000
INSPECTOR_PASSWORD=rail2025
NODE_ENV=development
```

## Key Changes from MySQL to MongoDB

### Database Connection
- **Before:** MySQL connection with host, port, user, password
- **After:** MongoDB URI connection string

### Data Models
- **Before:** SQL tables with fixed schema
- **After:** Mongoose schemas with flexible documents

### Queries
- **Before:** SQL queries with JOIN operations
- **After:** MongoDB aggregation pipeline and document queries

### Auto-increment IDs
- **Before:** MySQL AUTO_INCREMENT
- **After:** MongoDB ObjectId (_id)

## MongoDB Advantages
- Flexible schema for evolving requirements
- Better performance for read-heavy operations
- Built-in horizontal scaling
- JSON-like document storage
- Rich query language with aggregation framework