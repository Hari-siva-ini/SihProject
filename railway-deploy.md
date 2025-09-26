# 🚀 Railway + Netlify Deployment

## Stack
- **Frontend**: Netlify (Free)
- **Backend**: Railway (Free $5 credit)
- **Database**: Railway MySQL (Free)

## Deploy Steps

### 1. Railway Backend + Database
1. Go to [Railway.app](https://railway.app) → Sign up
2. New Project → Add MySQL service
3. Add Web Service → Connect GitHub → Select `rail-backend`
4. Set environment variables:
   ```
   NODE_ENV=production
   DATABASE_URL=${{MySQL.DATABASE_URL}}
   INSPECTOR_PASSWORD=rail2025
   ```
5. Copy backend URL

### 2. Netlify Frontend  
1. Go to [Netlify.com](https://netlify.com) → Sign up
2. New site from Git → Select repo
3. Build settings:
   - Base directory: `railtrack-insight`
   - Build command: `npm run build`
   - Publish directory: `build`
4. Environment variables:
   ```
   REACT_APP_API_URL=<your_railway_backend_url>
   REACT_APP_BASE_URL=<your_netlify_app_url>
   ```

### 3. Database Schema
In Railway MySQL console:
```sql
CREATE TABLE inventory (
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
```

## 💰 Cost: $0/month
- Railway: $5 free credit
- Netlify: Free tier

## 🔗 URLs
- Frontend: `https://your-app.netlify.app`
- Backend: `https://your-app.railway.app`