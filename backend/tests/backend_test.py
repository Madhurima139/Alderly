"""Backend API regression tests for Alderly."""
import os
import time
import pytest
import requests

BASE_URL = os.environ.get("REACT_APP_BACKEND_URL", "https://senior-support-50.preview.emergentagent.com").rstrip("/")
API = f"{BASE_URL}/api"

TEST_USER_EMAIL = "testuser@alderly.in"
TEST_USER_PASSWORD = "Test@12345"


@pytest.fixture(scope="session")
def s():
    return requests.Session()


@pytest.fixture(scope="session")
def user_token(s):
    r = s.post(f"{API}/auth/login", json={"email": TEST_USER_EMAIL, "password": TEST_USER_PASSWORD})
    assert r.status_code == 200, r.text
    return r.json()["token"]


@pytest.fixture(scope="session")
def auth_headers(user_token):
    return {"Authorization": f"Bearer {user_token}"}


# ------- Auth -------

def test_login_success(s):
    r = s.post(f"{API}/auth/login", json={"email": TEST_USER_EMAIL, "password": TEST_USER_PASSWORD})
    assert r.status_code == 200
    data = r.json()
    assert "token" in data and isinstance(data["token"], str)
    assert data["user"]["email"] == TEST_USER_EMAIL


def test_login_invalid(s):
    r = s.post(f"{API}/auth/login", json={"email": TEST_USER_EMAIL, "password": "wrongpass"})
    assert r.status_code == 401


def test_register_new_user(s):
    email = f"qa_user_{int(time.time())}@alderly.in"
    r = s.post(f"{API}/auth/register", json={
        "name": "QA User", "email": email, "phone": "9999999999", "password": "Test@12345"
    })
    assert r.status_code == 200, r.text
    data = r.json()
    assert data["user"]["email"] == email
    assert "token" in data
    # duplicate should fail
    r2 = s.post(f"{API}/auth/register", json={
        "name": "QA User", "email": email, "phone": "9999999999", "password": "Test@12345"
    })
    assert r2.status_code == 400


def test_me_endpoint(s, auth_headers):
    r = s.get(f"{API}/auth/me", headers=auth_headers)
    assert r.status_code == 200
    assert r.json()["email"] == TEST_USER_EMAIL


def test_me_unauth(s):
    r = s.get(f"{API}/auth/me")
    assert r.status_code == 401


# ------- Catalog -------

def test_list_services(s):
    r = s.get(f"{API}/services")
    assert r.status_code == 200
    data = r.json()
    assert len(data) == 6
    slugs = {x["slug"] for x in data}
    assert "medicine-delivery" in slugs


def test_list_plans(s):
    r = s.get(f"{API}/plans")
    assert r.status_code == 200
    data = r.json()
    assert len(data) == 3
    ids = {p["plan_id"] for p in data}
    assert {"monthly", "six_month", "annual"} == ids


# ------- Bookings -------

def test_booking_flow(s, auth_headers):
    payload = {
        "service_slug": "medicine-delivery",
        "service_name": "Medicine Delivery",
        "elder_name": "TEST_Elder",
        "phone": "9876543210",
        "address": "TEST address",
        "date": "2026-02-15",
        "time": "10:00",
        "notes": "TEST booking",
    }
    r = s.post(f"{API}/bookings", json=payload, headers=auth_headers)
    assert r.status_code == 200, r.text
    booking = r.json()
    assert booking["elder_name"] == "TEST_Elder"
    assert "id" in booking

    # GET verify
    r2 = s.get(f"{API}/bookings/my", headers=auth_headers)
    assert r2.status_code == 200
    ids = [b["id"] for b in r2.json()]
    assert booking["id"] in ids


def test_booking_requires_auth(s):
    r = s.post(f"{API}/bookings", json={
        "service_slug": "medicine-delivery", "service_name": "Medicine Delivery",
        "elder_name": "x", "phone": "1", "address": "x", "date": "2026-01-01", "time": "10:00"
    })
    assert r.status_code == 401


# ------- Subscription -------

def test_subscription_mock_checkout(s, auth_headers):
    r = s.post(f"{API}/subscriptions", json={"plan_id": "six_month"}, headers=auth_headers)
    assert r.status_code == 200, r.text
    data = r.json()
    assert data["plan_id"] == "six_month"
    assert data["status"] == "active"
    assert data["price"] == 4999

    # dashboard reflects active sub
    d = s.get(f"{API}/dashboard", headers=auth_headers)
    assert d.status_code == 200
    dash = d.json()
    assert dash["subscription"] is not None
    assert dash["subscription"]["plan_id"] == "six_month"


def test_subscription_invalid_plan(s, auth_headers):
    r = s.post(f"{API}/subscriptions", json={"plan_id": "nonexistent"}, headers=auth_headers)
    assert r.status_code == 404


# ------- Reminders -------

def test_reminder_flow(s, auth_headers):
    r = s.post(f"{API}/reminders", json={
        "title": "TEST_Take BP medicine", "date": "2026-02-01", "time": "08:00", "notes": "TEST"
    }, headers=auth_headers)
    assert r.status_code == 200, r.text
    reminder = r.json()
    assert reminder["title"] == "TEST_Take BP medicine"

    r2 = s.get(f"{API}/reminders/my", headers=auth_headers)
    assert r2.status_code == 200
    titles = [x["title"] for x in r2.json()]
    assert "TEST_Take BP medicine" in titles


# ------- Dashboard -------

def test_dashboard(s, auth_headers):
    r = s.get(f"{API}/dashboard", headers=auth_headers)
    assert r.status_code == 200
    data = r.json()
    assert "user" in data and "bookings" in data and "reminders" in data


# ------- Callback (public) -------

def test_callback_public(s):
    r = s.post(f"{API}/callbacks", json={"name": "TEST", "phone": "1234567890", "message": "TEST"})
    assert r.status_code == 200
    assert "message" in r.json()
