@echo off
color 0C
echo =======================================================
echo    Fixing Vercel Deployment...
echo =======================================================
echo.

echo Removing node_modules from GitHub tracking (this takes a few seconds)...
git rm -r --cached node_modules

echo Saving the changes...
git add .gitignore
git commit -m "Fix Vercel deploy: Removed node_modules from Git"

echo Pushing the fix to GitHub...
git push origin main

echo.
echo =======================================================
echo    FIX PUSHED! Vercel is now rebuilding correctly.
echo    Check your Vercel dashboard in 60 seconds!
echo =======================================================
pause
