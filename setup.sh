#!/bin/bash
echo "🚀 Setting up VidyaSetu AI Chatbot..."

# Backend
echo "\n📦 Installing backend dependencies..."
cd backend
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt
echo "✅ Backend ready"

# Frontend
echo "\n📦 Installing frontend dependencies..."
cd ../frontend
npm install
echo "✅ Frontend ready"

echo "\n✨ Setup complete! Now:"
echo "1. Edit backend/.env and add your ANTHROPIC_API_KEY"
echo "2. Run: cd backend && source venv/bin/activate && uvicorn main:app --reload"
echo "3. In another terminal: cd frontend && npm run dev"
echo "4. Open http://localhost:5173"
