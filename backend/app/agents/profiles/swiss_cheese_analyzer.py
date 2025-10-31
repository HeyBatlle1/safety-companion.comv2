from app.agents.base import BaseAgent, AgentTask, AgentResponse, ModelCapability, ModelProvider
from app.agents.registry import AgentRegistry
import json
from typing import Dict, Any

class SwissCheeseAnalyzerAgent(BaseAgent):
    """
    Agent 3: Swiss Cheese Incident Predictor
    Requires: Deep reasoning + Creative capabilities
    Best models: Claude Opus, Gemini 2.5 Flash
    """

    def __init__(self, registry: AgentRegistry):
        super().__init__(
            name="swiss_cheese_analyzer",
            description="Predicts specific incidents using Swiss Cheese Model and Bow-Tie Analysis"
        )
        self.registry = registry

    def get_capabilities(self) -> list[ModelCapability]:
        """This agent needs deep reasoning and creative analysis"""
        return [
            ModelCapability.DEEP_REASONING,
            ModelCapability.CREATIVE,
            ModelCapability.STRUCTURED_OUTPUT
        ]

    def get_prompt_template(self) -> str:
        """Exact Agent 3 prompt from multiAgentSafety.ts"""
        return """You are an incident prediction specialist using the Swiss Cheese Model and Bow-Tie Analysis. Your expertise is in identifying latent organizational failures that combine with active errors to create incidents.

CONTEXT - TOP IDENTIFIED RISK:
{top_hazard}

FULL CHECKLIST DATA:
{checklist_data}

TEMPORAL CONTEXT:
Current Time: {current_time}
High-Risk Periods: 10:00-11:30 AM, 2:00-3:30 PM, last hour of shift, Friday afternoons
Weather Forecast (next 4 hours): {weather_forecast}

INDUSTRY INCIDENT HISTORY (OSHA):
{industry_name} (NAICS {naics_code})
Common Incident Types: Falls (36.5%), Struck-By (10.1%), Electrocution (8.5%), Caught-Between (7.3%)

YOUR TASK:
Predict the SPECIFIC causal chain that leads to this incident in the NEXT 4 HOURS if conditions don't change.

PREDICTION FRAMEWORK:

1. ORGANIZATIONAL INFLUENCES (Latent Conditions):
   Analyze systemic factors that create vulnerability:
   - Schedule Pressure: Evidence of time constraints, deadlines
   - Resource Constraints: Inadequate equipment, staffing, budget
   - Safety Culture: Management priorities, safety vs. production balance
   - Communication Breakdowns: Poor information flow, unclear procedures

2. UNSAFE SUPERVISION (Active Failures):
   Identify supervision gaps that enable unsafe acts:
   - Competent Person Designation: Is one assigned? Present? Qualified?
   - Inadequate Oversight: Frequency of safety checks, enforcement
   - Training Deficiencies: Skills gaps, knowledge limitations
   - Planning Failures: Incomplete hazard analysis, rushed planning

3. PRECONDITIONS FOR UNSAFE ACTS:
   A. Worker State:
      - Fatigue Risk: Shift length, sleep, workload
      - Experience Level: Years in trade, familiarity with task
      - Training Adequacy: Specific to identified hazards
      - Physical/Mental State: Stress, distraction, impairment

   B. Equipment State:
      - Condition Assessment: Wear, damage, age
      - Inspection Status: Current, overdue, never inspected
      - Adequacy for Task: Right tool for the job
      - Availability: Proper equipment present and accessible

   C. Environmental State:
      - Weather Effects: Wind, temperature, precipitation impact
      - Visibility Issues: Lighting, fog, obstructions
      - Workspace Conditions: Congestion, housekeeping, layout
      - Time Pressures: Rush to complete before weather/deadline

4. UNSAFE ACT (Trigger Event):
   Classify the specific error type that triggers the incident:

   - Skill-based (slip/lapse): Attention failure during routine task
     Example: "Experienced glazier fails to clip in during familiar positioning sequence"

   - Rule-based (mistake): Wrong procedure applied to situation
     Example: "Worker uses indoor lift procedures in 20mph wind conditions"

   - Knowledge-based (mistake): Novel problem, improvised solution
     Example: "Crew attempts untrained rigging method for oversized panel"

   - Violation (routine): Normalized deviation from procedure
     Example: "Team regularly skips safety briefing to save time"

   - Violation (situational): Pressured by schedule/cost to cut corners
     Example: "Supervisor directs work continuation despite wind speed limit"

5. ACCIDENT SEQUENCE:
   Describe the 30-second sequence from unsafe act to injury:
   - Initial unsafe act occurs
   - Immediate system response (or lack thereof)
   - Point of no return
   - Energy release/transfer
   - Contact and injury

6. DEFENSE FAILURES (Why Barriers Don't Work):
   For each barrier that SHOULD prevent this incident:

   Engineering Controls:
   - What is the barrier? (Guardrails, safety systems, equipment features)
   - Why doesn't it work? (Absent, Inadequate design, Bypassed, Failed)
   - Evidence from checklist: Quote specific response showing gap

   Administrative Controls:
   - What is the barrier? (Procedures, training, permits, inspections)
   - Why doesn't it work? (Not followed, poorly designed, not communicated)
   - Evidence from checklist: Quote response showing procedural gap

   PPE:
   - What is the barrier? (Harnesses, hard hats, safety glasses)
   - Why doesn't it work? (Not worn, inadequate for hazard, poorly maintained)
   - Evidence from checklist: Quote response about PPE status

7. INJURY MECHANISM (Energy Transfer):
   - Energy type: Kinetic (fall), Electrical, Thermal, Chemical, Radiation
   - Energy magnitude: Fall distance, voltage, temperature, force
   - Body part affected: Head, torso, extremities, specific injury location
   - Injury severity: Based on energy transfer and body vulnerability
   - Time to injury: Immediate, minutes, hours (for exposure incidents)

8. INCIDENT OUTCOME PREDICTION:
   - Most likely injury: Specific injury type and severity
   - Recovery time: Days/weeks/months off work
   - OSHA recordability: Recordable injury, days away from work, fatality
   - Secondary impacts: Crew trauma, work stoppage, investigation

LEADING INDICATORS (Observable Right Now):
Generate 5-7 specific, observable conditions that supervisors can see TODAY that indicate this incident is developing:

Behavioral Indicators:
- "2 of 4 workers not clipping into fall arrest when accessing building edge"
- "Crane operator taking longer than normal to position loads"
- "Workers discussing concerns about wind but continuing work"

Environmental Indicators:
- "Wind speed 28mph (approaching 30mph work suspension limit)"
- "Temperature dropping 5°F per hour, ice formation likely"
- "Fog reducing visibility to 100 feet at building top"

Organizational Indicators:
- "No competent person on-site for last 2 hours"
- "Project running 3 days behind schedule with no crew increase"
- "Safety meeting skipped this morning due to late material delivery"

Equipment/System Indicators:
- "Glass lifter overdue for monthly certification by 2 weeks"
- "Fall protection anchor points not load-tested as required"
- "Radio communication failing between ground and upper floors"

SWISS CHEESE ALIGNMENT:
Show how holes in different layers align to create the incident pathway:
- Organizational hole: [Specific systemic weakness]
- Supervision hole: [Specific oversight failure]
- Precondition hole: [Specific enabling condition]
- Act hole: [Specific unsafe behavior]
- Defense hole: [Specific barrier failure]

INTERVENTION POINTS:
Identify 3-4 specific actions that could break the causal chain:
1. Immediate (next 30 minutes): [Specific action to take now]
2. Short-term (next 2 hours): [Procedural/equipment intervention]
3. Systemic (this project): [Organizational change needed]
4. Long-term (future projects): [Program improvement]

OUTPUT FORMAT (ONLY VALID JSON):

{{
  "incidentPrediction": {{
    "incidentName": "Specific incident description with context",
    "probabilityNext4Hours": 0.15,
    "severity": "Fatal|Critical|Serious|Minor",
    "confidence": "High|Medium|Low",
    "peakRiskTime": "Time window when risk is highest"
  }},
  "causalChain": {{
    "organizationalInfluences": [
      {{
        "factor": "Schedule pressure",
        "evidence": "Quote from checklist",
        "contribution": "How this enables the incident"
      }}
    ],
    "unsafeSupervision": [
      {{
        "gap": "No competent person designated",
        "evidence": "Quote from checklist",
        "enablement": "How this allows unsafe acts"
      }}
    ],
    "preconditions": {{
      "workerState": ["Fatigue from 10-hour shifts", "Limited high-rise experience"],
      "equipmentState": ["Vacuum lifter overdue inspection", "Backup equipment unavailable"],
      "environmentalState": ["Wind gusts to 35mph", "Temperature dropping rapidly"]
    }},
    "unsafeAct": {{
      "type": "Skill-based slip",
      "description": "Worker fails to clip safety line during routine panel positioning",
      "trigger": "Distracted by radio call during critical moment"
    }},
    "defenseFailures": [
      {{
        "barrier": "Personal fall arrest system",
        "failureMode": "Not used consistently",
        "evidence": "Quote showing PPE compliance gap"
      }}
    ]
  }},
  "injuryMechanism": {{
    "energyType": "Kinetic",
    "energyMagnitude": "45-foot fall",
    "bodyPart": "Head and torso",
    "injurySeverity": "Fatal",
    "timeToInjury": "Immediate"
  }},
  "leadingIndicators": [
    {{
      "category": "Behavioral",
      "indicator": "2 of 4 workers not clipping in when at edge",
      "observability": "Visible to ground spotter",
      "urgency": "Address immediately"
    }}
  ],
  "interventions": [
    {{
      "timeframe": "Immediate (30 min)",
      "action": "Stop work until all workers demonstrate proper tie-off",
      "effectiveness": "High",
      "responsibility": "Site supervisor"
    }}
  ],
  "swissCheeseAlignment": {{
    "organizationalHole": "No safety culture - schedule over safety",
    "supervisionHole": "Competent person not present",
    "preconditionHole": "Workers fatigued from overtime",
    "actHole": "Normalized tie-off violations",
    "defenseHole": "Fall protection not enforced"
  }},
  "riskFactors": [
    "Wind speed approaching work limits",
    "Crew inexperience with building height",
    "Schedule pressure from weather delay"
  ]
}}

CRITICAL: Output ONLY valid JSON. Any text outside JSON will cause parsing failure.
Include specific quotes from the checklist as evidence for your analysis."""

    async def execute(self, task: AgentTask) -> AgentResponse:
        """Execute Swiss Cheese incident prediction"""

        # Extract data from task
        risk_data = task.input_data.get("risk_assessment", {})
        checklist_data = task.input_data.get("checklist", {})
        validation_data = task.input_data.get("validation", {})
        weather_data = task.input_data.get("weather", {})

        # Get top hazard from risk assessment
        top_hazard = risk_data.get("hazards", [{}])[0] if risk_data.get("hazards") else {}

        # Build prompt from template
        prompt = self.get_prompt_template().format(
            top_hazard=json.dumps(top_hazard, indent=2),
            checklist_data=json.dumps(checklist_data, indent=2),
            current_time=task.input_data.get("current_time", "Not specified"),
            weather_forecast=weather_data.get("forecast", "Not available"),
            industry_name=risk_data.get("oshaData", {}).get("industryName", "Construction"),
            naics_code=risk_data.get("oshaData", {}).get("naicsCode", "23")
        )

        # Route to best model for deep reasoning
        adapter = self.registry.route_task(AgentTask(
            task_type="swiss_cheese_analysis",
            input_data=task.input_data,
            temperature=1.0,  # Agent 3 temperature from multiAgentSafety.ts
            required_capabilities=self.get_capabilities()
        ))

        # Execute
        try:
            result = await adapter.generate(
                prompt=prompt,
                temperature=1.0,
                max_tokens=16000,  # Agent 3 max tokens from multiAgentSafety.ts
                response_format="json"
            )

            # Debug: Log the raw response
            raw_response = result["text"]
            print(f"🔍 Agent 3 Raw Response (first 500 chars): {raw_response[:500]}...")

            # Try to extract JSON from the response (handle markdown formatting)
            json_text = raw_response
            if "```json" in raw_response:
                # Extract JSON from markdown code block
                start = raw_response.find("```json") + 7
                end = raw_response.find("```", start)
                json_text = raw_response[start:end].strip()
            elif "```" in raw_response:
                # Extract from generic code block
                start = raw_response.find("```") + 3
                end = raw_response.find("```", start)
                json_text = raw_response[start:end].strip()

            # Parse and return
            output_data = json.loads(json_text)
            return AgentResponse(
                success=True,
                output_data=output_data,
                model_used=result["model"],
                provider=ModelProvider.GOOGLE if "gemini" in result["model"] else ModelProvider.ANTHROPIC,
                execution_time_ms=result["execution_time_ms"],
                token_usage=result["token_usage"]
            )

        except json.JSONDecodeError as e:
            return AgentResponse(
                success=False,
                output_data={},
                model_used=result.get("model", "unknown"),
                provider=ModelProvider.GOOGLE,
                execution_time_ms=result.get("execution_time_ms", 0),
                token_usage=result.get("token_usage", {}),
                error=f"Failed to parse JSON: {str(e)}"
            )
        except Exception as e:
            return AgentResponse(
                success=False,
                output_data={},
                model_used="unknown",
                provider=ModelProvider.GOOGLE,
                execution_time_ms=0,
                token_usage={},
                error=f"Swiss Cheese analysis failed: {str(e)}"
            )