@echo off
color 0B
echo =======================================================
echo    Starting Offline Question Generator
echo    (This generates EXACTLY 500 questions per category
echo     mathematically. 0 APIs. 0 Network Requests.)
echo =======================================================
echo.

echo Running ultra-fast offline generation...
call node scripts/generate_offline.js

echo.
echo =======================================================
echo    DONE! 2,000 Questions have been generated and injected 
echo    into src/data/questions.js.
echo =======================================================
pause
