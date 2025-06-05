#!/bin/bash

echo "🗑️ Removing redundant and problematic files..."

# Remove duplicate authService.js (logic is in authController.js)
if [ -f "services/authService.js" ]; then
    echo "Removing duplicate authService.js..."
    rm services/authService.js
fi

# Remove authMiddleware-fixed.js duplicate
if [ -f "middleware/authMiddleware-fixed.js" ]; then
    echo "Removing authMiddleware-fixed.js duplicate..."
    rm middleware/authMiddleware-fixed.js
fi

echo "✅ Cleanup completed - removed redundant files"