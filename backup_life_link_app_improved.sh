#!/bin/bash

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Get current timestamp
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
BACKUP_NAME="life_link_backup_${TIMESTAMP}"
BACKUP_FILE="${BACKUP_NAME}.tar.gz"

echo -e "${YELLOW}Starting Life Link App backup...${NC}"

# Create a temporary directory for the backup
TEMP_DIR=$(mktemp -d)
echo -e "${GREEN}Created temporary directory: ${TEMP_DIR}${NC}"

# Copy all files except node_modules and any existing backup files
echo -e "${YELLOW}Copying project files...${NC}"
rsync -av --exclude 'node_modules' \
         --exclude 'life_link_backup_*' \
         --exclude '.git' \
         --exclude '.next' \
         --exclude 'out' \
         --exclude '.DS_Store' \
         ./ "${TEMP_DIR}/${BACKUP_NAME}/"

# Create backup info file
echo -e "${YELLOW}Creating backup info file...${NC}"
cat > "${TEMP_DIR}/${BACKUP_NAME}/backup_info.txt" << EOF
Life Link App Backup Information
===============================
Backup Date: $(date)
Backup Name: ${BACKUP_NAME}
Backup File: ${BACKUP_FILE}

This backup includes all project files except:
- node_modules (can be reinstalled with 'npm install')
- .git directory
- .next directory
- out directory
- .DS_Store files
- Any existing backup files

To restore from this backup:
1. Extract the backup: tar -xzf ${BACKUP_FILE}
2. Navigate to the extracted directory: cd ${BACKUP_NAME}
3. Install dependencies: npm install
4. Start the application: npm run dev

Note: Make sure you have sufficient disk space before restoring.
EOF

# Create the tar.gz archive
echo -e "${YELLOW}Creating compressed archive...${NC}"
tar -czf "${BACKUP_FILE}" -C "${TEMP_DIR}" "${BACKUP_NAME}"

# Clean up temporary directory
echo -e "${YELLOW}Cleaning up...${NC}"
rm -rf "${TEMP_DIR}"

# Calculate and display backup size
BACKUP_SIZE=$(du -h "${BACKUP_FILE}" | cut -f1)
echo -e "${GREEN}Backup completed successfully!${NC}"
echo -e "${GREEN}Backup file: ${BACKUP_FILE}${NC}"
echo -e "${GREEN}Backup size: ${BACKUP_SIZE}${NC}"

# Verify the backup
echo -e "${YELLOW}Verifying backup...${NC}"
if tar -tzf "${BACKUP_FILE}" > /dev/null; then
    echo -e "${GREEN}Backup verification successful!${NC}"
else
    echo -e "${RED}Backup verification failed!${NC}"
    exit 1
fi 