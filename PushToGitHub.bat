@echo off
color 0B
echo =======================================================
echo    Deploying "Quiz by Mohit" to GitHub
echo =======================================================
echo.

echo Initialize Git Repository...
git init

echo Adding all project files (ignoring node_modules)...
git add .

echo Committing the code...
git commit -m "Initial release: Quiz by Mohit with 2000 questions and meme sounds"

echo Setting main branch...
git branch -M main

echo Linking to your GitHub repository...
git remote add origin https://github.com/dwivedi-mohit/fun-quiz.git

echo Pushing code to GitHub...
git push -u origin main --force

echo.
echo =======================================================
echo    SUCCESS! Your code is now live on GitHub!
echo    Check: https://github.com/dwivedi-mohit/fun-quiz
echo =======================================================
pause
