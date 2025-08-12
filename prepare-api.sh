#!/bin/sh

# This script ensures API file permissions are set correctly
# Run this before deploying to Vercel

# Make API directory if it doesn't exist
mkdir -p api

# Make sure the patterns.json file exists and is writable
touch api/patterns.json
chmod 666 api/patterns.json

echo "API files prepared for deployment!"
