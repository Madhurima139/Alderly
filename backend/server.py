from dotenv import load_dotenv
from pathlib import Path

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / ".env")

import logging
import os
from datetime import datetime, timedelta, timezone
from typing import Annotated, List, Optional

import bcrypt
import jwt
from bson import ObjectId
from fastapi import APIRouter, Depends, FastAPI, HTTPException
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from motor.motor_asyncio import AsyncIOMotorClient
from pydantic import BaseModel, BeforeValidator, ConfigDict, EmailStr, Field
from starlette.middleware.cors import CORSMiddleware

mongo_url = os.environ["MONGO_URL"]
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ["DB_NAME"]]

JWT_SECRET = os.environ["JWT_SECRET"]
JWT_ALGORITHM = "HS256"

app = FastAPI()
api_router = APIRouter(prefix="/api")
bearer = HTTPBearer(auto_error=False)

logging.basicConfig(level=logging.INFO, format="%(asctime)s - %(name)s - %(levelname)s - %(message)s")
logger = logging.getLogger(__name__)

PyObjectId = Annotated[str, BeforeValidator(str)]


class BaseDocument(BaseModel):
    model_config = ConfigDict(populate_by_name=True, extra="ignore")
    id: Optional[PyObjectId] = Field(default=None, alias="_id")

    def to_mongo(self) -> dict:
        doc = self.model_dump(by_alias=True, exclude={"id"})
        return doc

    @classmethod
    def from_mongo(cls, doc):
        if doc is None:
            return None
        if "_id" in doc:
            doc["_id"] = str(doc["_id"])
        return cls(**doc)


# ---------- Auth ----------

class RegisterInput(BaseModel):
    name: str
    email: EmailStr
    phone: str
    password: str


class LoginInput(BaseModel):
    email: EmailStr
    password: str


class UserPublic(BaseDocument):
    name: str
    email: str
    phone: Optional[str] = None
    role: str = "user"
    created_at: Optional[str] = None


def hash_password(password: str) -> str:
    return bcrypt.hashpw(password.encode("utf-8"), bcrypt.gensalt()).decode("utf-8")


def verify_password(plain: str, hashed: str) -> bool:
    return bcrypt.checkpw(plain.encode("utf-8"), hashed.encode("utf-8"))


def create_access_token(user_id: str, email: str) -> str:
    payload = {
        "sub": user_id,
        "email": email,
        "exp": datetime.now(timezone.utc) + timedelta(days=7),
        "type": "access",
    }
    return jwt.encode(payload, JWT_SECRET, algorithm=JWT_ALGORITHM)


async def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(bearer)) -> dict:
    if not credentials:
        raise HTTPException(status_code=401, detail="Not authenticated")
    try:
        payload = jwt.decode(credentials.credentials, JWT_SECRET, algorithms=[JWT_ALGORITHM])
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token expired")
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=401, detail="Invalid token")
    user = await db.users.find_one({"_id": ObjectId(payload["sub"])})
    if not user:
        raise HTTPException(status_code=401, detail="User not found")
    user["_id"] = str(user["_id"])
    user.pop("password_hash", None)
    return user


@api_router.post("/auth/register")
async def register(input: RegisterInput):
    email = input.email.lower()
    if await db.users.find_one({"email": email}):
        raise HTTPException(status_code=400, detail="An account with this email already exists")
    if len(input.password) < 6:
        raise HTTPException(status_code=400, detail="Password must be at least 6 characters")
    doc = {
        "name": input.name,
        "email": email,
        "phone": input.phone,
        "password_hash": hash_password(input.password),
        "role": "user",
        "created_at": datetime.now(timezone.utc).isoformat(),
    }
    result = await db.users.insert_one(doc)
    token = create_access_token(str(result.inserted_id), email)
    user = await db.users.find_one({"_id": result.inserted_id})
    return {"token": token, "user": UserPublic.from_mongo(user).model_dump(by_alias=False)}


