from app.models.base import Base
from app.models.user import User
from app.models.analysis import AnalysisHistory, AgentOutput
from app.models.safety import SafetyReport, RiskAssessment
from app.models.jha_updates import JHAUpdate  # NEW - replaces ChatMessage
from app.models.company import Company, Project
from app.models.notifications import NotificationPreference

# Export all models
__all__ = [
    "Base",
    "User",
    "AnalysisHistory",
    "AgentOutput",
    "SafetyReport",
    "RiskAssessment",
    "JHAUpdate",  # Purpose-built live updates
    "Company",
    "Project",
    "NotificationPreference",
]