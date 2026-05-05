@echo off
color 0A
echo =======================================================
echo    Building "Quiz by Mohit" for Production Deployment
echo =======================================================
echo.
echo Compiling and optimizing React app...
call npm run build

echo.
echo =======================================================
echo    BUILD COMPLETE!
echo    Your production-ready app is in the 'dist' folder.
echo =======================================================
pause
