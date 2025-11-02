#!/bin/bash

# Blog Backend API Testing Script
# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
BASE_URL="http://localhost:5000"
AUTHOR_EMAIL="author@test.com"
AUTHOR_PASSWORD="password123"
ADMIN_EMAIL="admin@example.com"
ADMIN_PASSWORD="password123"

# Variables to store tokens and IDs
TOKEN=""
USER_ID=""
ARTICLE_ID=""
ARTICLE_SLUG=""
ADMIN_TOKEN=""

# Helper function to print colored output
print_header() {
  echo -e "\n${BLUE}================================================${NC}"
  echo -e "${BLUE}$1${NC}"
  echo -e "${BLUE}================================================${NC}\n"
}

print_success() {
  echo -e "${GREEN}✅ $1${NC}"
}

print_error() {
  echo -e "${RED}❌ $1${NC}"
}

print_info() {
  echo -e "${YELLOW}ℹ️  $1${NC}"
}

# Helper function to extract JSON value
extract_json_value() {
  echo "$1" | grep -o "\"$2\":\"[^\"]*\"" | cut -d'"' -f4
}

# Helper function to extract JSON number
extract_json_number() {
  echo "$1" | grep -o "\"$2\":[^,}]*" | cut -d':' -f2
}

# Check if server is running
check_server() {
  print_header "Checking if server is running"

  response=$(curl -s -o /dev/null -w "%{http_code}" "$BASE_URL/api/articles")

  if [ "$response" -eq 200 ]; then
    print_success "Server is running at $BASE_URL"
    return 0
  else
    print_error "Server is not running. Please start it with: pnpm run dev"
    exit 1
  fi
}

# 1. AUTHENTICATION TESTS
test_register_author() {
  print_header "TEST 1: Register Author"

  response=$(curl -s -X POST "$BASE_URL/api/auth/register" \
    -H "Content-Type: application/json" \
    -d "{
            \"name\": \"Test Author\",
            \"email\": \"$AUTHOR_EMAIL\",
            \"password\": \"$AUTHOR_PASSWORD\",
            \"role\": \"author\"
        }")

  echo "$response" | jq '.' 2>/dev/null || echo "$response"

  if echo "$response" | grep -q "successfully"; then
    print_success "Author registered successfully"
  else
    print_info "Author might already exist (this is okay for repeated tests)"
  fi
}

test_login_author() {
  print_header "TEST 2: Login as Author"

  response=$(curl -s -X POST "$BASE_URL/api/auth/login" \
    -H "Content-Type: application/json" \
    -d "{
            \"email\": \"$AUTHOR_EMAIL\",
            \"password\": \"$AUTHOR_PASSWORD\"
        }")

  echo "$response" | jq '.' 2>/dev/null || echo "$response"

  TOKEN=$(extract_json_value "$response" "token")
  USER_ID=$(extract_json_value "$response" "_id")

  if [ -n "$TOKEN" ]; then
    print_success "Login successful"
    print_info "Token: ${TOKEN:0:50}..."
    print_info "User ID: $USER_ID"
  else
    print_error "Login failed"
    exit 1
  fi
}

test_login_admin() {
  print_header "TEST 3: Login as Admin"

  response=$(curl -s -X POST "$BASE_URL/api/auth/login" \
    -H "Content-Type: application/json" \
    -d "{
            \"email\": \"$ADMIN_EMAIL\",
            \"password\": \"$ADMIN_PASSWORD\"
        }")

  echo "$response" | jq '.' 2>/dev/null || echo "$response"

  ADMIN_TOKEN=$(extract_json_value "$response" "token")

  if [ -n "$ADMIN_TOKEN" ]; then
    print_success "Admin login successful"
    print_info "Admin Token: ${ADMIN_TOKEN:0:50}..."
  else
    print_error "Admin login failed (you may need to create admin user in MongoDB)"
    print_info "Continuing with author tests..."
  fi
}

# 2. ARTICLE CREATION TESTS
test_create_article() {
  print_header "TEST 4: Create Article"

  response=$(curl -s -X POST "$BASE_URL/api/articles" \
    -H "Content-Type: application/json" \
    -H "Authorization: Bearer $TOKEN" \
    -d '{
            "title": "Getting Started with Node.js and Express",
            "slug": "getting-started-with-nodejs-and-express",
            "description": "A comprehensive guide to building web applications with Node.js and Express framework",
            "markdown": "# Getting Started with Node.js and Express\n\n## Introduction\n\nNode.js has revolutionized backend development...",
            "tags": ["nodejs", "express", "javascript", "backend", "tutorial"],
            "featured": true
        }')

  echo "$response" | jq '.' 2>/dev/null || echo "$response"

  ARTICLE_ID=$(extract_json_value "$response" "_id")
  ARTICLE_SLUG=$(extract_json_value "$response" "slug")

  if [ -n "$ARTICLE_ID" ]; then
    print_success "Article created successfully"
    print_info "Article ID: $ARTICLE_ID"
    print_info "Article Slug: $ARTICLE_SLUG"
  else
    print_error "Failed to create article"
  fi
}

