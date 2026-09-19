import json
import logging
from typing import Any, Dict, List, Optional
from openai import OpenAI
from app.core.config import settings

logger = logging.getLogger("noterecall.llm")


class LLMClient:
    """Wrapper around OpenAI-compatible API (NVIDIA, Gemini, OpenAI, etc.)."""

    def __init__(self):
        self.base_url = settings.LLM_BASE_URL
        self.api_key = settings.LLM_API_KEY
        self.model = settings.LLM_MODEL
        self.temperature = settings.LLM_TEMPERATURE
        self.max_tokens = settings.LLM_MAX_TOKENS

    def _get_client(self) -> OpenAI:
        if not self.api_key or "your_nvidia_api_key_here" in self.api_key or len(self.api_key.strip()) < 8:
            raise ValueError("NVIDIA LLM API key not configured in .env")
        return OpenAI(
            base_url=self.base_url,
            api_key=self.api_key,
            timeout=15.0,
            max_retries=1,
        )

    def generate_text(
        self,
        messages: List[Dict[str, str]],
        temperature: Optional[float] = None,
        max_tokens: Optional[int] = None,
    ) -> str:
        """Standard chat completion call."""
        try:
            client = self._get_client()
            response = client.chat.completions.create(
                model=self.model,
                messages=messages,
                temperature=temperature if temperature is not None else self.temperature,
                max_tokens=max_tokens if max_tokens is not None else self.max_tokens,
                stream=False,
            )
            content = response.choices[0].message.content
            return content.strip() if content else ""
        except Exception as e:
            logger.error(f"Error during LLM text generation: {e}")
            raise e

    def generate_json(
        self,
        messages: List[Dict[str, str]],
        temperature: Optional[float] = None,
    ) -> Any:
        """Generates structured JSON output from the model."""
        raw_text = self.generate_text(messages, temperature=temperature or 0.1)

        cleaned_text = raw_text.strip()
        
        # 1. Try all markdown code blocks for valid JSON
        import re
        for block in re.findall(r"```(?:json)?\s*([\s\S]*?)\s*```", raw_text):
            try:
                return json.loads(block.strip())
            except Exception:
                continue

        # 2. Try extracting JSON objects {...} or arrays [...]
        for match in re.finditer(r"(\{[\s\S]*\}|\[[\s\S]*\])", raw_text):
            try:
                return json.loads(match.group(0).strip())
            except Exception:
                continue

        try:
            return json.loads(cleaned_text)
        except json.JSONDecodeError as e:
            logger.error(f"Failed to parse JSON response from LLM. Raw output:\n{raw_text}")
            raise ValueError(f"LLM returned invalid JSON: {e}")


# Singleton instance
llm_client = LLMClient()
