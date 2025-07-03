from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, EmailStr
from google.cloud import firestore
from passlib.context import CryptContext
from fastapi import Depends
from fastapi.security import OAuth2PasswordBearer
from datetime import datetime, timedelta
from datetime import timezone
from jose import JWTError, jwt

# Initialize FastAPI app
app = FastAPI()

# Initialize Firestore client
db = firestore.Client(project="diet-cap-55397")

# Password hashing context
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# JWT Configuration
SECRET_KEY = "secret-key-change-this-in-production"
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30

# OAuth2 scheme for token authentication
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="login")

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:5173"],  # Frontend URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Pydantic models for validation
class User(BaseModel):
    email: EmailStr
    password: str
    firstName: str = None
    lastName: str = None


def create_access_token(data:dict):
    """
    Create a JWT access token.
    """
    to_encode = data.copy()
    expire = datetime.now(timezone.utc) + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

def verify_token(token: str = Depends(oauth2_scheme)):
    """
    Verify the JWT token.
    """
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        email: str = payload.get("sub")
        if email is None:
            raise HTTPException(status_code=401, detail="Invalid authentication credentials")
        return email
    except JWTError:
        raise HTTPException(status_code=401, detail="Invalid token")  


@app.post("/signup")
async def signup(user: User):
    """
    Endpoint to handle user signup.
    """
    # Check if user already exists
    users_ref = db.collection("users")
    existing_user = users_ref.where("email", "==", user.email).get()
    if existing_user:
        raise HTTPException(status_code=400, detail="User already exists")

    # Hash the password
    hashed_password = pwd_context.hash(user.password)

    # Save user to Firestore
    user_doc = users_ref.document()
    user_doc.set({
        "email": user.email,
        "password": hashed_password,
        "firstName": user.firstName,
        "lastName": user.lastName,
    })
    return {"message": "User created successfully", "id": user_doc.id}

@app.post("/login")
async def login(user: User):
    """
    Endpoint to handle user login.
    """
    # Check if user exists
    users_ref = db.collection("users")
    existing_user = users_ref.where("email", "==", user.email).get()
    if not existing_user:
        raise HTTPException(status_code=400, detail="Invalid email or password")

    # Validate password
    user_data = existing_user[0].to_dict()
    if not pwd_context.verify(user.password, user_data["password"]):
        raise HTTPException(status_code=400, detail="Invalid email or password")

    # Generate JWT token
    access_token = create_access_token(data={"sub": user.email})
    
    # Don't return the password in the response
    user_data.pop("password", None)
    
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user": user_data
    }

@app.get("/profile")
async def get_profile(current_user: str = Depends(verify_token)):
    """
    Get current user's profile - Protected route
    """
    users_ref = db.collection("users")
    user_doc = users_ref.where("email", "==", current_user).get()
    
    if not user_doc:
        raise HTTPException(status_code=404, detail="User not found")
    
    user_data = user_doc[0].to_dict()
    
    return {
        "user": {
            "firstName": user_data.get("firstName"),
            "lastName": user_data.get("lastName")
        }, 
        "message": f"Welcome to your profile, {user_data.get('firstName', 'User')}!"
    }

@app.get("/dashboard")
async def get_dashboard(current_user: str = Depends(verify_token)):
    """
    User dashboard - Protected route
    """
    users_ref = db.collection("users")
    user_doc = users_ref.where("email", "==", current_user).get()
    
    if not user_doc:
        raise HTTPException(status_code=404, detail="User not found")
    
    user_data = user_doc[0].to_dict()
    
    return {
        "message": f"Welcome to your dashboard, {user_data.get('firstName', 'User')}!",
        "dashboard_data": {
            "recent_activity": ["Login successful", "Profile viewed"],
            "stats": {
                "total_logins": 1,
                "last_login": datetime.now(timezone.utc).isoformat()
            }
        }
    }
