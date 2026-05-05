@echo off
color 0D
echo =======================================================
echo    Deploying "Quiz by Mohit" to Vercel
echo =======================================================
echo.

echo Installing Vercel CLI temporarily to deploy your app...
call npx vercel --prod

echo.
echo =======================================================
echo    If successful, Vercel just gave you a live URL!
echo =======================================================
pause
