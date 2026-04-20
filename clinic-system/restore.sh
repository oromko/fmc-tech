#!/bin/bash

# Family Medium Clinic System - Restore Script
# Restores MongoDB from a backup file

set -e

echo "=========================================="
echo "Family Clinic System - Database Restore"
echo "=========================================="

if [ -z "$1" ]; then
    echo "Usage: ./restore.sh <backup_file.gz>"
    echo ""
    echo "Available backups:"
    ls -lh ./backups/*.gz 2>/dev/null || echo "  No backups found in ./backups/"
    exit 1
fi

BACKUP_FILE="$1"

if [ ! -f "$BACKUP_FILE" ]; then
    echo "Error: Backup file not found: ${BACKUP_FILE}"
    exit 1
fi

MONGO_USER="admin"
MONGO_PASS="admin123"
DB_NAME="family_clinic"

echo "WARNING: This will overwrite the current database!"
echo "Backup file: ${BACKUP_FILE}"
echo ""
read -p "Are you sure you want to continue? (yes/no): " CONFIRM

if [ "$CONFIRM" != "yes" ]; then
    echo "Restore cancelled."
    exit 0
fi

echo ""
echo "Restoring database..."

# Decompress and restore
gunzip -c "$BACKUP_FILE" | docker exec -i clinic_mongodb mongorestore \
  --authenticationDatabase admin \
  -u "${MONGO_USER}" \
  -p "${MONGO_PASS}" \
  --db "${DB_NAME}" \
  --archive

echo ""
echo "✓ Restore completed successfully!"
echo "Please restart the backend service to apply changes:"
echo "  docker-compose restart backend"
