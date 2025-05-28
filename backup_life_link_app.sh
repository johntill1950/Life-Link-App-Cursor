#!/bin/bash
# backup_life_link_app.sh
# Script to back up the life-link-app folder with incremental naming (timestamped)
# Usage: ./backup_life_link_app.sh /path/to/backup/directory

# Exit on error
set -e

# Set source and destination
SOURCE_DIR="$(cd "$(dirname "$0")" && pwd)"
APP_NAME="life-link-app"
BACKUP_DIR="$1"

if [ -z "$BACKUP_DIR" ]; then
  echo "Usage: $0 /path/to/backup/directory"
  exit 1
fi

# Create backup directory if it doesn't exist
mkdir -p "$BACKUP_DIR"

# Create a timestamp
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")

# Set backup filename
BACKUP_NAME="${APP_NAME}_backup_${TIMESTAMP}.zip"

# Go to the parent directory of the app
cd "$SOURCE_DIR/.."

# Zip the app folder
zip -r "$BACKUP_DIR/$BACKUP_NAME" "$APP_NAME" -x "*/node_modules/*" "*/.next/*" "*/out/*"

# Print success message
echo "Backup created at: $BACKUP_DIR/$BACKUP_NAME" 