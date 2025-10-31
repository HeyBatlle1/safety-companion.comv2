from sqlalchemy import MetaData
from app.core.database import Base

# Define schemas for organization
APP_SCHEMA = "public"  # User data (for now, we'll migrate to 'app' schema later)
OSHA_SCHEMA = "public"  # OSHA reference data

metadata = MetaData()