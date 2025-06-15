#!/bin/bash

# 🧪 Script de Testare Automată pentru Backend SlimMom
# Rulează toate testele principale ale API-ului

echo "🚀 Începerea testării backend-ului SlimMom..."
echo "=========================================="

# Configurare
BASE_URL="http://localhost:5000"
TEST_EMAIL="test$(date +%s)@example.com"
TEST_PASSWORD="Test123456!"
TOKEN=""

# Culori pentru output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Funcție pentru afișarea rezultatelor
print_result() {
    if [ $1 -eq 0 ]; then
        echo -e "${GREEN}✅ $2${NC}"
    else
        echo -e "${RED}❌ $2${NC}"
    fi
}

# Funcție pentru a extrage token din response
extract_token() {
    echo "$1" | grep -o '"token":"[^"]*"' | cut -d'"' -f4
}

echo -e "${BLUE}📋 PASUL 1: Testarea conectivității de bază${NC}"
echo "--------------------------------------------"

# Test 1: Health Check
echo "🔍 Testare health check..."
RESPONSE=$(curl -s -w "%{http_code}" -o /tmp/health_response.json "$BASE_URL/")
HTTP_CODE="${RESPONSE: -3}"

if [ "$HTTP_CODE" -eq 200 ]; then
    print_result 0 "Health check"
    echo "   📄 Răspuns: $(cat /tmp/health_response.json | head -c 100)..."
else
    print_result 1 "Health check (HTTP $HTTP_CODE)"
    exit 1
fi

echo ""
echo -e "${BLUE}📋 PASUL 2: Testarea autentificării${NC}"
echo "--------------------------------------------"

# Test 2: Înregistrare utilizator
echo "🔍 Testare înregistrare utilizator..."
REGISTER_RESPONSE=$(curl -s -w "%{http_code}" -X POST \
  -H "Content-Type: application/json" \
  -d "{\"name\":\"Test User\",\"email\":\"$TEST_EMAIL\",\"password\":\"$TEST_PASSWORD\"}" \
  -o /tmp/register_response.json \
  "$BASE_URL/api/auth/register")

HTTP_CODE="${REGISTER_RESPONSE: -3}"
if [ "$HTTP_CODE" -eq 201 ] || [ "$HTTP_CODE" -eq 200 ]; then
    print_result 0 "Înregistrare utilizator"
else
    print_result 1 "Înregistrare utilizator (HTTP $HTTP_CODE)"
    echo "   📄 Răspuns: $(cat /tmp/register_response.json)"
fi

# Test 3: Login utilizator
echo "🔍 Testare login utilizator..."
LOGIN_RESPONSE=$(curl -s -w "%{http_code}" -X POST \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"$TEST_EMAIL\",\"password\":\"$TEST_PASSWORD\"}" \
  -o /tmp/login_response.json \
  "$BASE_URL/api/auth/login")

HTTP_CODE="${LOGIN_RESPONSE: -3}"
if [ "$HTTP_CODE" -eq 200 ]; then
    print_result 0 "Login utilizator"
    TOKEN=$(extract_token "$(cat /tmp/login_response.json)")
    echo "   🔑 Token obținut: ${TOKEN:0:20}..."
else
    print_result 1 "Login utilizator (HTTP $HTTP_CODE)"
    echo "   📄 Răspuns: $(cat /tmp/login_response.json)"
fi

echo ""
echo -e "${BLUE}📋 PASUL 3: Testarea produselor${NC}"
echo "--------------------------------------------"

# Test 4: Obținerea produselor
echo "🔍 Testare obținere produse..."
PRODUCTS_RESPONSE=$(curl -s -w "%{http_code}" \
  -o /tmp/products_response.json \
  "$BASE_URL/api/products")

HTTP_CODE="${PRODUCTS_RESPONSE: -3}"
if [ "$HTTP_CODE" -eq 200 ]; then
    print_result 0 "Obținere produse"
    PRODUCT_COUNT=$(cat /tmp/products_response.json | grep -o '"_id"' | wc -l)
    echo "   📦 Numărul de produse: $PRODUCT_COUNT"
else
    print_result 1 "Obținere produse (HTTP $HTTP_CODE)"
fi

# Test 5: Căutarea produselor
echo "🔍 Testare căutare produse..."
SEARCH_RESPONSE=$(curl -s -w "%{http_code}" \
  -o /tmp/search_response.json \
  "$BASE_URL/api/products/search?q=banana")

HTTP_CODE="${SEARCH_RESPONSE: -3}"
if [ "$HTTP_CODE" -eq 200 ]; then
    print_result 0 "Căutare produse"
    SEARCH_COUNT=$(cat /tmp/search_response.json | grep -o '"_id"' | wc -l)
    echo "   🔍 Rezultate căutare: $SEARCH_COUNT"
else
    print_result 1 "Căutare produse (HTTP $HTTP_CODE)"
fi

echo ""
echo -e "${BLUE}📋 PASUL 4: Testarea calculului de calorii${NC}"
echo "--------------------------------------------"