@api_router.post("/auth/login")
async def login(input: LoginInput):
    email = input.email.lower()
    user = await db.users.find_one({"email": email})
    if not user or not verify_password(input.password, user["password_hash"]):
        raise HTTPException(status_code=401, detail="Incorrect email or password")
    token = create_access_token(str(user["_id"]), email)
    return {"token": token, "user": UserPublic.from_mongo(user).model_dump(by_alias=False)}


@api_router.get("/auth/me")
async def me(user: dict = Depends(get_current_user)):
    return UserPublic.from_mongo(user).model_dump(by_alias=False)


# ---------- Catalogs ----------

SERVICES = [
    {
        "slug": "medicine-delivery",
        "name": "Medicine Delivery",
        "short": "Doorstep delivery of medicines from trusted Gorakhpur pharmacies.",
        "description": "Upload or read out your prescription and our team delivers genuine medicines to your doorstep, on time, every time.",
        "icon": "Pill",
        "price_label": "Free delivery for members",
        "image": "https://images.unsplash.com/photo-1580281657527-47f249e8f4df?crop=entropy&cs=srgb&fm=jpg&ixid=M3w4NjA3MDR8MHwxfHNlYXJjaHwxfHxwaGFybWFjeSUyMG1lZGljaW5lJTIwZGVsaXZlcnl8ZW58MHx8fHwxNzg3MjA1OTk5fDA&ixlib=rb-4.1.0&q=85",
    },
    {
        "slug": "hospital-appointments",
        "name": "Hospital Appointments",
        "short": "Priority OPD bookings at partner hospitals and clinics in Gorakhpur.",
        "description": "We book doctor appointments for you, arrange transport if needed, and send someone along if the family cannot be there.",
        "icon": "CalendarCheck",
        "price_label": "Included in all plans",
        "image": "",
    },
    {
        "slug": "follow-up-reminders",
        "name": "Follow-up & Medicine Reminders",
        "short": "Gentle phone-call and SMS reminders for medicines and checkups.",
        "description": "Never miss a dose or a doctor follow-up. Our care team calls to remind, and checks that it was done.",
        "icon": "BellRing",
        "price_label": "Included in all plans",
        "image": "",
    },
    {
        "slug": "nurses-at-home",
        "name": "Trained Nurses at Home",
        "short": "Qualified nurses for injections, dressings, and post-surgery care.",
        "description": "Certified nurses visit your home for injections, wound dressing, BP and sugar monitoring, and post-operative care.",
        "icon": "Stethoscope",
        "price_label": "Member rates apply",
        "image": "https://images.unsplash.com/photo-1765896387387-0538bc9f997e?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NTY2NzB8MHwxfHNlYXJjaHwzfHxudXJzZSUyMGhlbHBpbmclMjBlbGRlcmx5fGVufDB8fHx8MTc4NzIwNTk4Nnww&ixlib=rb-4.1.0&q=85",
    },
    {
        "slug": "caretakers",
        "name": "Caretakers & Companions",
        "short": "Verified attendants for daily living help and warm companionship.",
        "description": "Background-verified caretakers help with meals, walking, bathing, and simply being there as a caring companion.",
        "icon": "HeartHandshake",
        "price_label": "Member rates apply",
        "image": "https://images.unsplash.com/photo-1762955911431-4c44c7c3f408?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NTY2NzB8MHwxfHNlYXJjaHwxfHxudXJzZSUyMGhlbHBpbmclMjBlbGRlcmx5fGVufDB8fHx8MTc4NzIwNTk4Nnww&ixlib=rb-4.1.0&q=85",
    },
    {
        "slug": "lab-tests-at-home",
        "name": "Lab Tests at Home",
        "short": "Blood and sample collection at home, reports on WhatsApp.",
        "description": "Technicians collect samples at your doorstep and reports are shared digitally with you and your family.",
        "icon": "FlaskConical",
        "price_label": "Member rates apply",
        "image": "",
    },
]

