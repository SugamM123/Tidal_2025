#!/bin/bash
echo "Starting setup for Grok UI Clone..."
cd frontend

# Install dependencies with the --legacy-peer-deps flag to bypass peer dependency issues
echo "Installing dependencies..."
npm install --legacy-peer-deps

# Start the development server
echo "Starting development server..."
npm run dev 