if [ -n "$TOKEN" ]; then
    # Test 6: Calculul caloriilor
    echo "🔍 Testare calcul calorii..."
    CALORIES_RESPONSE=$(curl -s -w "%{http_code}" -X POST \
      -H "Content-Type: application/json" \
      -H "Authorization: Bearer $TOKEN" \
      -d '{"age":25,"height":170,"weight":70,"gender":"female","activityLevel":"moderate","bloodType":1}' \
      -o /tmp/calories_response.json \
      "$BASE_URL/api/calories/calculate")

    HTTP_CODE="${CALORIES_RESPONSE: -3}"
    if [ "$HTTP_CODE" -eq 200 ]; then
        print_result 0 "Calcul calorii"
        DAILY_CALORIES=$(cat /tmp/calories_response.json | grep -o '"dailyCalories":[0-9]*' | cut -d':' -f2)
        echo "   🔥 Calorii zilnice: $DAILY_CALORIES"
    else
        print_result 1 "Calcul calorii (HTTP $HTTP_CODE)"
    fi
else
    echo -e "${YELLOW}⚠️  Sărind testarea calculului de calorii (lipsește token-ul)${NC}"
fi

echo ""
echo -e "${BLUE}📋 PASUL 5: Testarea jurnalului${NC}"
echo "--------------------------------------------"

if [ -n "$TOKEN" ]; then
    # Test 7: Obținerea jurnalului
    echo "🔍 Testare obținere jurnal..."
    DIARY_RESPONSE=$(curl -s -w "%{http_code}" \
      -H "Authorization: Bearer $TOKEN" \
      -o /tmp/diary_response.json \
      "$BASE_URL/api/diary?date=$(date +%Y-%m-%d)")

    HTTP_CODE="${DIARY_RESPONSE: -3}"
    if [ "$HTTP_CODE" -eq 200 ]; then
        print_result 0 "Obținere jurnal"
        DIARY_COUNT=$(cat /tmp/diary_response.json | grep -o '"_id"' | wc -l)
        echo "   📚 Intrări în jurnal: $DIARY_COUNT"
    else
        print_result 1 "Obținere jurnal (HTTP $HTTP_CODE)"
    fi
else
    echo -e "${YELLOW}⚠️  Sărind testarea jurnalului (lipsește token-ul)${NC}"
fi

echo ""
echo -e "${BLUE}📋 PASUL 6: Testarea profilului${NC}"
echo "--------------------------------------------"

if [ -n "$TOKEN" ]; then
    # Test 8: Obținerea profilului
    echo "🔍 Testare obținere profil..."
    PROFILE_RESPONSE=$(curl -s -w "%{http_code}" \
      -H "Authorization: Bearer $TOKEN" \
      -o /tmp/profile_response.json \
      "$BASE_URL/api/profile")

    HTTP_CODE="${PROFILE_RESPONSE: -3}"
    if [ "$HTTP_CODE" -eq 200 ]; then
        print_result 0 "Obținere profil"
        USER_NAME=$(cat /tmp/profile_response.json | grep -o '"name":"[^"]*"' | cut -d'"' -f4)
        echo "   👤 Nume utilizator: $USER_NAME"
    else
        print_result 1 "Obținere profil (HTTP $HTTP_CODE)"
    fi
else
    echo -e "${YELLOW}⚠️  Sărind testarea profilului (lipsește token-ul)${NC}"
fi

echo ""
echo -e "${BLUE}📋 PASUL 7: Testarea securității${NC}"
echo "--------------------------------------------"

# Test 9: Rate limiting
echo "🔍 Testare rate limiting..."
RATE_LIMIT_FAILED=0

for i in {1..6}; do
    RATE_RESPONSE=$(curl -s -w "%{http_code}" -X POST \
      -H "Content-Type: application/json" \
      -d '{"email":"nonexistent@test.com","password":"wrongpassword"}' \
      -o /dev/null \
      "$BASE_URL/api/auth/login")
    
    HTTP_CODE="${RATE_RESPONSE: -3}"
    if [ "$HTTP_CODE" -eq 429 ]; then
        print_result 0 "Rate limiting (blocat după $i încercări)"
        break
    elif [ $i -eq 6 ]; then
        RATE_LIMIT_FAILED=1
    fi
done

if [ $RATE_LIMIT_FAILED -eq 1 ]; then
    print_result 1 "Rate limiting (nu s-a activat)"
fi

echo ""
echo "=========================================="
echo -e "${GREEN}🎉 Testarea completă!${NC}"
echo ""
echo -e "${BLUE}📊 Statistici:${NC}"
echo "   📧 Email test: $TEST_EMAIL"
echo "   🔑 Token generat: $([ -n "$TOKEN" ] && echo "DA" || echo "NU")"
echo "   📂 Fișiere temporare în /tmp/"
echo ""
echo -e "${YELLOW}💡 Pentru a vedea răspunsurile complete, verifică fișierele din /tmp/${NC}"

# Cleanup
echo "🧹 Curățarea fișierelor temporare..."
rm -f /tmp/*_response.json

echo -e "${GREEN}✅ Testare completă!${NC}"
