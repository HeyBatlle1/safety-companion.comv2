"""
JHA Orchestrator

Manages the 4-agent pipeline for Job Hazard Analysis.
Replicates the multiAgentSafety.ts workflow in Python.
"""

from typing import Dict, Any, Optional
from uuid import UUID
from datetime import datetime
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app.agents.registry import AgentRegistry
from app.agents.base import AgentTask, ModelCapability
from app.agents.profiles.jha_validator import JHAValidatorAgent
from app.agents.profiles.risk_assessor import RiskAssessorAgent
from app.agents.profiles.swiss_cheese_analyzer import SwissCheeseAnalyzerAgent
from app.agents.profiles.synthesis_agent import SynthesisAgent
from app.models.analysis import AnalysisHistory
from app.models.jha_updates import JHAUpdate
from app.schemas.jha import JHAAnalysisRequest, JHAAnalysisResponse


class JHAOrchestrator:
    """
    Orchestrates the 4-agent JHA analysis pipeline.

    This replicates the multiAgentSafety.analyze() method from the Node backend,
    providing the same comprehensive analysis with agent output tracking.
    """

    def __init__(self, agent_registry: AgentRegistry, db: AsyncSession):
        self.registry = agent_registry
        self.db = db

        # Initialize agent profiles
        self.validator = JHAValidatorAgent(agent_registry)
        self.risk_assessor = RiskAssessorAgent(agent_registry)
        self.swiss_cheese = SwissCheeseAnalyzerAgent(agent_registry)
        self.synthesizer = SynthesisAgent(agent_registry)

    async def execute_full_analysis(
        self,
        request: JHAAnalysisRequest,
        user_id: UUID,
        company_id: Optional[UUID] = None
    ) -> JHAAnalysisResponse:
        """
        Execute the complete 4-agent pipeline.

        This matches the V1 endpoint: POST /api/checklist-analysis
        """

        pipeline_start = datetime.utcnow()

        # Create analysis record for tracking (disabled for testing)
        # analysis_record = AnalysisHistory(
        #     user_id=user_id,
        #     query=f"JHA Analysis - {request.project_data.get('projectName', 'Master JHA') if request.project_data else 'Master JHA'}",
        #     response="Generating multi-agent safety analysis...",
        #     type="jha_multi_agent_analysis"
        # )

        # self.db.add(analysis_record)
        # await self.db.commit()
        # await self.db.refresh(analysis_record)

        try:
            # Prepare base task data
            base_task_data = {
                "checklist": request.dict(),
                "weather": request.weather_conditions or {},
                "osha_data": {
                    "industryName": "Specialty Trade Contractors",
                    "naicsCode": "238",
                    "injuryRate": 35,
                    "totalCases": 198400,
                    "dataSource": "BLS_Table_1_2023"
                },
                "current_time": datetime.utcnow().isoformat()
            }

            # AGENT 1: Data Validation (Temperature 0.3)
            print("📋 Agent 1: Validating data quality...")
            agent1_task = AgentTask(
                task_type="jha_validation",
                input_data=base_task_data,
                temperature=0.3,
                required_capabilities=[ModelCapability.FAST_REASONING, ModelCapability.STRUCTURED_OUTPUT]
            )

            validation_result = await self.validator.execute(agent1_task)
            if not validation_result.success:
                raise ValueError(f"Agent 1 validation failed: {validation_result.error}")

            validation_data = validation_result.output_data
            print(f"✓ Data quality: {validation_data.get('validation', {}).get('dataQuality', 'UNKNOWN')}")

            # AGENT 2: Risk Assessment (Temperature 0.7)
            print("⚠️ Agent 2: Assessing risks with OSHA data...")
            agent2_task_data = base_task_data.copy()
            agent2_task_data["validation"] = validation_data

            agent2_task = AgentTask(
                task_type="risk_assessment",
                input_data=agent2_task_data,
                temperature=0.7,
                required_capabilities=[ModelCapability.FAST_REASONING, ModelCapability.STRUCTURED_OUTPUT]
            )

            risk_result = await self.risk_assessor.execute(agent2_task)
            if not risk_result.success:
                raise ValueError(f"Agent 2 risk assessment failed: {risk_result.error}")

            risk_data = risk_result.output_data
            hazard_count = len(risk_data.get("hazards", []))
            print(f"✓ Identified {hazard_count} hazards")

            # AGENT 3: Swiss Cheese Incident Prediction (Temperature 1.0)
            print("🔮 Agent 3: Predicting incident scenarios...")
            agent3_task_data = base_task_data.copy()
            agent3_task_data["validation"] = validation_data
            agent3_task_data["risk_assessment"] = risk_data

            agent3_task = AgentTask(
                task_type="swiss_cheese_analysis",
                input_data=agent3_task_data,
                temperature=1.0,
                required_capabilities=[ModelCapability.DEEP_REASONING, ModelCapability.CREATIVE, ModelCapability.STRUCTURED_OUTPUT]
            )

            prediction_result = await self.swiss_cheese.execute(agent3_task)
            if not prediction_result.success:
                raise ValueError(f"Agent 3 incident prediction failed: {prediction_result.error}")

            prediction_data = prediction_result.output_data
            incident_name = prediction_data.get("incidentPrediction", {}).get("incidentName", "Unknown incident")
            confidence = prediction_data.get("incidentPrediction", {}).get("confidence", "Unknown")
            print(f"✓ Predicted: {incident_name} (confidence: {confidence})")

            # AGENT 4: Report Synthesis (Structured)
            print("📄 Agent 4: Synthesizing final report...")
            agent4_task_data = {
                "validation": validation_data,
                "risk": risk_data,
                "prediction": prediction_data,
                "weather": base_task_data["weather"],
                "checklist": base_task_data["checklist"]
            }

            agent4_task = AgentTask(
                task_type="report_synthesis",
                input_data=agent4_task_data,
                temperature=0.5,
                required_capabilities=[ModelCapability.STRUCTURED_OUTPUT]
            )

            synthesis_result = await self.synthesizer.execute(agent4_task)
            if not synthesis_result.success:
                raise ValueError(f"Agent 4 synthesis failed: {synthesis_result.error}")

            final_report = synthesis_result.output_data.get("finalReport", {})
            print("✓ Pipeline complete!")

            # Return complete analysis result for testing
            return {
                "pipeline_metadata": {
                    "version": "python-multi-agent-v1.0",
                    "execution_time_ms": int((datetime.utcnow() - pipeline_start).total_seconds() * 1000),
                    "agents_used": {
                        "agent1_validator": {"success": validation_result.success, "model": validation_result.model_used},
                        "agent2_risk_assessor": {"success": risk_result.success, "model": risk_result.model_used},
                        "agent3_swiss_cheese": {"success": prediction_result.success, "model": prediction_result.model_used},
                        "agent4_synthesizer": {"success": synthesis_result.success, "model": synthesis_result.model_used}
                    }
                },
                "agent_outputs": {
                    "agent1_validation": validation_data,
                    "agent2_risk_assessment": risk_data,
                    "agent3_swiss_cheese": prediction_data,
                    "agent4_final_report": final_report
                },
                "summary": {
                    "overall_risk_score": risk_data.get("riskSummary", {}).get("highestRiskScore", 0),
                    "go_no_go_decision": final_report.get("decision", {}).get("goNoGo", "UNKNOWN"),
                    "primary_concerns": final_report.get("riskProfile", {}).get("primaryHazards", []),
                    "execution_time_seconds": (datetime.utcnow() - pipeline_start).total_seconds()
                }
            }

        except Exception as error:
            # Generate fallback report
            print(f"❌ Multi-agent pipeline error: {error}")

            fallback_report = {
                "metadata": {"reportId": f"FALLBACK-{int(datetime.utcnow().timestamp())}"},
                "executiveSummary": {
                    "decision": "NO_GO",
                    "overallRiskLevel": "HIGH",
                    "keyFindings": ["Analysis system error - manual review required"],
                    "actionRequired": True
                },
                "error": str(error)
            }

            return {
                "pipeline_metadata": {
                    "version": "python-multi-agent-v1.0",
                    "execution_time_ms": int((datetime.utcnow() - pipeline_start).total_seconds() * 1000),
                    "error": str(error),
                    "fallback": True
                },
                "error": f"Multi-agent analysis failed: {str(error)}",
                "fallback_report": fallback_report,
                "timestamp": datetime.utcnow().isoformat()
            }

    async def execute_live_update(
        self,
        analysis_id: UUID,
        update_data: Dict[str, Any]
    ) -> Dict[str, Any]:
        """
        Execute live update workflow.

        Re-runs Agent 2 (Risk) and Agent 3 (Swiss Cheese) with new conditions.
        """

        # Load original analysis
        result = await self.db.execute(
            select(AnalysisHistory).where(AnalysisHistory.id == analysis_id)
        )
        original_analysis = result.scalar_one_or_none()

        if not original_analysis:
            raise ValueError(f"Analysis {analysis_id} not found")

        # TODO: Implement live update logic
        # This would re-run agents 2-3 with updated conditions
        # For now, return placeholder

        return {
            "status": "live_update_complete",
            "analysis_id": str(analysis_id),
            "updated_at": datetime.utcnow().isoformat()
        }

    def _determine_urgency_level(self, final_report: Dict[str, Any]) -> str:
        """Determine urgency level from final report"""
        decision = final_report.get("executiveSummary", {}).get("decision", "GO")

        if decision == "STOP_WORK":
            return "CRITICAL"
        elif decision == "NO_GO":
            return "HIGH"
        elif decision == "GO_WITH_CONDITIONS":
            return "MEDIUM"
        else:
            return "LOW"

    def _extract_safety_categories(self, risk_data: Dict[str, Any]) -> list[str]:
        """Extract safety categories from risk assessment"""
        categories = []

        hazards = risk_data.get("hazards", [])
        for hazard in hazards:
            category = hazard.get("category", "").lower()
            if category and category not in categories:
                categories.append(category)

        return categories or ["general_safety"]