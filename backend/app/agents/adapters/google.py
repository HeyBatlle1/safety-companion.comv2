import google.generativeai as genai
from datetime import datetime
from typing import Dict, Any, Optional
from app.agents.adapters.base_adapter import BaseModelAdapter
from app.agents.base import ModelCapability

class GoogleGeminiAdapter(BaseModelAdapter):
    """Adapter for Google Gemini models"""

    def __init__(self, api_key: str, model: str = "gemini-2.5-flash"):
        genai.configure(api_key=api_key)
        self.model = genai.GenerativeModel(model)
        self.model_name = model

    async def generate(
        self,
        prompt: str,
        temperature: float,
        max_tokens: Optional[int] = None,
        response_format: Optional[str] = None
    ) -> Dict[str, Any]:
        """Generate completion from Gemini"""

        start_time = datetime.utcnow()

        generation_config = genai.GenerationConfig(
            temperature=temperature,
            max_output_tokens=max_tokens
        )

        try:
            response = self.model.generate_content(
                prompt,
                generation_config=generation_config
            )

            execution_time = int((datetime.utcnow() - start_time).total_seconds() * 1000)

            # Safe access to usage metadata with comprehensive error handling
            usage_metadata = None
            try:
                if hasattr(response, 'usage_metadata'):
                    usage_metadata = response.usage_metadata
            except Exception as e:
                print(f"⚠️ Usage metadata access error: {e}")
                usage_metadata = None

            # Build token usage safely
            token_usage = {"prompt_tokens": 0, "completion_tokens": 0, "total_tokens": 0}
            if usage_metadata:
                try:
                    token_usage = {
                        "prompt_tokens": getattr(usage_metadata, 'prompt_token_count', 0),
                        "completion_tokens": getattr(usage_metadata, 'candidates_token_count', 0),
                        "total_tokens": getattr(usage_metadata, 'total_token_count', 0)
                    }
                except Exception as e:
                    print(f"⚠️ Token usage parsing error: {e}")

            return {
                "text": response.text,
                "model": self.model_name,
                "execution_time_ms": execution_time,
                "token_usage": token_usage
            }
        except Exception as e:
            execution_time = int((datetime.utcnow() - start_time).total_seconds() * 1000)
            raise Exception(f"Gemini API error: {str(e)}") from e

    def get_capabilities(self) -> list[ModelCapability]:
        """Gemini 2.5 Flash is fast + good at structured output"""
        return [
            ModelCapability.FAST_REASONING,
            ModelCapability.STRUCTURED_OUTPUT,
            ModelCapability.LONG_CONTEXT
        ]

    def get_cost_per_1k_tokens(self) -> Dict[str, float]:
        """Gemini 2.5 Flash pricing"""
        return {
            "input": 0.00015,   # $0.15 per 1M tokens
            "output": 0.0006    # $0.60 per 1M tokens
        }