PLANS = [
    {
        "plan_id": "monthly",
        "name": "Monthly Care",
        "price": 999,
        "duration_days": 30,
        "per_label": "per month",
        "tagline": "Try Alderly with full flexibility",
        "features": [
            "All 6 care services included",
            "Free medicine delivery",
            "Unlimited follow-up reminders",
            "Priority hospital appointments",
            "Dedicated care coordinator",
        ],
    },
    {
        "plan_id": "six_month",
        "name": "Six-Month Care",
        "price": 4999,
        "duration_days": 182,
        "per_label": "for 6 months",
        "tagline": "Save 17% — our most loved plan",
        "popular": True,
        "features": [
            "Everything in Monthly Care",
            "2 free nurse visits included",
            "Monthly health check-in call",
            "Family updates on WhatsApp",
        ],
    },
    {
        "plan_id": "annual",
        "name": "Annual Care",
        "price": 8999,
        "duration_days": 365,
        "per_label": "per year",
        "tagline": "Save 25% — complete peace of mind",
        "features": [
            "Everything in Six-Month Care",
            "6 free nurse visits included",
            "Free annual health checkup at home",
            "24x7 emergency helpline",
        ],
    },
]


@api_router.get("/services")
async def list_services():
    return SERVICES


@api_router.get("/plans")
async def list_plans():
    return PLANS


# ---------- Bookings ----------

class BookingCreate(BaseModel):
    service_slug: str
    service_name: str
    elder_name: str
    phone: str
    address: str
    date: str
    time: str
    notes: Optional[str] = ""


class Booking(BaseDocument):
    user_id: str
    service_slug: str
    service_name: str
    elder_name: str
    phone: str
    address: str
    date: str
    time: str
    notes: str = ""
    status: str = "confirmed"
    created_at: Optional[str] = None


@api_router.post("/bookings")
async def create_booking(input: BookingCreate, user: dict = Depends(get_current_user)):
    booking = Booking(
        user_id=user["_id"],
        **input.model_dump(),
        created_at=datetime.now(timezone.utc).isoformat(),
    )
    result = await db.bookings.insert_one(booking.to_mongo())
    doc = await db.bookings.find_one({"_id": result.inserted_id})
    return Booking.from_mongo(doc).model_dump(by_alias=False)


@api_router.get("/bookings/my")
async def my_bookings(user: dict = Depends(get_current_user)):
    docs = await db.bookings.find({"user_id": user["_id"]}).sort("created_at", -1).to_list(200)
    return [Booking.from_mongo(d).model_dump(by_alias=False) for d in docs]


# ---------- Subscriptions (mock checkout) ----------

class SubscriptionCreate(BaseModel):
    plan_id: str


class Subscription(BaseDocument):
    user_id: str
    plan_id: str
    plan_name: str
    price: int
    status: str = "active"
    started_at: str
    expires_at: str
    payment_mode: str = "mock"


@api_router.post("/subscriptions")
async def create_subscription(input: SubscriptionCreate, user: dict = Depends(get_current_user)):
    plan = next((p for p in PLANS if p["plan_id"] == input.plan_id), None)
    if not plan:
        raise HTTPException(status_code=404, detail="Plan not found")
    now = datetime.now(timezone.utc)
    await db.subscriptions.update_many(
        {"user_id": user["_id"], "status": "active"}, {"$set": {"status": "replaced"}}
    )
    sub = Subscription(
        user_id=user["_id"],
        plan_id=plan["plan_id"],
        plan_name=plan["name"],
        price=plan["price"],
        started_at=now.isoformat(),
        expires_at=(now + timedelta(days=plan["duration_days"])).isoformat(),
    )
    result = await db.subscriptions.insert_one(sub.to_mongo())
    doc = await db.subscriptions.find_one({"_id": result.inserted_id})
    return Subscription.from_mongo(doc).model_dump(by_alias=False)


