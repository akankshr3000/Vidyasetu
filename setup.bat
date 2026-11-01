@echo off
echo Setting up VidyaSetu AI Chatbot...

echo.
echo Installing backend dependencies...
cd backend
python -m venv venv
call venv\Scripts\activate
pip install -r requirements.txt
echo Backend ready!

echo.
echo Installing frontend dependencies...
cd ..\frontend
npm install
echo Frontend ready!

echo.
echo Setup complete! Now:
echo 1. Edit backend\.env and add your ANTHROPIC_API_KEY
echo 2. Run: cd backend ^&^& venv\Scripts\activate ^&^& uvicorn main:app --reload
echo 3. In another terminal: cd frontend ^&^& npm run dev
echo 4. Open http://localhost:5173
pause
