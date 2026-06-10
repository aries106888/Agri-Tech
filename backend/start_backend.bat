@echo off
echo.
echo  ============================================
echo   ShambaPoint Agri-Tech - Flask Backend
echo  ============================================
echo.
echo  Installing dependencies...
pip install -r requirements.txt
echo.
echo  Starting Flask server on http://localhost:5000
echo  Press CTRL+C to stop the server.
echo.
python app.py
pause