test_get_my_articles() {
  print_header "TEST 5: Get My Articles"

  response=$(curl -s -X GET "$BASE_URL/api/articles/my/articles?page=1&limit=10" \
    -H "Authorization: Bearer $TOKEN")

  echo "$response" | jq '.' 2>/dev/null || echo "$response"

  if echo "$response" | grep -q "data"; then
    print_success "Retrieved articles successfully"
  else
    print_error "Failed to retrieve articles"
  fi
}

test_update_article() {
  print_header "TEST 6: Update Article"

  if [ -z "$ARTICLE_ID" ]; then
    print_error "No article ID available. Skipping update test."
    return
  fi

  response=$(curl -s -X PUT "$BASE_URL/api/articles/$ARTICLE_ID" \
    -H "Content-Type: application/json" \
    -H "Authorization: Bearer $TOKEN" \
    -d '{
            "title": "Getting Started with Node.js and Express - Updated",
            "description": "An updated comprehensive guide to building web applications"
        }')

  echo "$response" | jq '.' 2>/dev/null || echo "$response"

  if echo "$response" | grep -q "Updated"; then
    print_success "Article updated successfully"
  else
    print_error "Failed to update article"
  fi
}

test_submit_for_review() {
  print_header "TEST 7: Submit Article for Review"

  if [ -z "$ARTICLE_ID" ]; then
    print_error "No article ID available. Skipping submit test."
    return
  fi

  response=$(curl -s -X PATCH "$BASE_URL/api/articles/$ARTICLE_ID/submit" \
    -H "Authorization: Bearer $TOKEN")

  echo "$response" | jq '.' 2>/dev/null || echo "$response"

  if echo "$response" | grep -q "pending"; then
    print_success "Article submitted for review"
  else
    print_error "Failed to submit article"
  fi
}

# 3. ADMIN WORKFLOW TESTS
test_get_pending_articles() {
  print_header "TEST 8: Get Pending Articles (Admin)"

  if [ -z "$ADMIN_TOKEN" ]; then
    print_info "No admin token available. Skipping admin tests."
    return
  fi

  response=$(curl -s -X GET "$BASE_URL/api/articles/pending?page=1&limit=10" \
    -H "Authorization: Bearer $ADMIN_TOKEN")

  echo "$response" | jq '.' 2>/dev/null || echo "$response"

  if echo "$response" | grep -q "data"; then
    print_success "Retrieved pending articles"
  else
    print_error "Failed to retrieve pending articles"
  fi
}

test_approve_article() {
  print_header "TEST 9: Approve Article (Admin)"

  if [ -z "$ADMIN_TOKEN" ] || [ -z "$ARTICLE_ID" ]; then
    print_info "Skipping approve test (missing admin token or article ID)"
    return
  fi

  response=$(curl -s -X PATCH "$BASE_URL/api/articles/$ARTICLE_ID/approve" \
    -H "Authorization: Bearer $ADMIN_TOKEN")

  echo "$response" | jq '.' 2>/dev/null || echo "$response"

  if echo "$response" | grep -q "approved"; then
    print_success "Article approved successfully"
  else
    print_error "Failed to approve article"
  fi
}

test_reject_article() {
  print_header "TEST 10: Reject Article (Admin)"

  if [ -z "$ADMIN_TOKEN" ] || [ -z "$ARTICLE_ID" ]; then
    print_info "Skipping reject test (missing admin token or article ID)"
    return
  fi

  response=$(curl -s -X PATCH "$BASE_URL/api/articles/$ARTICLE_ID/reject" \
    -H "Content-Type: application/json" \
    -H "Authorization: Bearer $ADMIN_TOKEN" \
    -d '{
            "reason": "The article needs more technical depth in the implementation section. Please add more code examples."
        }')

  echo "$response" | jq '.' 2>/dev/null || echo "$response"

  if echo "$response" | grep -q "rejected"; then
    print_success "Article rejected successfully"
  else
    print_error "Failed to reject article"
  fi
}

# 4. PUBLIC API TESTS
test_get_all_articles_public() {
  print_header "TEST 11: Get All Articles (Public)"

  response=$(curl -s -X GET "$BASE_URL/api/articles?page=1&limit=5")

  echo "$response" | jq '.' 2>/dev/null || echo "$response"

  if echo "$response" | grep -q "pagination"; then
    print_success "Retrieved public articles with pagination"
  else
    print_error "Failed to retrieve public articles"
  fi
}

