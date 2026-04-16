#!/bin/bash

# Family Clinic System - Backup Script
# Creates a backup of the MongoDB database and important files

set -e

echo "🏥 Family Clinic System Backup"
echo "=============================="

BACKUP_DIR="./backups"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
BACKUP_NAME="clinic_backup_${TIMESTAMP}"

# Create backup directory
mkdir -p "$BACKUP_DIR"

echo ""
echo "Creating backup: $BACKUP_NAME"
echo ""

# Check if MongoDB is available
if command -v mongodump >/dev/null 2>&1; then
    echo "Backing up MongoDB database..."
    
    # Get MongoDB URI from .env or use default
    if [ -f "backend/.env" ]; then
        MONGODB_URI=$(grep MONGODB_URI backend/.env | cut -d '=' -f2)
    fi
    
    if [ -z "$MONGODB_URI" ]; then
        MONGODB_URI="mongodb://localhost:27017/clinic_db"
    fi
    
    # Extract database name from URI
    DB_NAME=$(echo "$MONGODB_URI" | grep -oP '/\K[^?]+')
    
    if [ -z "$DB_NAME" ]; then
        DB_NAME="clinic_db"
    fi
    
    mongodump --uri="$MONGODB_URI" --out="$BACKUP_DIR/$BACKUP_NAME/mongodb"
    echo "✓ MongoDB backup complete"
else
    echo "⚠ mongodump not found, skipping database backup"
fi

# Backup environment files
echo "Backing up configuration files..."
mkdir -p "$BACKUP_DIR/$BACKUP_NAME/config"

if [ -f "backend/.env" ]; then
    cp backend/.env "$BACKUP_DIR/$BACKUP_NAME/config/backend.env"
fi

if [ -f "frontend/.env" ]; then
    cp frontend/.env "$BACKUP_DIR/$BACKUP_NAME/config/frontend.env"
fi

if [ -f "docker-compose.yml" ]; then
    cp docker-compose.yml "$BACKUP_DIR/$BACKUP_NAME/config/"
fi

echo "✓ Configuration files backed up"

# Create archive
echo ""
echo "Creating compressed archive..."
cd "$BACKUP_DIR"
tar -czf "$BACKUP_NAME.tar.gz" "$BACKUP_NAME"
rm -rf "$BACKUP_NAME"
cd ..

echo "✓ Archive created: $BACKUP_DIR/$BACKUP_NAME.tar.gz"

# List recent backups
echo ""
echo "Recent backups:"
ls -lh "$BACKUP_DIR"/*.tar.gz 2>/dev/null | tail -5 || echo "No previous backups found"

echo ""
echo "✅ Backup completed successfully!"
echo ""
echo "To restore, run:"
echo "  ./scripts/restore.sh $BACKUP_DIR/$BACKUP_NAME.tar.gz"
