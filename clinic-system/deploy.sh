#!/bin/bash

# Family Medium Clinic System - Deployment Script
# This script builds and starts all Docker containers

set -e

echo "=========================================="
echo "Family Medium Clinic System - Deployment"
echo "=========================================="

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    echo -e "${RED}Error: Docker is not installed${NC}"
    exit 1
fi

if ! command -v docker-compose &> /dev/null; then
    echo -e "${RED}Error: Docker Compose is not installed${NC}"
    exit 1
fi

echo -e "${YELLOW}Stopping existing containers...${NC}"
docker-compose down || true

echo -e "${YELLOW}Building containers...${NC}"
docker-compose build --no-cache

echo -e "${YELLOW}Starting services...${NC}"
docker-compose up -d

echo ""
echo -e "${GREEN}=========================================="
echo "Deployment Complete!"
echo "==========================================${NC}"
echo ""
echo "Services:"
echo "  - MongoDB:    localhost:27017"
echo "  - Backend:    http://localhost:5000"
echo "  - Frontend:   http://localhost:5173"
echo ""
echo "Default Credentials (after seeding):"
echo "  - Admin:        admin / Admin123!"
echo "  - Doctor:       dr_smith / Doctor123!"
echo "  - Lab Tech:     lab_tech / LabTech123!"
echo "  - Receptionist: receptionist / Recept123!"
echo ""
echo "To view logs: docker-compose logs -f"
echo "To stop:      docker-compose down"
echo ""
