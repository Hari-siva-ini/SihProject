# MongoDB Atlas Setup Guide

## 1. Create MongoDB Atlas Account
- Go to https://www.mongodb.com/atlas
- Sign up for free account

## 2. Create Cluster
- Click "Build a Database"
- Choose "FREE" shared cluster
- Select cloud provider and region
- Click "Create Cluster"

## 3. Setup Database Access
- Go to "Database Access" in left sidebar
- Click "Add New Database User"
- Choose "Password" authentication
- Create username and password
- Set role to "Atlas Admin"

## 4. Setup Network Access
- Go to "Network Access" in left sidebar
- Click "Add IP Address"
- Choose "Allow Access from Anywhere" (0.0.0.0/0)
- Or add your specific IP address

## 5. Get Connection String
- Go to "Database" in left sidebar
- Click "Connect" on your cluster
- Choose "Connect your application"
- Copy the connection string

## 6. Update .env File
Replace the MONGODB_URI in your .env file:
```
MONGODB_URI=mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/rail_inventory?retryWrites=true&w=majority
```

Replace:
- `username` with your database username
- `password` with your database password
- `cluster0.xxxxx.mongodb.net` with your actual cluster URL

## 7. Deploy Steps
```bash
npm install
npm run init-db
npm start
```

## Benefits of Atlas
- Automatic backups
- Built-in security
- Global clusters
- Easy scaling
- Monitoring and alerts
- No server maintenance