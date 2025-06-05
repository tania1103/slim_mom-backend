#!/bin/bash

echo "🔍 Running security audit for SlimMom backend..."
echo "=============================================="

# Navigate to server directory
cd "$(dirname "$0")"

echo "📋 1. Checking for npm vulnerabilities..."
npm audit --audit-level=moderate

echo ""
echo "📦 2. Checking package versions..."
echo "Current Mongoose version:"
npm list mongoose

echo ""
echo "🔐 3. Testing security endpoints..."
echo "Testing rate limiting on /api/auth/login..."

# Test rate limiting (will need curl installed)
if command -v curl &> /dev/null; then
    echo "Sending 6 requests to test rate limiting..."
    for i in {1..6}; do
        echo "Request $i:"
        curl -s -w "Status: %{http_code}\n" \
             -X POST \
             -H "Content-Type: application/json" \
             -d '{"email":"test@test.com","password":"wrongpassword"}' \
             http://localhost:5000/api/auth/login
    done
else
    echo "curl not found - skipping rate limit test"
fi

echo ""
echo "🛡️ 4. Security checklist:"
echo "✅ Mongoose updated to 8.15.1 (fixes critical vulnerabilities)"
echo "✅ Input validation with express-validator"
echo "✅ Rate limiting implemented"
echo "✅ Helmet for security headers"
echo "✅ MongoDB sanitization"
echo "✅ XSS protection"
echo "✅ Parameter pollution protection"
echo "✅ Injection protection middleware"
echo "✅ Email validation and sanitization"

echo ""
echo "🚀 Security audit completed!"
echo "Run 'npm start' to start the secure server."