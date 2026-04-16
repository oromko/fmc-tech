#!/bin/bash

# Family Clinic System - Restore Script
# Restores the database and configuration from a backup

set -e

echo "🏥 Family Clinic System Restore"
echo "==============================="

if [ -z "$1" ]; then
    echo "Usage: $0 <backup_file.tar.gz>"
    echo ""
    echo "Available backups:"
    ls -lh ./backups/*.tar.gz 2>/dev/null || echo "No backups found in ./backups/"
    exit 1
fi

BACKUP_FILE="$1"

if [ ! -f "$BACKUP_FILE" ]; then
    echo "❌ Error: Backup file not found: $BACKUP_FILE"
    exit 1
fi

echo ""
echo "Restoring from: $BACKUP_FILE"
echo ""

# Create temporary extraction directory
TEMP_DIR=$(mktemp -d)
echo "Extracting backup to temporary directory..."
tar -xzf "$BACKUP_FILE" -C "$TEMP_DIR"

# Find the backup directory name
BACKUP_NAME=$(basename "$BACKUP_FILE" .tar.gz)

# Restore MongoDB database
if [ -d "$TEMP_DIR/$BACKUP_NAME/mongodb" ]; then
    echo ""
    echo "Restoring MongoDB database..."
    
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
    
    # Find the actual dump directory (might have different structure)
    DUMP_DIR=$(find "$TEMP_DIR/$BACKUP_NAME/mongodb" -type d -name "$DB_NAME" | head -1)
    
    if [ -n "$DUMP_DIR" ] && [ -d "$DUMP_DIR" ]; then
        mongorestore --uri="$MONGODB_URI" --drop "$DUMP_DIR"
        echo "✓ MongoDB restore complete"
    else
        echo "⚠ Could not find database dump directory, skipping MongoDB restore"
    fi
else
    echo "⚠ No MongoDB backup found, skipping database restore"
fi

# Restore configuration files
if [ -d "$TEMP_DIR/$BACKUP_NAME/config" ]; then
    echo ""
    echo "Restoring configuration files..."
    
    if [ -f "$TEMP_DIR/$BACKUP_NAME/config/backend.env" ]; then
        cp "$TEMP_DIR/$BACKUP_NAME/config/backend.env" backend/.env
        echo "✓ Backend .env restored"
    fi
    
    if [ -f "$TEMP_DIR/$BACKUP_NAME/config/frontend.env" ]; then
        cp "$TEMP_DIR/$BACKUP_NAME/config/frontend.env" frontend/.env
        echo "✓ Frontend .env restored"
    fi
    
    if [ -f "$TEMP_DIR/$BACKUP_NAME/config/docker-compose.yml" ]; then
        cp "$TEMP_DIR/$BACKUP_NAME/config/docker-compose.yml" docker-compose.yml
        echo "✓ docker-compose.yml restored"
    fi
else
    echo "⚠ No configuration backup found"
fi

# Cleanup
echo ""
echo "Cleaning up temporary files..."
rm -rf "$TEMP_DIR"

echo ""
echo "✅ Restore completed successfully!"
echo ""
echo "Please restart the application for changes to take effect:"
echo "  docker-compose restart"
echo ""
echo "Or if running manually, restart both backend and frontend servers."
