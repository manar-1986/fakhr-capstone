#!/bin/bash

# Fakhr Project - Installation Script
# Run these commands in Terminal

echo "🚀 Starting Fakhr Project Setup..."

# Step 1: Navigate to project directory
cd /Users/ajayeb/Desktop/Sanad-Capstone-Fronend

# Step 2: Remove old installation (if corrupted)
echo "📦 Cleaning old installation..."
rm -rf node_modules
rm -rf package-lock.json
rm -rf .expo

# Step 3: Clear npm cache
echo "🧹 Clearing npm cache..."
npm cache clean --force

# Step 4: Install all dependencies
echo "⬇️  Installing dependencies..."
npm install

# Step 5: Fix Expo dependencies compatibility
echo "🔧 Fixing Expo dependencies..."
npx expo install --fix

# Step 6: Verify installation
echo "✅ Verifying installation..."
npx expo-doctor

echo ""
echo "✨ Setup complete!"
echo ""
echo "To start the app, run:"
echo "  npm start"
echo ""
echo "Or:"
echo "  npm run ios    (for iOS simulator)"
echo "  npm run android (for Android emulator)"
