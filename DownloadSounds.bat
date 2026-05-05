@echo off
color 0B
echo =======================================================
echo    Downloading Meme Sounds
echo =======================================================
echo.

if not exist "e:\awsquiz\public\sounds" mkdir "e:\awsquiz\public\sounds"

echo Downloading correct answer sound (faaaaah)...
curl -s -L -o "e:\awsquiz\public\sounds\correct.mp3" "https://www.myinstants.com/media/sounds/faaah.mp3"

echo Downloading wrong answer sound (ghop ghop)...
curl -s -L -o "e:\awsquiz\public\sounds\ghop_ghop.mp3" "https://www.myinstants.com/media/sounds/meow-ghop-ghop-ghop.mp3"

echo Downloading streak sound (kya cheda)...
curl -s -L -o "e:\awsquiz\public\sounds\streak.mp3" "https://www.myinstants.com/media/sounds/kya-cheda-bhosdi.mp3"

echo.
echo =======================================================
echo    SUCCESS! All meme sounds are downloaded and 
echo    automatically named for your React app to play.
echo =======================================================
pause
