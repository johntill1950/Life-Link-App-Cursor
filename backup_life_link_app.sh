#!/bin/bash
# backup_life_link_app.sh
# Script to back up the life-link-app folder with incremental naming (timestamped)
# Usage: ./backup_life_link_app.sh /path/to/backup/directory

# Exit on error
set -e

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}Starting Life Link App Backup Process...${NC}"

# Get current date and time for backup folder name
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
BACKUP_FOLDER="life_link_backup_${TIMESTAMP}"

# Create backup folder
echo -e "${BLUE}Creating backup folder: ${BACKUP_FOLDER}${NC}"
mkdir -p "$BACKUP_FOLDER"

# Get current branch name
CURRENT_BRANCH=$(git branch --show-current)
echo -e "${BLUE}Current branch: ${CURRENT_BRANCH}${NC}"

# Stage all changes
echo -e "${BLUE}Staging all changes...${NC}"
git add .

# Commit changes if there are any
if git diff --staged --quiet; then
    echo -e "${BLUE}No changes to commit${NC}"
else
    echo -e "${BLUE}Committing changes...${NC}"
    git commit -m "Backup commit - ${TIMESTAMP}"
fi

# Push current branch to GitHub
echo -e "${BLUE}Pushing ${CURRENT_BRANCH} to GitHub...${NC}"
git push origin "$CURRENT_BRANCH"

# Switch to main branch
echo -e "${BLUE}Switching to main branch...${NC}"
git checkout main

# Merge feature branch into main
echo -e "${BLUE}Merging ${CURRENT_BRANCH} into main...${NC}"
git merge "$CURRENT_BRANCH"

# Push main to GitHub
echo -e "${BLUE}Pushing main to GitHub...${NC}"
git push origin main

# Switch back to original branch
echo -e "${BLUE}Switching back to ${CURRENT_BRANCH}...${NC}"
git checkout "$CURRENT_BRANCH"

# Copy entire project to backup folder
echo -e "${BLUE}Creating backup of entire project...${NC}"
cp -r . "$BACKUP_FOLDER"

# Create a backup info file
echo -e "${BLUE}Creating backup info file...${NC}"
cat > "$BACKUP_FOLDER/backup_info.txt" << EOL
Life Link App Backup Information
===============================
Backup Date: $(date)
Branch: ${CURRENT_BRANCH}
Commit Hash: $(git rev-parse HEAD)
GitHub Repository: $(git config --get remote.origin.url)

Backup Contents:
- Complete project files
- Git repository
- All dependencies
- Configuration files

To restore:
1. Copy the contents of this folder to your desired location
2. Run 'npm install' to install dependencies
3. Run 'npm run dev' to start the development server
EOL

# Create a zip archive of the backup
echo -e "${BLUE}Creating zip archive of backup...${NC}"
zip -r "${BACKUP_FOLDER}.zip" "$BACKUP_FOLDER"

# Remove the unzipped backup folder
echo -e "${BLUE}Cleaning up...${NC}"
rm -rf "$BACKUP_FOLDER"

echo -e "${GREEN}Backup completed successfully!${NC}"
echo -e "${GREEN}Backup archive created: ${BACKUP_FOLDER}.zip${NC}"
echo -e "${GREEN}All changes have been committed and pushed to GitHub${NC}"
echo -e "${GREEN}Current branch: ${CURRENT_BRANCH}${NC}" 