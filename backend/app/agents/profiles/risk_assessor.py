from app.agents.base import BaseAgent, AgentTask, AgentResponse, ModelCapability, ModelProvider
from app.agents.registry import AgentRegistry
import json

class RiskAssessorAgent(BaseAgent):
    """
    Agent 2: Risk Assessment
    Requires: Fast reasoning + Structured output (JSON)
    Best models: Gemini 2.5 Flash, Claude Sonnet
    """

    def __init__(self, registry: AgentRegistry):
        super().__init__(
            name="risk_assessor",
            description="Calculates quantitative risk scores using OSHA Fatal Four statistics"
        )
        self.registry = registry

    def get_capabilities(self) -> list[ModelCapability]:
        """This agent needs fast, structured output"""
        return [
            ModelCapability.FAST_REASONING,
            ModelCapability.STRUCTURED_OUTPUT
        ]

    def get_prompt_template(self) -> str:
        """Exact Agent 2 prompt from multiAgentSafety.ts"""
        return """You are a construction risk assessor certified in OSHA 1926 standards with expertise in quantitative risk analysis.

VALIDATED DATA SUMMARY:
Quality: {data_quality} ({quality_score}/10)
Missing Critical: {missing_critical}
Key Concerns: {concerns}

FULL CHECKLIST:
{checklist_data}

OSHA INDUSTRY DATA (BLS 2023):
Industry: {industry_name}
NAICS Code: {naics_code}
Injury Rate: {injury_rate} per 100 workers annually
Total Cases: {total_cases}
Data Source: {data_source}

WEATHER CONDITIONS:
{weather_data}

RISK ASSESSMENT METHODOLOGY:

1. IDENTIFY TOP 3 SPECIFIC HAZARDS
   - Be SPECIFIC: "Fall from 30ft swing stage during 35mph winds"
   - NOT generic: "Fall hazard"
   - Focus on highest consequence and/or highest probability scenarios
   - Must be based on actual checklist content

2. FOR EACH HAZARD CALCULATE:

   A. PROBABILITY (0.0 to 1.0):

   Base = Industry injury rate: {injury_rate}/100 = {base_probability}

   Hazard Type Multiplier:
   - Falls from >6ft: ×2.8 (OSHA Fatal Four: 36.5% of deaths)
   - Struck by object: ×1.6 (OSHA Fatal Four: 10.1% of deaths)
   - Electrocution: ×0.4 (OSHA Fatal Four: 8.5% of deaths)
   - Caught between: ×0.9 (OSHA Fatal Four: 7.3% of deaths)
   - Other: ×1.0

   Control Adequacy Multiplier:
   - Comprehensive (3+ levels of hierarchy): ×0.3
   - Adequate (2 levels): ×0.7
   - Minimal (PPE only): ×1.5
   - None identified: ×3.0

   Weather Multiplier (if applicable):
   {weather_multipliers}

   Worker Experience Multiplier:
   - Expert (>5 years): ×0.6
   - Experienced (2-5 years): ×1.0
   - New (<1 year): ×2.1
   - Unknown: ×1.0

   Final Probability = Base × HazardType × Controls × Weather × Experience
   (Cap at 1.0 for display)

   B. CONSEQUENCE SEVERITY:

   Fatal (×10):
   - Death likely within 30 days
   - Examples: Fall >15ft, electrocution >50V, struck by heavy equipment
   - OSHA 1904.39: Report within 8 hours

   Critical (×7):
   - Hospitalization, amputation, eye loss
   - OSHA 1904.39: Report within 24 hours
   - Examples: Trench collapse burial, severe burns

   Serious (×4):
   - Days Away From Work (DAFW)
   - Medical treatment beyond first aid
   - Examples: Fractures, deep lacerations

   Minor (×1):
   - First aid only, no lost time
   - Examples: Cuts, bruises, minor strains

   C. RISK SCORE (1-100):

   Risk Score = (Probability × 100) × Severity Multiplier
   Cap at 100.

   Risk Classification:
   95-100 = EXTREME (Stop work immediately)
   75-94 = HIGH (Additional controls required)
   50-74 = MEDIUM (Enhanced monitoring)
   25-49 = LOW (Standard controls adequate)
   0-24 = MINIMAL (Routine procedures)

3. CONTROL EVALUATION (OSHA Hierarchy):

   For each hazard, assess controls against:
   L1-Elimination > L2-Substitution > L3-Engineering > L4-Administrative > L5-PPE

   Flag inadequate controls:
   - PPE-only approach (should have engineering)
   - Missing competent person designation
   - No emergency response plan
   - Controls not specific to hazard

   Recommend improvements following hierarchy.

4. OSHA STATISTICAL CONTEXT:

   For each hazard, cite relevant statistic:
   - Falls: "36.5% of construction fatalities (OSHA 2023)"
   - If industry injury rate high: "This trade has {injury_rate}/100 injury rate, {industry_comparison}% above construction average"
   - Weather-related: "Wet conditions increase slip/fall incidents by 60%"

OUTPUT FORMAT (ONLY VALID JSON):

{{
  "riskSummary": {{
    "overallRiskLevel": "EXTREME|HIGH|MEDIUM|LOW",
    "highestRiskScore": <number>,
    "industryContext": "Brief comparison to {industry_name} baseline"
  }},
  "hazards": [
    {{
      "name": "Specific hazard with context (work type, height, conditions)",
      "category": "Falls|Struck-By|Electrocution|Caught-Between|Other",
      "probability": <0.0-1.0>,
      "probabilityCalculation": {{
        "base": <number>,
        "hazardMultiplier": <number>,
        "controlMultiplier": <number>,
        "weatherMultiplier": <number>,
        "experienceMultiplier": <number>,
        "final": <number>
      }},
      "consequence": "Fatal|Critical|Serious|Minor",
      "riskScore": <1-100>,
      "riskLevel": "EXTREME|HIGH|MEDIUM|LOW",
      "oshaContext": "Specific OSHA statistic or regulation reference",
      "inadequateControls": [
        "Specific control gap 1",
        "Specific control gap 2"
      ],
      "recommendedControls": [
        "L1-Elimination: Specific recommendation",
        "L3-Engineering: Specific recommendation",
        "L4-Administrative: Specific recommendation"
      ],
      "regulatoryRequirement": "OSHA 1926.xxx citation if applicable"
    }}
  ],
  "topThreats": [
    "Threat 1 (Risk Score: XX)",
    "Threat 2 (Risk Score: XX)",
    "Threat 3 (Risk Score: XX)"
  ],
  "weatherImpact": "Description of how current weather affects risk levels",
  "immediateActions": ["Action 1 if EXTREME/HIGH risk", "Action 2"]
}}

CRITICAL: Output ONLY valid JSON. Any text outside JSON will cause parsing failure."""

    def _format_weather_multipliers(self, weather_data: dict) -> str:
        """Format weather multipliers for prompt"""
        multipliers = []

        if weather_data.get("temperature"):
            temp = weather_data["temperature"]
            if temp < 32 or temp > 95:
                multipliers.append("- Extreme temp: ×1.4")

        if weather_data.get("windSpeed") and weather_data["windSpeed"] > 25:
            multipliers.append("- High winds: ×1.8")

        if weather_data.get("precipitation"):
            multipliers.append("- Precipitation: ×1.6")

        if not multipliers:
            multipliers.append("- Normal: ×1.0")

        return "\n   ".join(multipliers)

    async def execute(self, task: AgentTask) -> AgentResponse:
        """Execute risk assessment"""

        # Extract data from task
        validation_data = task.input_data.get("validation", {})
        checklist_data = task.input_data.get("checklist", {})
        weather_data = task.input_data.get("weather", {})
        osha_data = task.input_data.get("osha_data", {
            "industryName": "Specialty Trade Contractors",
            "naicsCode": "238",
            "injuryRate": 35,
            "totalCases": 198400,
            "dataSource": "BLS_Table_1_2023"
        })

        # Calculate base probability
        injury_rate = osha_data.get("injuryRate", 35)
        base_probability = injury_rate / 100

        # Build prompt from template
        prompt = self.get_prompt_template().format(
            data_quality=validation_data.get("dataQuality", "MEDIUM"),
            quality_score=validation_data.get("qualityScore", 5),
            missing_critical=json.dumps(validation_data.get("missingCritical", [])),
            concerns=json.dumps(validation_data.get("concerns", {})),
            checklist_data=json.dumps(checklist_data, indent=2),
            industry_name=osha_data.get("industryName", "Construction"),
            naics_code=osha_data.get("naicsCode", "238"),
            injury_rate=injury_rate,
            total_cases=osha_data.get("totalCases", 0),
            data_source=osha_data.get("dataSource", "BLS_2023"),
            weather_data=json.dumps(weather_data, indent=2),
            base_probability=base_probability,
            weather_multipliers=self._format_weather_multipliers(weather_data),
            industry_comparison=round((injury_rate/35)*100) if injury_rate != 35 else 100
        )

        # Route to best model
        adapter = self.registry.route_task(AgentTask(
            task_type="risk_assessment",
            input_data=task.input_data,
            temperature=0.7,  # Agent 2 temperature from multiAgentSafety.ts
            required_capabilities=self.get_capabilities()
        ))

        # Execute
        try:
            result = await adapter.generate(
                prompt=prompt,
                temperature=0.7,
                max_tokens=16000,  # Agent 2 max tokens from multiAgentSafety.ts
                response_format="json"
            )

            # Debug: Log the raw response
            raw_response = result["text"]
            print(f"🔍 Agent 2 Raw Response (first 500 chars): {raw_response[:500]}...")

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
                error=f"Risk assessment failed: {str(e)}"
            )