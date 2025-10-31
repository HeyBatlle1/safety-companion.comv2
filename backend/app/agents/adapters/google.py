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

        response = self.model.generate_content(
            prompt,
            generation_config=generation_config
        )

        execution_time = int((datetime.utcnow() - start_time).total_seconds() * 1000)

        return {
            "text": response.text,
            "model": self.model_name,
            "execution_time_ms": execution_time,
            "token_usage": {
                "prompt_tokens": getattr(response, 'usage_metadata', {}).get('prompt_token_count', 0) if hasattr(response, 'usage_metadata') else 0,
                "completion_tokens": getattr(response, 'usage_metadata', {}).get('candidates_token_count', 0) if hasattr(response, 'usage_metadata') else 0,
                "total_tokens": getattr(response, 'usage_metadata', {}).get('total_token_count', 0) if hasattr(response, 'usage_metadata') else 0
            }
        }

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