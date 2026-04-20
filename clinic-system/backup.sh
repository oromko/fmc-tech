#!/bin/bash

# Family Medium Clinic System - Backup Script
# Creates timestamped MongoDB backups

set -e

echo "=========================================="
echo "Family Clinic System - Database Backup"
echo "=========================================="

BACKUP_DIR="./backups"
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
BACKUP_FILE="${BACKUP_DIR}/clinic_backup_${TIMESTAMP}.gz"

# Create backup directory if it doesn't exist
mkdir -p "$BACKUP_DIR"

# Get MongoDB connection details from docker-compose or use defaults
MONGO_HOST="localhost"
MONGO_PORT="27017"
MONGO_USER="admin"
MONGO_PASS="admin123"
DB_NAME="family_clinic"

echo "Backing up database: ${DB_NAME}"
echo "Backup file: ${BACKUP_FILE}"

# Perform backup using mongodump
docker exec clinic_mongodb mongodump \
  --authenticationDatabase admin \
  -u "${MONGO_USER}" \
  -p "${MONGO_PASS}" \
  --db "${DB_NAME}" \
  --archive | gzip > "${BACKUP_FILE}"

if [ -f "$BACKUP_FILE" ]; then
    BACKUP_SIZE=$(du -h "$BACKUP_FILE" | cut -f1)
    echo ""
    echo "✓ Backup completed successfully!"
    echo "  File: ${BACKUP_FILE}"
    echo "  Size: ${BACKUP_SIZE}"
    
    # Keep only last 10 backups
    cd "$BACKUP_DIR"
    ls -t clinic_backup_*.gz | tail -n +11 | xargs -r rm
    cd - > /dev/null
    
    echo "  (Old backups cleaned up, keeping last 10)"
else
    echo "✗ Backup failed!"
    exit 1
fi

echo ""
echo "To restore: ./restore.sh ${BACKUP_FILE}"
