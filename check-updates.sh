#!/bin/bash

echo "Checking for outdated packages..."
npm outdated

echo ""
echo "Running npm audit for vulnerabilities..."
npm audit

echo ""
echo "Check the output above for any updates to react-quill or other dependencies."
echo "Visit https://github.com/zenoamaro/react-quill/releases for the latest releases." 