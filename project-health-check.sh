#!/bin/bash

# Project Health Check Script
# Run this from your project root: ./project-health-check.sh

# 1. Search for debugging and unfinished code

echo "\n--- Searching for console.log statements ---"
grep -rn 'console.log' src/

echo "\n--- Searching for debugger statements ---"
grep -rn 'debugger' src/

echo "\n--- Searching for alert() statements ---"
grep -rn 'alert(' src/

echo "\n--- Searching for TODO, FIXME, or HACK comments ---"
grep -rniE 'TODO|FIXME|HACK' src/

# 2. Search for possible secrets (review results carefully)
echo "\n--- Searching for possible secrets (key, secret, password) ---"
grep -rniE 'key|secret|password' src/

# 3. Search for any remaining user_id references in settings
echo "\n--- Searching for user_id in settings queries ---"
grep -rn "user_id" src/

# 4. Run linter
if [ -f package.json ]; then
  echo "\n--- Running npm run lint (if configured) ---"
  npm run lint || echo "Linting failed or not configured."
else
  echo "\nNo package.json found, skipping lint."
fi

# 5. Run npm audit for security vulnerabilities
if [ -f package.json ]; then
  echo "\n--- Running npm audit ---"
  npm audit || echo "npm audit found issues or is not configured."
else
  echo "\nNo package.json found, skipping npm audit."
fi

echo "\n--- Health check complete! ---" 