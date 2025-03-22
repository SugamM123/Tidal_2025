#!/usr/bin/env bash

# Enter nix development environment
echo "Entering nix development environment..."
nix develop

# Install frontend dependencies
echo "Installing frontend dependencies..."
cd frontend && npm install

echo "Setup complete! You can now run both servers with: python run.py"