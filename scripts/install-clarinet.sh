#!/bin/bash

# Install Clarinet CLI on Vercel
if [ ! -z "$VERCEL" ]; then
  echo "Installing Clarinet CLI..."
  
  # Create directory for Clarinet
  mkdir -p $VERCEL_BUILD_DIR/clarinet-bin
  
  # Download Clarinet CLI
  curl -s -L https://github.com/hirosystems/clarinet/releases/download/v3.8.0/clarinet-linux-x64 -o $VERCEL_BUILD_DIR/clarinet-bin/clarinet
  
  # Make it executable
  chmod +x $VERCEL_BUILD_DIR/clarinet-bin/clarinet
  
  echo "Clarinet CLI installed successfully"
fi