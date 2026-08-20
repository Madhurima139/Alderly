# Alderly Auth & API Testing Notes

Auth uses JWT Bearer tokens (returned in response body, stored in localStorage by the frontend
as `alderly_token`, sent as `Authorization: Bearer <token>`).

## Credentials
See /app/memory/test_credentials.md.
- Admin: dmadhurima098@gmail.com / Alderly@Admin123
- Test user: testuser@alderly.in / Test@12345

## Quick API checks
```
API_URL=$(grep REACT_APP_BACKEND_URL /app/frontend/.env | cut -d '=' -f2)
TOKEN=$(curl -s -X POST "$API_URL/api/auth/login" -H "Content-Type: application/json" \
  -d '{"email":"testuser@alderly.in","password":"Test@12345"}' | python3 -c "import sys,json;print(json.load(sys.stdin)['token'])")
curl -s "$API_URL/api/auth/me" -H "Authorization: Bearer $TOKEN"
curl -s "$API_URL/api/services"
curl -s "$API_URL/api/plans"
curl -s "$API_URL/api/dashboard" -H "Authorization: Bearer $TOKEN"
```

## Key flows to verify
1. Register a new user → token returned → /api/auth/me works.
2. Login with wrong password → 401 "Incorrect email or password".
3. POST /api/bookings (auth) → appears in GET /api/bookings/my and /api/dashboard.
4. POST /api/subscriptions {plan_id: "six_month"} → active subscription in /api/dashboard (mock checkout, no real payment).
5. POST /api/reminders → appears in /api/dashboard.
6. All protected endpoints without token → 401.

## MongoDB verification
```
mongosh
use test_database
db.users.find({role: "admin"})
# password_hash must start with $2b$
```
