#!/bin/bash
echo "Setting up Grok UI Clone..."
cd frontend

# Clean up existing node_modules and lock files
echo "Cleaning up existing installations..."
rm -rf node_modules package-lock.json

# Install dependencies with legacy-peer-deps to avoid compatibility issues
echo "Installing dependencies..."
npm install --legacy-peer-deps

# Start the development server
echo "Starting development server..."
npm run dev 