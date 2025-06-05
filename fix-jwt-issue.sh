#!/bin/bash

echo "🔧 Fixing JWT duplicate declaration issue..."

# Navigate to server directory
cd "$(dirname "$0")"

# Remove the problematic authMiddleware.js
if [ -f "middleware/authMiddleware.js" ]; then
    echo "🗑️  Removing problematic authMiddleware.js..."
    rm middleware/authMiddleware.js
fi

# Rename the fixed version
if [ -f "middleware/authMiddleware-fixed.js" ]; then
    echo "✅ Renaming authMiddleware-fixed.js to authMiddleware.js..."
    mv middleware/authMiddleware-fixed.js middleware/authMiddleware.js
fi

# Update all imports back to original names
echo "🔄 Updating imports in route files..."

# Update userRoutes.js
sed -i "s/authMiddleware-fixed/authMiddleware/g" routes/userRoutes.js

# Update diaryRoutes.js
sed -i "s/authMiddleware-fixed/authMiddleware/g" routes/diaryRoutes.js

# Update calorieRoutes.js
sed -i "s/authMiddleware-fixed/authMiddleware/g" routes/calorieRoutes.js

# Update test file
sed -i "s/authMiddleware-fixed/authMiddleware/g" test-fixes.js

echo "✅ JWT duplicate declaration issue FIXED!"
echo "🚀 Ready to start server with: npm start"