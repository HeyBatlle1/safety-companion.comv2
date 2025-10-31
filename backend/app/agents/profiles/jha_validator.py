from app.agents.base import BaseAgent, AgentTask, AgentResponse, ModelCapability, ModelProvider
from app.agents.registry import AgentRegistry
import json
from typing import Dict, Any

class JHAValidatorAgent(BaseAgent):
    """
    Agent 1: Data Validator
    Requires: Fast reasoning + Structured output
    Best models: Gemini 2.5 Flash, Claude Sonnet
    """

    def __init__(self, registry: AgentRegistry):
        super().__init__(
            name="jha_validator",
            description="Validates JHA checklist data quality and identifies critical gaps"
        )
        self.registry = registry

    def get_capabilities(self) -> list[ModelCapability]:
        """This agent needs fast, precise validation"""
        return [
            ModelCapability.FAST_REASONING,
            ModelCapability.STRUCTURED_OUTPUT
        ]

    def get_trade_specific_fields(self, work_type: str) -> str:
        """Get trade-specific critical fields based on work type"""
        work_type_lower = work_type.lower()

        if 'electric' in work_type_lower:
            return """Electrical Trade Critical Fields:
   - LOTO (Lock-Out Tag-Out) procedures with specific energy sources
   - Arc flash PPE category (0-4) with calorie rating
   - Voltage testing procedure (must use rated test equipment)
   - Qualified person designation for electrical work
   - Approach boundaries clearly defined"""

        elif 'roof' in work_type_lower:
            return """Roofing Trade Critical Fields:
   - Fall protection plan specific to roof type and slope
   - Weather monitoring procedures (wind, temperature, precipitation)
   - Material storage and loading plan for roof surface
   - Emergency descent plan from roof level"""

        elif 'scaffold' in work_type_lower:
            return """Scaffolding Trade Critical Fields:
   - Scaffold erection plan with certified competent person
   - Load calculations for intended use
   - Daily inspection procedures and documentation
   - Tie-in requirements to building structure"""

        elif 'crane' in work_type_lower:
            return """Crane Operations Critical Fields:
   - Crane operator certification and medical clearance
   - Lift plan with load charts and rigging details
   - Ground conditions assessment and outrigger setup
   - Communication protocols between operator and signal person"""

        elif 'glass' in work_type_lower or 'glazing' in work_type_lower:
            return """Glass Installation Critical Fields:
   - Wind speed monitoring with specific work suspension limits
   - Glass handling equipment certification (vacuum lifters, suction cups)
   - Fall protection systems adequate for glass installation work
   - Emergency response plan for glass breakage and fall incidents"""

        else:
            return """General Construction Critical Fields:
   - Competent person designated for identified hazards
   - Site-specific hazard assessment completed
   - Emergency action plan appropriate for work scope
   - Worker training verification for task-specific hazards"""

    def get_prompt_template(self) -> str:
        """Exact Agent 1 prompt from multiAgentSafety.ts"""
        return """You are a construction safety data validator with expertise in OSHA 1926 standards.
Analyze the provided checklist and weather data for completeness, quality, and safety adequacy.

INPUT DATA:
Checklist: {checklist_data}
Weather: {weather_data}
Industry: NAICS {naics_code} ({industry_name})
Baseline Injury Rate: {injury_rate} per 100 workers

VALIDATION REQUIREMENTS:

1. CRITICAL FIELD VERIFICATION:
   Universal Critical Fields:
   - Emergency evacuation plan with specific assembly point
   - Worker certifications (must list cert types: OSHA 10/30, etc.)
   - Equipment specifications (manufacturer, model, or last inspection date)
   - PPE requirements (specific types: hard hat, safety glasses, gloves, etc.)
   - Hazard identification (minimum 3 specific hazards listed)

   {trade_specific_fields}

2. RESPONSE QUALITY CHECK:
   - Flag "No response", "N/A", "Same", "Yes/No" without details
   - Flag responses < 3 words for critical fields
   - Flag contradictory answers (e.g., "no hazards" but lists PPE requirements)
   - Flag generic responses (e.g., "be careful" instead of specific control measures)

3. WEATHER DATA INTEGRATION:
   Current Conditions: {weather_summary}

   Weather-Related Critical Gaps:
   - If wind >15mph: Must document wind monitoring procedures
   - If temperature <32°F or >95°F: Must document temperature protection measures
   - If precipitation: Must document wet weather work suspension criteria
   - If poor visibility: Must document visibility monitoring procedures

4. TRADE-SPECIFIC VALIDATION:
   Work Type: {work_type}
   Apply additional scrutiny to trade-specific critical fields listed above.

5. SCORING (Objective Criteria):
   10 = All critical fields present, responses >5 words with specifics, weather risks addressed
   8-9 = 90%+ critical fields present, minor brevity in non-critical areas
   6-7 = 70-89% critical fields present, some generic responses
   4-5 = 50-69% critical fields present, multiple vague responses
   1-3 = <50% critical fields present, insufficient for safe analysis
   0 = Checklist empty or malformed

6. DATA QUALITY ASSESSMENT:
   - EXCELLENT: Comprehensive, specific, addresses all identified hazards
   - GOOD: Adequate detail, minor gaps in non-critical areas
   - MEDIUM: Some important gaps, requires follow-up for critical items
   - POOR: Major gaps in critical safety areas, inadequate for analysis
   - UNACCEPTABLE: Cannot proceed with analysis due to insufficient data

7. MISSING CRITICAL IDENTIFICATION:
   List specific critical fields that are missing or inadequate:
   - Emergency procedures: [Specific gaps]
   - Worker qualifications: [Specific gaps]
   - Equipment/PPE: [Specific gaps]
   - Hazard controls: [Specific gaps]
   - Weather considerations: [Specific gaps]

8. SAFETY CONCERNS:
   Immediate attention required for:
   - Life safety issues (fall protection, electrical, confined space)
   - Environmental hazards (weather, visibility, ground conditions)
   - Regulatory compliance gaps (OSHA standards violations)
   - Resource adequacy (staffing, equipment, time constraints)

OUTPUT FORMAT (ONLY VALID JSON):

{{
  "validation": {{
    "qualityScore": <1-10>,
    "dataQuality": "EXCELLENT|GOOD|MEDIUM|POOR|UNACCEPTABLE",
    "completeness": "<percentage>% complete",
    "reviewStatus": "APPROVED|CONDITIONAL|REJECTED"
  }},
  "missingCritical": [
    "Specific missing critical field 1",
    "Specific missing critical field 2"
  ],
  "concerns": {{
    "lifeSafety": [
      "Fall protection plan incomplete",
      "No competent person designated"
    ],
    "environmental": [
      "No wind monitoring procedures",
      "Temperature protection not addressed"
    ],
    "regulatory": [
      "OSHA 1926.502 compliance gap: fall protection",
      "OSHA 1926.95 violation: PPE requirements undefined"
    ],
    "resources": [
      "Insufficient crew for scope of work",
      "Equipment certification expired"
    ]
  }},
  "weatherIntegration": {{
    "currentConditions": "Summary of weather impact on work",
    "weatherRisks": [
      "High wind risk for overhead work",
      "Cold stress risk for extended outdoor exposure"
    ],
    "weatherControls": [
      "Wind monitoring required every 30 minutes",
      "Heated shelter required for breaks"
    ]
  }},
  "recommendations": [
    "Complete fall protection plan before work authorization",
    "Designate competent person for high-risk activities",
    "Implement weather monitoring procedures"
  ],
  "tradeSpecificFindings": {{
    "workType": "{work_type}",
    "specificGaps": [
      "Trade-specific gap 1",
      "Trade-specific gap 2"
    ],
    "additionalRequirements": [
      "Trade-specific requirement 1",
      "Trade-specific requirement 2"
    ]
  }}
}}

CRITICAL: Output ONLY valid JSON. Any text outside JSON will cause parsing failure."""

    async def execute(self, task: AgentTask) -> AgentResponse:
        """Execute JHA validation"""

        # Extract data from task
        checklist_data = task.input_data.get("checklist", {})
        weather_data = task.input_data.get("weather", {})

        # Extract work type from checklist
        work_type = checklist_data.get("workType", "General Construction")

        # Get OSHA industry data (with defaults)
        osha_data = task.input_data.get("osha_data", {
            "industryName": "Specialty Trade Contractors",
            "naicsCode": "238",
            "injuryRate": 35
        })

        # Create weather summary
        weather_summary = f"Temp: {weather_data.get('temperature', 'N/A')}°F, Wind: {weather_data.get('windSpeed', 'N/A')}mph, Conditions: {weather_data.get('conditions', 'N/A')}"

        # Build prompt from template
        prompt = self.get_prompt_template().format(
            checklist_data=json.dumps(checklist_data, indent=2),
            weather_data=json.dumps(weather_data, indent=2),
            naics_code=osha_data.get("naicsCode", "238"),
            industry_name=osha_data.get("industryName", "Construction"),
            injury_rate=osha_data.get("injuryRate", 35),
            trade_specific_fields=self.get_trade_specific_fields(work_type),
            weather_summary=weather_summary,
            work_type=work_type
        )

        # Route to best model
        adapter = self.registry.route_task(AgentTask(
            task_type="jha_validation",
            input_data=task.input_data,
            temperature=0.3,  # Agent 1 temperature from multiAgentSafety.ts
            required_capabilities=self.get_capabilities()
        ))

        # Execute
        try:
            result = await adapter.generate(
                prompt=prompt,
                temperature=0.3,
                max_tokens=12000,  # Agent 1 max tokens from multiAgentSafety.ts
                response_format="json"
            )

            # Debug: Log the raw response
            raw_response = result["text"]
            print(f"🔍 Agent 1 Raw Response (first 500 chars): {raw_response[:500]}...")

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
                error=f"JHA validation failed: {str(e)}"
            )