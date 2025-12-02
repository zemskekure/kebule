#!/bin/bash

# Signal Lite - Setup Script
# This script helps you set up Signal Lite quickly

set -e

echo "🚀 Signal Lite Setup"
echo "===================="
echo ""

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check Node.js
echo "Checking Node.js..."
if ! command -v node &> /dev/null; then
    echo -e "${RED}❌ Node.js not found. Please install Node.js 18+ first.${NC}"
    exit 1
fi

NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 18 ]; then
    echo -e "${RED}❌ Node.js version 18+ required. You have $(node -v)${NC}"
    exit 1
fi

echo -e "${GREEN}✓ Node.js $(node -v) found${NC}"
echo ""

# Backend setup
echo "📦 Setting up backend..."
cd backend

if [ ! -f "package.json" ]; then
    echo -e "${RED}❌ backend/package.json not found${NC}"
    exit 1
fi

npm install
echo -e "${GREEN}✓ Backend dependencies installed${NC}"

if [ ! -f ".env" ]; then
    cp .env.example .env
    echo -e "${YELLOW}⚠️  Created backend/.env - YOU NEED TO EDIT THIS FILE${NC}"
    NEED_CONFIG=true
else
    echo -e "${GREEN}✓ Backend .env already exists${NC}"
fi

cd ..

# Frontend setup
echo ""
echo "📦 Setting up frontend..."
cd frontend

if [ ! -f "package.json" ]; then
    echo -e "${RED}❌ frontend/package.json not found${NC}"
    exit 1
fi

npm install
echo -e "${GREEN}✓ Frontend dependencies installed${NC}"

if [ ! -f ".env" ]; then
    cp .env.example .env
    echo -e "${YELLOW}⚠️  Created frontend/.env - YOU NEED TO EDIT THIS FILE${NC}"
    NEED_CONFIG=true
else
    echo -e "${GREEN}✓ Frontend .env already exists${NC}"
fi

cd ..

# Summary
echo ""
echo "===================="
echo -e "${GREEN}✅ Setup complete!${NC}"
echo ""

if [ "$NEED_CONFIG" = true ]; then
    echo -e "${YELLOW}⚠️  NEXT STEPS:${NC}"
    echo ""
    echo "1. Get Google OAuth Client ID:"
    echo "   https://console.cloud.google.com/"
    echo ""
    echo "2. Edit backend/.env and add:"
    echo "   GOOGLE_CLIENT_ID=your-client-id.apps.googleusercontent.com"
    echo "   ALLOWED_DOMAINS=ambiente.cz,amanual.cz"
    echo ""
    echo "3. Edit frontend/.env and add:"
    echo "   VITE_GOOGLE_CLIENT_ID=your-client-id.apps.googleusercontent.com"
    echo "   VITE_API_URL=http://localhost:3001"
    echo ""
    echo "4. Start backend:"
    echo "   cd backend && npm start"
    echo ""
    echo "5. Start frontend (new terminal):"
    echo "   cd frontend && npm run dev"
    echo ""
    echo "6. Open http://localhost:5173"
    echo ""
    echo "See QUICKSTART.md for detailed instructions."
else
    echo "To start the app:"
    echo ""
    echo "1. Start backend:"
    echo "   cd backend && npm start"
    echo ""
    echo "2. Start frontend (new terminal):"
    echo "   cd frontend && npm run dev"
    echo ""
    echo "3. Open http://localhost:5173"
fi

echo ""
echo "===================="
