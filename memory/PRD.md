# Alderly — PRD

## Original Problem Statement
Elder care product for Gorakhpur ("Alderly") offering all services — medicine delivery, hospital
appointments, follow-up reminders, nurses, caretakers — in one place, a few clicks away, with
premium subscriptions (monthly, six-monthly, annual). Website entailing all features.

## User Choices
- Full service platform: landing, services catalog, booking flow, user dashboard
- JWT email/password auth
- MOCK checkout for subscriptions (no real payments yet)
- Warm, trustworthy, elder-friendly design; super simple, clean, readable UI

## Architecture
- FastAPI backend (/app/backend/server.py), MongoDB via motor (MONGO_URL/DB_NAME from env)
- JWT Bearer auth (localStorage `alderly_token`), bcrypt hashing, seeded admin + test user
- React frontend (CRA + craco + Tailwind + shadcn/ui), fonts Merriweather/Work Sans,
  palette: deep forest green #1A3626, terracotta #D97757, warm sand #F9F6F0
- Design guidelines: /app/design_guidelines.json

## User Personas
- Adult children (often living outside Gorakhpur) arranging care for parents
- Elderly users themselves (large text, simple flows, static labels, large tap targets)

## Core Requirements (static)
1. Landing page with services overview, how-it-works, plans teaser, testimonial
2. Services catalog: medicine delivery, hospital appointments, reminders, nurses, caretakers, lab tests
3. Booking flow per service (elder name, phone, address, date, time, notes)
4. Subscriptions: monthly ₹999 / six-monthly ₹4999 / annual ₹8999 — mock checkout
5. User dashboard: active subscription, upcoming bookings, follow-up reminders (add)
6. Auth: register/login/logout, protected routes

## Implemented (2026-08-20)
- All core requirements above; backend regression suite 14/14 pass (/app/backend/tests/backend_test.py),
  frontend flows 11/11 pass (/app/test_reports/iteration_1.json)
- Callback request endpoint (/api/callbacks) available, not yet surfaced in UI
- Credentials: /app/memory/test_credentials.md

## Backlog (prioritized)
- P0: Real payment integration (Razorpay/Stripe) replacing mock checkout
- P1: Booking/reminder cancellation & rescheduling; password reset flow; brute-force lockout on login
- P1: Admin panel (view bookings/callbacks, manage services)
- P2: WhatsApp/SMS reminders via Twilio; multi-elder profiles per account; Hindi language toggle
- P2: FastAPI lifespan migration, explicit CORS origins for production

## Next Tasks
- Confirm payment provider choice with user, then integrate real checkout
- Add booking cancellation UX
