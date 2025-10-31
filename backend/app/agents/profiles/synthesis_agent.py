from app.agents.base import BaseAgent, AgentTask, AgentResponse, ModelCapability, ModelProvider
from app.agents.registry import AgentRegistry
import json
from typing import Dict, Any
from datetime import datetime

class SynthesisAgent(BaseAgent):
    """
    Agent 4: Report Synthesizer
    This agent uses structured TypeScript synthesis, not AI generation
    Combines outputs from agents 1-3 into final JHA report
    """

    def __init__(self, registry: AgentRegistry):
        super().__init__(
            name="synthesis_agent",
            description="Synthesizes final JHA report from agent outputs using structured templates"
        )
        self.registry = registry

    def get_capabilities(self) -> list[ModelCapability]:
        """This agent uses structured synthesis, minimal AI needed"""
        return [
            ModelCapability.STRUCTURED_OUTPUT
        ]

    def get_prompt_template(self) -> str:
        """Synthesis agent uses structured generation, not prompts"""
        return "N/A - Uses structured TypeScript synthesis"

    def determine_go_no_go_decision(self, validation: Dict, risk: Dict, prediction: Dict, weather: Dict) -> str:
        """
        Determine work authorization level based on agent outputs.
        Matches logic from multiAgentSafety.ts synthesizeReport()
        """

        # Extract key metrics
        quality_score = validation.get("qualityScore", 0)
        top_risk_score = 0
        if risk.get("hazards") and len(risk["hazards"]) > 0:
            top_risk_score = risk["hazards"][0].get("riskScore", 0)

        incident_probability = prediction.get("incidentPrediction", {}).get("probabilityNext4Hours", 0)
        weather_risk_level = weather.get("riskLevel", "LOW")

        # Decision logic (from Agent 4 in multiAgentSafety.ts)
        if (quality_score < 4 or
            top_risk_score >= 95 or
            incident_probability > 0.8 or
            weather_risk_level == "EXTREME"):
            return "STOP_WORK"

        elif (quality_score < 6 or
              top_risk_score >= 75 or
              incident_probability > 0.4 or
              weather_risk_level == "HIGH"):
            return "NO_GO"

        elif (quality_score < 7 or
              top_risk_score >= 50 or
              incident_probability > 0.2 or
              weather_risk_level == "MEDIUM"):
            return "GO_WITH_CONDITIONS"

        else:
            return "GO"

    def identify_compliance_gaps(self, validation: Dict, risk: Dict) -> list[Dict[str, Any]]:
        """Identify OSHA compliance gaps from validation and risk data"""
        gaps = []

        # From validation missing critical fields
        missing_critical = validation.get("missingCritical", [])
        for missing in missing_critical:
            gaps.append({
                "standard": "OSHA 1926.95",
                "requirement": missing,
                "severity": "Critical",
                "action": f"Document {missing} before work authorization"
            })

        # From risk assessment inadequate controls
        hazards = risk.get("hazards", [])
        for hazard in hazards:
            inadequate_controls = hazard.get("inadequateControls", [])
            for control in inadequate_controls:
                gaps.append({
                    "standard": hazard.get("regulatoryRequirement", "OSHA 1926"),
                    "requirement": control,
                    "severity": "High" if hazard.get("riskScore", 0) > 75 else "Medium",
                    "action": f"Implement additional controls for {hazard.get('name', 'identified hazard')}"
                })

        return gaps

    def assess_emergency_response(self, checklist_data: Dict, top_hazard: Dict) -> Dict[str, Any]:
        """Assess emergency response readiness"""
        gaps = []

        # Check for rescue capability (especially for fall hazards)
        hazard_name = top_hazard.get("name", "").lower()
        if "fall" in hazard_name:
            # Look for rescue plan in checklist
            has_rescue_plan = self._check_checklist_for_term(checklist_data, "rescue")
            rescue_capability = "ADEQUATE" if has_rescue_plan else "INADEQUATE"
            if not has_rescue_plan:
                gaps.append("No documented fall rescue plan")
        else:
            rescue_capability = "NOT_REQUIRED"

        # Check other emergency components
        first_aid = self._check_checklist_for_term(checklist_data, "first aid")
        communication = self._check_checklist_for_term(checklist_data, ["radio", "communication"])
        evacuation_plan = self._check_checklist_for_term(checklist_data, ["evacuation", "emergency exit"])

        if not first_aid:
            gaps.append("First aid equipment not documented")
        if not communication:
            gaps.append("Communication systems not documented")
        if not evacuation_plan:
            gaps.append("Evacuation plan not documented")

        return {
            "rescueCapability": rescue_capability,
            "firstAid": first_aid,
            "communication": communication,
            "evacuationPlan": evacuation_plan,
            "gaps": gaps
        }

    def _check_checklist_for_term(self, checklist_data: Dict, terms) -> bool:
        """Helper to check if terms appear in checklist responses"""
        if isinstance(terms, str):
            terms = [terms]

        checklist_str = json.dumps(checklist_data).lower()
        return any(term.lower() in checklist_str for term in terms)

    def generate_action_items(self, go_no_go: str, compliance_gaps: list, emergency_gaps: list, interventions: list) -> list[Dict[str, Any]]:
        """Generate prioritized action items"""
        actions = []

        # Critical actions based on decision
        if go_no_go == "STOP_WORK":
            actions.append({
                "priority": "CRITICAL",
                "action": "STOP ALL WORK - Critical safety conditions identified",
                "timeframe": "Immediate",
                "responsibility": "Site supervisor"
            })

        # Compliance gap actions
        for gap in compliance_gaps:
            priority = "CRITICAL" if gap["severity"] == "Critical" else "HIGH"
            actions.append({
                "priority": priority,
                "action": gap["action"],
                "timeframe": "Before work authorization" if gap["severity"] == "Critical" else "Within 24 hours",
                "responsibility": "Safety manager"
            })

        # Emergency response gaps
        for gap in emergency_gaps:
            actions.append({
                "priority": "HIGH",
                "action": f"Address emergency gap: {gap}",
                "timeframe": "Before work authorization",
                "responsibility": "Emergency coordinator"
            })

        # Intervention actions from Swiss Cheese analysis
        for intervention in interventions[:3]:  # Top 3 interventions
            timeframe = intervention.get("timeframe", "Within 2 hours")
            actions.append({
                "priority": "MEDIUM",
                "action": intervention.get("action", "Implement intervention"),
                "timeframe": timeframe,
                "responsibility": intervention.get("responsibility", "Site supervisor")
            })

        return actions

    async def execute(self, task: AgentTask) -> AgentResponse:
        """Execute report synthesis using structured generation"""

        try:
            # Extract agent outputs
            validation = task.input_data.get("validation", {})
            risk = task.input_data.get("risk", {})
            prediction = task.input_data.get("prediction", {})
            weather = task.input_data.get("weather", {})
            checklist = task.input_data.get("checklist", {})

            # Extract metadata
            now = datetime.utcnow()
            site_location = checklist.get("location", "Location not specified")
            work_type = checklist.get("workType", "Work type not specified")
            supervisor = checklist.get("supervisor", "Not specified")
            project_name = checklist.get("projectName", "Unnamed Project")

            # Generate report components
            go_no_go = self.determine_go_no_go_decision(validation, risk, prediction, weather)
            compliance_gaps = self.identify_compliance_gaps(validation, risk)

            top_hazard = risk.get("hazards", [{}])[0] if risk.get("hazards") else {}
            emergency_readiness = self.assess_emergency_response(checklist, top_hazard)

            interventions = prediction.get("interventions", [])
            action_items = self.generate_action_items(
                go_no_go,
                compliance_gaps,
                emergency_readiness.get("gaps", []),
                interventions
            )

            # Build structured final report
            final_report = {
                "metadata": {
                    "reportId": f"JHA-{int(now.timestamp())}-{hash(str(checklist)) % 10000:04d}",
                    "generatedAt": now.isoformat(),
                    "projectName": project_name,
                    "location": site_location,
                    "workType": work_type,
                    "supervisor": supervisor
                },
                "executiveSummary": {
                    "decision": go_no_go,
                    "overallRiskLevel": risk.get("riskSummary", {}).get("overallRiskLevel", "MEDIUM"),
                    "keyFindings": [
                        f"Data quality: {validation.get('dataQuality', 'UNKNOWN')} ({validation.get('qualityScore', 0)}/10)",
                        f"Top risk score: {top_hazard.get('riskScore', 0)}/100",
                        f"Incident probability (4hrs): {prediction.get('incidentPrediction', {}).get('probabilityNext4Hours', 0):.1%}"
                    ],
                    "actionRequired": len(action_items) > 0
                },
                "hazardAnalysis": {
                    "identifiedHazards": risk.get("hazards", []),
                    "topThreats": risk.get("topThreats", []),
                    "weatherImpact": risk.get("weatherImpact", "No significant weather impact identified")
                },
                "incidentPrediction": {
                    "predictedIncident": prediction.get("incidentPrediction", {}),
                    "causalChain": prediction.get("causalChain", {}),
                    "leadingIndicators": prediction.get("leadingIndicators", []),
                    "interventions": interventions
                },
                "complianceStatus": {
                    "overallStatus": "COMPLIANT" if len(compliance_gaps) == 0 else "GAPS_IDENTIFIED",
                    "identifiedGaps": compliance_gaps,
                    "criticalIssues": [gap for gap in compliance_gaps if gap["severity"] == "Critical"]
                },
                "emergencyReadiness": emergency_readiness,
                "actionItems": action_items,
                "qualityMetrics": {
                    "dataQualityScore": validation.get("qualityScore", 0),
                    "riskAssessmentConfidence": "High" if len(risk.get("hazards", [])) > 0 else "Low",
                    "predictionConfidence": prediction.get("incidentPrediction", {}).get("confidence", "Medium"),
                    "completeness": f"{((validation.get('qualityScore', 0) / 10) * 100):.0f}%"
                }
            }

            return AgentResponse(
                success=True,
                output_data={"finalReport": final_report},
                model_used="structured-synthesis",
                provider=ModelProvider.GOOGLE,  # Placeholder
                execution_time_ms=10,  # Structured synthesis is fast
                token_usage={"prompt_tokens": 0, "completion_tokens": 0, "total_tokens": 0}
            )

        except Exception as e:
            return AgentResponse(
                success=False,
                output_data={},
                model_used="structured-synthesis",
                provider=ModelProvider.GOOGLE,
                execution_time_ms=0,
                token_usage={},
                error=f"Report synthesis failed: {str(e)}"
            )