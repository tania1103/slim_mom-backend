#!/bin/bash

echo "📦 Installing SlimMom API Production Dependencies..."

# Install new production dependencies
echo "Installing compression for performance..."
npm install compression@^1.7.4

echo "Installing node-cache for caching..."
npm install node-cache@^5.1.2

echo "Installing winston for logging..."
npm install winston@^3.17.0

echo "✅ All production dependencies installed!"

# Update package-lock.json
echo "Updating package-lock.json..."
npm install

# Run security audit
echo "🔒 Running security audit..."
npm audit --audit-level moderate

echo "🎉 Installation completed successfully!"
echo
echo "Next steps:"
echo "1. Configure environment variables in .env.production"
echo "2. Run: npm start"
echo "3. Or use Docker: ./deploy.sh production"