@api_router.get("/subscriptions/my")
async def my_subscriptions(user: dict = Depends(get_current_user)):
    docs = await db.subscriptions.find({"user_id": user["_id"]}).sort("started_at", -1).to_list(50)
    return [Subscription.from_mongo(d).model_dump(by_alias=False) for d in docs]


# ---------- Reminders ----------

class ReminderCreate(BaseModel):
    title: str
    date: str
    time: str
    notes: Optional[str] = ""


class Reminder(BaseDocument):
    user_id: str
    title: str
    date: str
    time: str
    notes: str = ""
    created_at: Optional[str] = None


@api_router.post("/reminders")
async def create_reminder(input: ReminderCreate, user: dict = Depends(get_current_user)):
    reminder = Reminder(user_id=user["_id"], **input.model_dump(), created_at=datetime.now(timezone.utc).isoformat())
    result = await db.reminders.insert_one(reminder.to_mongo())
    doc = await db.reminders.find_one({"_id": result.inserted_id})
    return Reminder.from_mongo(doc).model_dump(by_alias=False)


@api_router.get("/reminders/my")
async def my_reminders(user: dict = Depends(get_current_user)):
    docs = await db.reminders.find({"user_id": user["_id"]}).sort("date", 1).to_list(200)
    return [Reminder.from_mongo(d).model_dump(by_alias=False) for d in docs]


# ---------- Callback requests (public) ----------

class CallbackCreate(BaseModel):
    name: str
    phone: str
    message: Optional[str] = ""


@api_router.post("/callbacks")
async def request_callback(input: CallbackCreate):
    doc = input.model_dump()
    doc["created_at"] = datetime.now(timezone.utc).isoformat()
    await db.callbacks.insert_one(doc)
    return {"message": "Thank you! Our care team will call you shortly."}


# ---------- Dashboard ----------

@api_router.get("/dashboard")
async def dashboard(user: dict = Depends(get_current_user)):
    subs = await db.subscriptions.find({"user_id": user["_id"], "status": "active"}).sort("started_at", -1).to_list(1)
    bookings = await db.bookings.find({"user_id": user["_id"]}).sort("date", 1).to_list(100)
    reminders = await db.reminders.find({"user_id": user["_id"]}).sort("date", 1).to_list(100)
    return {
        "user": UserPublic.from_mongo(user).model_dump(by_alias=False),
        "subscription": Subscription.from_mongo(subs[0]).model_dump(by_alias=False) if subs else None,
        "bookings": [Booking.from_mongo(d).model_dump(by_alias=False) for d in bookings],
        "reminders": [Reminder.from_mongo(d).model_dump(by_alias=False) for d in reminders],
    }


# ---------- Startup seed ----------

async def seed_users():
    admin_email = os.environ.get("ADMIN_EMAIL", "").lower()
    admin_password = os.environ.get("ADMIN_PASSWORD", "")
    if admin_email and admin_password:
        existing = await db.users.find_one({"email": admin_email})
        if existing is None:
            await db.users.insert_one({
                "name": "Madhurima (Admin)",
                "email": admin_email,
                "phone": "",
                "password_hash": hash_password(admin_password),
                "role": "admin",
                "created_at": datetime.now(timezone.utc).isoformat(),
            })
        elif not verify_password(admin_password, existing["password_hash"]):
            await db.users.update_one({"email": admin_email}, {"$set": {"password_hash": hash_password(admin_password)}})

    test_email = "testuser@alderly.in"
    if await db.users.find_one({"email": test_email}) is None:
        await db.users.insert_one({
            "name": "Test User",
            "email": test_email,
            "phone": "9876543210",
            "password_hash": hash_password("Test@12345"),
            "role": "user",
            "created_at": datetime.now(timezone.utc).isoformat(),
        })


@app.on_event("startup")
async def startup():
    await db.users.create_index("email", unique=True)
    await seed_users()


@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()


app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_origins=os.environ.get("CORS_ORIGINS", "*").split(","),
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)
