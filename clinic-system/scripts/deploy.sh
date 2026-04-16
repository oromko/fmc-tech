#!/bin/bash

# Family Clinic System - Deployment Script
# Automates the deployment process for the clinic management system

set -e  # Exit on error

echo "🏥 Family Clinic System Deployment"
echo "=================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if running in clinic-system directory
if [ ! -f "docker-compose.yml" ]; then
    echo -e "${RED}Error: Please run this script from the clinic-system directory${NC}"
    exit 1
fi

# Function to check if command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Check prerequisites
echo -e "\n${YELLOW}Checking prerequisites...${NC}"

if ! command_exists node; then
    echo -e "${RED}Node.js is not installed. Please install Node.js v16+${NC}"
    exit 1
fi

if ! command_exists npm; then
    echo -e "${RED}npm is not installed. Please install npm${NC}"
    exit 1
fi

if command_exists docker; then
    HAS_DOCKER=true
    echo -e "${GREEN}✓ Docker found${NC}"
else
    HAS_DOCKER=false
    echo -e "${YELLOW}⚠ Docker not found, will use manual setup${NC}"
fi

# Setup backend
echo -e "\n${YELLOW}Setting up backend...${NC}"
cd backend

if [ ! -d "node_modules" ]; then
    echo "Installing backend dependencies..."
    npm install
fi

if [ ! -f ".env" ]; then
    echo "Creating .env file from template..."
    cp .env.example .env
    echo -e "${YELLOW}Please edit backend/.env with your configuration${NC}"
fi

cd ..

# Setup frontend
echo -e "\n${YELLOW}Setting up frontend...${NC}"
cd frontend

if [ ! -d "node_modules" ]; then
    echo "Installing frontend dependencies..."
    npm install
fi

cd ..

# Build frontend for production
echo -e "\n${YELLOW}Building frontend for production...${NC}"
cd frontend
npm run build
cd ..

# Start services
echo -e "\n${YELLOW}Starting services...${NC}"

if [ "$HAS_DOCKER" = true ]; then
    echo "Starting with Docker Compose..."
    docker-compose up -d
    
    echo -e "\n${GREEN}✓ Deployment complete!${NC}"
    echo ""
    echo "Services:"
    echo "  Frontend: http://localhost:5173"
    echo "  Backend:  http://localhost:5000"
    echo ""
    echo "To view logs: docker-compose logs -f"
    echo "To stop:      docker-compose down"
else
    echo "Starting manually..."
    echo ""
    echo -e "${YELLOW}Backend will start on http://localhost:5000${NC}"
    echo -e "${YELLOW}Frontend will start on http://localhost:5173${NC}"
    echo ""
    echo "In terminal 1, run:"
    echo "  cd backend && npm run dev"
    echo ""
    echo "In terminal 2, run:"
    echo "  cd frontend && npm run dev"
fi

echo ""
echo -e "${GREEN}🎉 Deployment successful!${NC}"
echo ""
echo "Next steps:"
echo "1. Create an admin user via registration"
echo "2. Login and configure your clinic settings"
echo "3. Refer to docs/QUICKSTART.md for more information"
