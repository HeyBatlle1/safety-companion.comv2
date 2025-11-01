"""
JHA Analysis API Routes

FastAPI endpoints for Job Hazard Analysis processing.
Matches the V1 Node.js API endpoints.
"""

from typing import Dict, Any
from uuid import UUID
from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.deps import get_db, get_jha_service
from app.services.jha_service import JHAService
from app.schemas.jha import (
    JHAAnalysisRequest,
    JHAAnalysisResponse,
    JHALiveUpdateRequest,
    JHALiveUpdateResponse,
    JHAUpdateAcknowledge
)

router = APIRouter(prefix="/jha", tags=["JHA Analysis"])


@router.post("/analyze")
async def analyze_checklist(
    request: JHAAnalysisRequest,
    jha_service: JHAService = Depends(get_jha_service)
):
    """
    Analyze Master JHA checklist through 4-agent pipeline.

    This endpoint matches the V1 Node.js endpoint:
    POST /api/checklist-analysis

    **Process:**
    1. Agent 1: Data validation with OSHA standards
    2. Agent 2: Risk assessment with quantitative scoring
    3. Agent 3: Swiss Cheese incident prediction
    4. Agent 4: Final report synthesis

    **Returns:**
    - Complete JHA analysis with GO/NO-GO decision
    - Quantitative risk scores (1-100)
    - Predicted incident scenarios
    - OSHA compliance assessment
    """
    try:
        # For testing: Direct orchestrator call without database
        from app.core.deps import get_agent_registry
        registry = get_agent_registry()

        # Create minimal orchestrator without database
        from app.agents.orchestrator import JHAOrchestrator
        from unittest.mock import AsyncMock

        mock_db = AsyncMock()
        orchestrator = JHAOrchestrator(registry, mock_db)

        user_id = UUID("00000000-0000-0000-0000-000000000000")

        # Call orchestrator directly, bypassing database persistence
        result = await orchestrator.execute_full_analysis(
            request=request,
            user_id=user_id
        )

        return result

    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Analysis failed: {str(e)}"
        )


# Legacy compatibility route for old frontend
@router.post("/jha-update")
async def jha_update_legacy(
    request: JHAAnalysisRequest,
    jha_service: JHAService = Depends(get_jha_service)
):
    """
    Legacy endpoint for old frontend compatibility.
    Maps to the same analyze_checklist function.
    """
    return await analyze_checklist(request, jha_service)


@router.post("/live-update", response_model=JHALiveUpdateResponse)
async def live_update(
    request: JHALiveUpdateRequest,
    jha_service: JHAService = Depends(get_jha_service)
):
    """
    Update existing JHA with live field conditions.

    **Use Cases:**
    - Weather conditions changed
    - Crew size modified
    - Equipment status updated
    - New hazards identified

    **Process:**
    - Re-runs Agent 2 (Risk Assessment) with new data
    - Re-runs Agent 3 (Swiss Cheese) for updated predictions
    - Generates crew alerts if risk threshold breached
    """
    try:
        # TODO: Extract user_id from authentication
        user_id = UUID("00000000-0000-0000-0000-000000000000")

        # TODO: Implement live update logic in JHAService
        # For now, return placeholder
        return JHALiveUpdateResponse(
            id=UUID("00000000-0000-0000-0000-000000000001"),
            original_jha_id=request.original_jha_id,
            user_id=user_id,
            voice_input=request.voice_input,
            requires_action=False,
            acknowledged=False,
            created_at=datetime.utcnow()
        )

    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Live update failed: {str(e)}"
        )


@router.post("/acknowledge")
async def acknowledge_update(
    request: JHAUpdateAcknowledge,
    db: AsyncSession = Depends(get_db)
):
    """
    Acknowledge a JHA update alert.

    **Purpose:**
    - Confirms crew received and understood the safety alert
    - Closes the safety loop for compliance tracking
    - Required for critical/stop-work alerts
    """
    try:
        # TODO: Implement acknowledgment logic
        # Update JHAUpdate model with acknowledgment details

        return {
            "status": "acknowledged",
            "update_id": str(request.update_id),
            "acknowledged_by": str(request.acknowledged_by),
            "acknowledged_at": datetime.utcnow().isoformat()
        }

    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Acknowledgment failed: {str(e)}"
        )


@router.get("/health")
async def health_check():
    """Health check for JHA analysis system"""
    return {
        "status": "healthy",
        "service": "jha-analysis",
        "version": "2.0.0-python",
        "agents": {
            "validator": "ready",
            "risk_assessor": "ready",
            "swiss_cheese": "ready",
            "synthesizer": "ready"
        }
    }