test_get_article_by_slug() {
  print_header "TEST 12: Get Article by Slug"

  if [ -z "$ARTICLE_SLUG" ]; then
    print_info "No article slug available. Using default slug."
    ARTICLE_SLUG="getting-started-with-nodejs-and-express"
  fi

  response=$(curl -s -X GET "$BASE_URL/api/articles/slug/$ARTICLE_SLUG")

  echo "$response" | jq '.' 2>/dev/null || echo "$response"

  if echo "$response" | grep -q "slug"; then
    print_success "Retrieved article by slug"
  else
    print_error "Failed to retrieve article by slug"
  fi
}

test_search_articles() {
  print_header "TEST 13: Search Articles"

  response=$(curl -s -X GET "$BASE_URL/api/articles?search=nodejs&tags=javascript,backend")

  echo "$response" | jq '.' 2>/dev/null || echo "$response"

  if echo "$response" | grep -q "data"; then
    print_success "Search completed successfully"
  else
    print_error "Search failed"
  fi
}

test_featured_articles() {
  print_header "TEST 14: Get Featured Articles"

  response=$(curl -s -X GET "$BASE_URL/api/articles?featured=true")

  echo "$response" | jq '.' 2>/dev/null || echo "$response"

  if echo "$response" | grep -q "data"; then
    print_success "Retrieved featured articles"
  else
    print_error "Failed to retrieve featured articles"
  fi
}

# 5. VALIDATION TESTS
test_invalid_email() {
  print_header "TEST 15: Validation - Invalid Email"

  response=$(curl -s -X POST "$BASE_URL/api/auth/register" \
    -H "Content-Type: application/json" \
    -d '{
            "name": "Test User",
            "email": "invalid-email",
            "password": "password123"
        }')

  echo "$response" | jq '.' 2>/dev/null || echo "$response"

  if echo "$response" | grep -q "Invalid email"; then
    print_success "Validation correctly rejected invalid email"
  else
    print_error "Validation failed to catch invalid email"
  fi
}

test_short_password() {
  print_header "TEST 16: Validation - Short Password"

  response=$(curl -s -X POST "$BASE_URL/api/auth/register" \
    -H "Content-Type: application/json" \
    -d '{
            "name": "Test User",
            "email": "test@example.com",
            "password": "123"
        }')

  echo "$response" | jq '.' 2>/dev/null || echo "$response"

  if echo "$response" | grep -q "at least 8 characters"; then
    print_success "Validation correctly rejected short password"
  else
    print_error "Validation failed to catch short password"
  fi
}

# 6. AUTHORIZATION TESTS
test_unauthorized_access() {
  print_header "TEST 17: Authorization - No Token"

  response=$(curl -s -X GET "$BASE_URL/api/articles/my/articles")

  echo "$response" | jq '.' 2>/dev/null || echo "$response"

  if echo "$response" | grep -q "401\|Not authorized"; then
    print_success "Correctly rejected unauthorized access"
  else
    print_error "Failed to reject unauthorized access"
  fi
}

test_delete_article() {
  print_header "TEST 18: Delete Article"

  if [ -z "$ARTICLE_ID" ]; then
    print_info "No article ID available. Skipping delete test."
    return
  fi

  response=$(curl -s -X DELETE "$BASE_URL/api/articles/$ARTICLE_ID" \
    -H "Authorization: Bearer $TOKEN")

  echo "$response" | jq '.' 2>/dev/null || echo "$response"

  if echo "$response" | grep -q "deleted"; then
    print_success "Article deleted successfully"
  else
    print_error "Failed to delete article"
  fi
}

# Main execution
main() {
  print_header "🚀 Blog Backend API Testing Script"
  print_info "Base URL: $BASE_URL"

  # Check if jq is installed
  if ! command -v jq &>/dev/null; then
    print_info "jq is not installed. Output will be unformatted."
    print_info "Install jq for better JSON formatting: sudo apt install jq"
  fi

  # Check server
  check_server

  # Run tests
  test_register_author
  test_login_author
  test_login_admin

  test_create_article
  test_get_my_articles
  test_update_article
  test_submit_for_review

  test_get_pending_articles
  test_approve_article

  test_get_all_articles_public
  test_get_article_by_slug
  test_search_articles
  test_featured_articles

  test_invalid_email
  test_short_password
  test_unauthorized_access

  # Cleanup
  test_delete_article

  print_header "✨ Testing Complete!"
  print_info "Review the results above to verify API functionality"
}

# Run main function
main
