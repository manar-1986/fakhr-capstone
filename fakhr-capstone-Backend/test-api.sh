#!/bin/bash
# Full API Test Script for Fakhr Backend
# Usage: ./test-api.sh [BASE_URL]
# Default: http://localhost:8000
# Run: chmod +x test-api.sh && ./test-api.sh
#
# Make sure the backend is running first: npm start

BASE_URL="${1:-http://localhost:8000}"

# Quick connectivity check
if ! curl -s -o /dev/null -w "%{http_code}" "${BASE_URL}/health" | grep -q "200"; then
  echo "⚠️  Cannot reach $BASE_URL - is the backend running?"
  echo "   Start with: cd fakhr-capstone-Backend && npm start"
  echo ""
fi
PASS=0
FAIL=0

echo "=========================================="
echo "  Fakhr Backend API - Full Test Suite"
echo "  Base URL: $BASE_URL"
echo "=========================================="
echo ""

run_test() {
  local method="$1"
  local path="$2"
  local data="$3"
  local token="$4"
  local desc="$5"
  
  local url="${BASE_URL}${path}"
  local code
  
  if [ "$method" = "GET" ]; then
    if [ -n "$token" ]; then
      code=$(curl -s -o /tmp/api_response.json -w "%{http_code}" -X GET "$url" -H "Authorization: Bearer $token")
    else
      code=$(curl -s -o /tmp/api_response.json -w "%{http_code}" -X GET "$url")
    fi
  else
    if [ -n "$token" ]; then
      code=$(curl -s -o /tmp/api_response.json -w "%{http_code}" -X "$method" "$url" -H "Content-Type: application/json" -H "Authorization: Bearer $token" -d "$data")
    else
      code=$(curl -s -o /tmp/api_response.json -w "%{http_code}" -X "$method" "$url" -H "Content-Type: application/json" -d "$data")
    fi
  fi
  
  if [ "$code" = "200" ] || [ "$code" = "201" ]; then
    echo "✅ PASS ($code) $method $path"
    echo "   $desc"
    PASS=$((PASS + 1))
    return 0
  else
    echo "❌ FAIL ($code) $method $path"
    echo "   $desc"
    FAIL=$((FAIL + 1))
    return 1
  fi
}

# 1. Health Check
echo "--- 1. Health ---"
run_test "GET" "/health" "" "" "Server health check"
echo ""

# 2. Auth - Login
echo "--- 2. Auth ---"
LOGIN=$(curl -s -X POST "${BASE_URL}/api/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"email":"parent1@example.com","password":"password123"}')
TOKEN=$(echo "$LOGIN" | grep -o '"token":"[^"]*"' | head -1 | cut -d'"' -f4)

if [ -n "$TOKEN" ]; then
  echo "✅ PASS Login - Token obtained"
  PASS=$((PASS + 1))
else
  echo "❌ FAIL Login - Could not get token"
  echo "   Response: ${LOGIN:0:200}..."
  FAIL=$((FAIL + 1))
fi
echo ""

# 3. Directory - Centers
echo "--- 3. Directory: Centers ---"
run_test "GET" "/api/directory/centers" "" "" "List all centers"
run_test "GET" "/api/directory/centers/cities" "" "" "List cities"
run_test "GET" "/api/directory/centers/specialties" "" "" "List center specialties"
echo ""

# 4. Directory - Professionals
echo "--- 4. Directory: Professionals ---"
run_test "GET" "/api/directory/professionals" "" "" "List all professionals"
run_test "GET" "/api/directory/professionals/specialties/list" "" "" "List professional specialties"
echo ""

# 5. Center & Professional by ID (extract from list)
echo "--- 5. Detail Endpoints ---"
CENTERS=$(curl -s "${BASE_URL}/api/directory/centers")
CENTER_ID=$(echo "$CENTERS" | grep -oE '"_id":"[a-f0-9]{24}"' | head -1 | cut -d'"' -f4)
if [ -n "$CENTER_ID" ]; then
  run_test "GET" "/api/directory/centers/$CENTER_ID" "" "" "Get center by ID"
else
  echo "⏭️  SKIP Get center by ID (no centers)"
fi

PROFS=$(curl -s "${BASE_URL}/api/directory/professionals")
PROF_ID=$(echo "$PROFS" | grep -oE '"_id":"[a-f0-9]{24}"' | head -1 | cut -d'"' -f4)
if [ -n "$PROF_ID" ]; then
  run_test "GET" "/api/directory/professionals/$PROF_ID" "" "" "Get professional by ID"
else
  echo "⏭️  SKIP Get professional by ID (no professionals)"
fi
echo ""

# 6. Protected Routes (with token)
if [ -n "$TOKEN" ]; then
  echo "--- 6. Protected Routes ---"
  run_test "GET" "/api/users/me" "" "$TOKEN" "Get current user"
  run_test "GET" "/api/children" "" "$TOKEN" "List children"
  run_test "GET" "/api/services" "" "$TOKEN" "List services"
  run_test "GET" "/api/community/posts" "" "$TOKEN" "List community posts"
else
  echo "--- 6. Protected Routes ---"
  echo "⏭️  SKIP (no auth token)"
fi
echo ""

# Summary
echo "=========================================="
echo "  Summary: $PASS passed, $FAIL failed"
echo "=========================================="
[ $FAIL -eq 0 ] && exit 0 || exit 1
