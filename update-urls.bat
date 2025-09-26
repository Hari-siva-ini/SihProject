@echo off
echo 🔧 Update Deployment URLs
echo.

set /p BACKEND_URL="Enter your Railway backend URL (e.g., https://railqr-backend.railway.app): "
set /p FRONTEND_URL="Enter your Netlify frontend URL (e.g., https://railqr-app.netlify.app): "

echo.
echo Updating environment files...

echo REACT_APP_API_URL=%BACKEND_URL% > railtrack-insight\.env.production
echo REACT_APP_BASE_URL=%FRONTEND_URL% >> railtrack-insight\.env.production

echo.
echo ✅ URLs updated in .env.production
echo.
echo Next: Deploy to Netlify and Render with these URLs
pause