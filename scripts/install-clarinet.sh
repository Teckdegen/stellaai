#!/bin/bash

# Script to install Clarinet CLI on Vercel
echo "Installing Clarinet CLI..."

# Check if we're on Vercel
if [ ! -z "$VERCEL" ]; then
  echo "Running on Vercel, installing Clarinet CLI..."
  
  # Create a directory for Clarinet
  mkdir -p $VERCEL_BUILD_DIR/clarinet-bin
  
  # Download Clarinet CLI for Linux (Vercel uses Linux)
  curl -L https://github.com/hirosystems/clarinet/releases/download/v3.8.0/clarinet-linux-x64 -o $VERCEL_BUILD_DIR/clarinet-bin/clarinet
  
  # Make it executable
  chmod +x $VERCEL_BUILD_DIR/clarinet-bin/clarinet
  
  # Add to PATH
  echo "export PATH=\$PATH:$VERCEL_BUILD_DIR/clarinet-bin" >> $BASH_ENV
  
  echo "Clarinet CLI installed successfully!"
else
  echo "Not running on Vercel, skipping Clarinet CLI installation"
fi