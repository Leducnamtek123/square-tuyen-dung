import logging
from dataclasses import dataclass
from typing import Any, Dict, Iterable, List, Optional, Tuple

import httpx
import requests
from django.conf import settings

logger = logging.getLogger(__name__)


@dataclass(frozen=True)
class AIEndpointCandidate:
    name: str
    base_url: str
    api_key: str = ""
    model: str = ""

    @property
    def normalized_base_url(self) -> str:
        return self.base_url.rstrip("/")

    def headers(self) -> Dict[str, str]:
        if not self.api_key:
            return {}
        return {"Authorization": f"Bearer {self.api_key}"}

    def payload(self, payload: Dict[str, Any]) -> Dict[str, Any]:
        if not self.model:
            return payload
        next_payload = dict(payload)
        next_payload["model"] = self.model
        return next_payload


class AIServiceUnavailable(Exception):
    def __init__(self, service: str, attempts: Iterable[str]):
        self.service = service
        self.attempts = list(attempts)
        super().__init__(f"{service} service unavailable after fallback attempts: {'; '.join(self.attempts)}")


def _setting(name: str, default: str = "") -> str:
    value = getattr(settings, name, default)
    if value is None:
        return ""
    return str(value).strip()

def _setting_bool(name: str, default: bool = False) -> bool:
    value = getattr(settings, name, default)
    if isinstance(value, bool):
        return value
    return str(value).strip().lower() in {"1", "true", "yes", "on", "y", "t"}


def _setting_float(name: str, default: float) -> float:
    value = getattr(settings, name, default)
    try:
        return float(value)
    except (TypeError, ValueError):
        return default


def _setting_int(name: str, default: int) -> int:
    value = getattr(settings, name, default)
    try:
        return int(value)
    except (TypeError, ValueError):
        return default


def _split_csv(value: str) -> List[str]:
    if not value or not str(value).strip():
        return []
    return [item.strip() for item in str(value).split(",")]


def apply_llm_request_defaults(payload: Dict[str, Any]) -> Dict[str, Any]:
    next_payload = dict(payload)

    if "temperature" not in next_payload:
        next_payload["temperature"] = _setting_float("AI_LLM_TEMPERATURE", 0.7)
    if "top_p" not in next_payload:
        next_payload["top_p"] = _setting_float("AI_LLM_TOP_P", 0.8)
    if "max_tokens" not in next_payload and "max_completion_tokens" not in next_payload:
        max_tokens = _setting_int("AI_LLM_MAX_TOKENS", 2048)
        if max_tokens > 0:
            next_payload["max_tokens"] = max_tokens

    if _setting_bool("AI_LLM_USE_VLLM_PARAMS", False):
        next_payload.setdefault("top_k", _setting_int("AI_LLM_TOP_K", 20))
        next_payload.setdefault("min_p", _setting_float("AI_LLM_MIN_P", 0.0))
        next_payload.setdefault(
            "presence_penalty",
            _setting_float("AI_LLM_PRESENCE_PENALTY", 1.5),
        )
        next_payload.setdefault(
            "repetition_penalty",
            _setting_float("AI_LLM_REPETITION_PENALTY", 1.0),
        )
        next_payload.setdefault(
            "chat_template_kwargs",
            {"enable_thinking": _setting_bool("AI_LLM_ENABLE_THINKING", False)},
        )

    return next_payload


def _add_candidate(
    candidates: List[AIEndpointCandidate],
    seen: set[tuple[str, str, str]],
    candidate: AIEndpointCandidate,
    *,
    default_model: str = "",
) -> None:
    base_url = candidate.normalized_base_url
    effective_model = candidate.model or default_model
    dedupe_key = (base_url, candidate.api_key, effective_model)
    if not base_url or dedupe_key in seen:
        return
    candidates.append(
        AIEndpointCandidate(
            name=candidate.name,
            base_url=base_url,
            api_key=candidate.api_key,
            model=candidate.model,
        )
    )
    seen.add(dedupe_key)


def get_llm_candidates(default_model: str = "") -> List[AIEndpointCandidate]:
    candidates: List[AIEndpointCandidate] = []
    seen: set[tuple[str, str, str]] = set()

    # settings.AI_LLM_API_KEY already applies the legacy LLM_API_KEY/GROQ_API_KEY
    # fallback when AI_LLM_API_KEY is not configured. Reading only the resolved
    # setting here lets deployments intentionally leave the text LLM key empty
    # for local OpenAI-compatible servers such as Ollama.
    primary_api_key = _setting("AI_LLM_API_KEY")
    _add_candidate(
        candidates,
        seen,
        AIEndpointCandidate(
            name="primary",
            base_url=_setting("AI_LLM_BASE_URL", _setting("LLM_BASE_URL", _setting("OLLAMA_BASE_URL", ""))),
            api_key=primary_api_key,
            model="",
        ),
        default_model=default_model,
    )

    local_base_url = _setting("AI_LLM_LOCAL_BASE_URL")
    if local_base_url:
        _add_candidate(
            candidates,
            seen,
            AIEndpointCandidate(
                name="local",
                base_url=local_base_url,
                api_key=_setting("AI_LLM_LOCAL_API_KEY"),
                model=_setting("AI_LLM_LOCAL_MODEL", default_model),
            ),
            default_model=default_model,
        )

    fallback_urls = _split_csv(_setting("AI_LLM_FALLBACK_BASE_URLS"))
    fallback_api_keys = _split_csv(_setting("AI_LLM_FALLBACK_API_KEYS"))
    fallback_models = _split_csv(_setting("AI_LLM_FALLBACK_MODELS"))
    for index, base_url in enumerate(fallback_urls):
        _add_candidate(
            candidates,
            seen,
            AIEndpointCandidate(
                name=f"fallback-{index + 1}",
                base_url=base_url,
                api_key=fallback_api_keys[index] if index < len(fallback_api_keys) else "",
                model=fallback_models[index] if index < len(fallback_models) else default_model,
            ),
            default_model=default_model,
        )

    return candidates


def get_service_base_urls(service: str) -> List[str]:
    service = service.lower()
    if service == "stt":
        primary = _setting("AI_STT_BASE_URL", _setting("STT_BASE_URL", ""))
        fallbacks = _split_csv(_setting("AI_STT_FALLBACK_BASE_URLS"))
    elif service == "tts":
        primary = _setting("AI_TTS_BASE_URL", _setting("TTS_BASE_URL", ""))
        fallbacks = _split_csv(_setting("AI_TTS_FALLBACK_BASE_URLS"))
    else:
        raise ValueError(f"Unsupported AI service: {service}")

    urls: List[str] = []
    seen: set[str] = set()
    for url in [primary, *fallbacks]:
        normalized = (url or "").rstrip("/")
        if normalized and normalized not in seen:
            urls.append(normalized)
            seen.add(normalized)
    return urls


def _response_error(label: str, response: Any) -> str:
    text = ""
    try:
        text = response.text[:300]
    except Exception:
        text = ""
    return f"{label}: HTTP {response.status_code} {text}".strip()


def post_chat_completion_requests(
    payload: Dict[str, Any],
    *,
    default_model: str = "",
    timeout: Tuple[float, float] = (10, 120),
) -> Tuple[Dict[str, Any], AIEndpointCandidate]:
    attempts: List[str] = []
    last_transient: Optional[requests.RequestException] = None

    for candidate in get_llm_candidates(default_model=default_model):
        url = f"{candidate.normalized_base_url}/chat/completions"
        try:
            response = requests.post(
                url,
                json=candidate.payload(apply_llm_request_defaults(payload)),
                headers=candidate.headers(),
                timeout=timeout,
            )
        except (requests.ConnectionError, requests.Timeout) as exc:
            last_transient = exc
            attempts.append(f"{candidate.name}: {exc}")
            logger.warning("LLM candidate %s unavailable: %s", candidate.name, exc)
            continue
        except requests.RequestException as exc:
            attempts.append(f"{candidate.name}: {exc}")
            logger.warning("LLM candidate %s request failed: %s", candidate.name, exc)
            continue

        if response.status_code < 400:
            try:
                return response.json(), candidate
            except ValueError as exc:
                attempts.append(f"{candidate.name}: invalid JSON response")
                logger.warning("LLM candidate %s returned invalid JSON: %s", candidate.name, exc)
                continue
        attempts.append(_response_error(candidate.name, response))
        logger.warning("LLM candidate %s returned HTTP %s", candidate.name, response.status_code)

    if last_transient and attempts and all("HTTP" not in attempt for attempt in attempts):
        raise last_transient
    raise AIServiceUnavailable("llm", attempts)


def post_chat_completion_httpx(
    payload: Dict[str, Any],
    *,
    default_model: str = "",
    timeout_seconds: float = 120.0,
    connect_timeout_seconds: float = 15.0,
) -> Tuple[Dict[str, Any], AIEndpointCandidate]:
    attempts: List[str] = []
    last_transient: Optional[Exception] = None
    timeout = httpx.Timeout(timeout=timeout_seconds, connect=connect_timeout_seconds)

    with httpx.Client(timeout=timeout) as client:
        for candidate in get_llm_candidates(default_model=default_model):
            url = f"{candidate.normalized_base_url}/chat/completions"
            try:
                response = client.post(
                    url,
                    json=candidate.payload(apply_llm_request_defaults(payload)),
                    headers=candidate.headers(),
                )
            except (httpx.TimeoutException, httpx.ConnectError) as exc:
                last_transient = exc
                attempts.append(f"{candidate.name}: {exc}")
                logger.warning("LLM candidate %s unavailable: %s", candidate.name, exc)
                continue
            except httpx.HTTPError as exc:
                attempts.append(f"{candidate.name}: {exc}")
                logger.warning("LLM candidate %s request failed: %s", candidate.name, exc)
                continue

            if response.status_code < 400:
                try:
                    return response.json(), candidate
                except ValueError as exc:
                    attempts.append(f"{candidate.name}: invalid JSON response")
                    logger.warning("LLM candidate %s returned invalid JSON: %s", candidate.name, exc)
                    continue
            attempts.append(_response_error(candidate.name, response))
            logger.warning("LLM candidate %s returned HTTP %s", candidate.name, response.status_code)

    if last_transient and attempts and all("HTTP" not in attempt for attempt in attempts):
        raise last_transient
    raise AIServiceUnavailable("llm", attempts)


def post_ollama_native_chat_httpx(
    candidate: AIEndpointCandidate,
    payload: Dict[str, Any],
    *,
    timeout_seconds: float,
    connect_timeout_seconds: float,
) -> Optional[Dict[str, Any]]:
    native_base = candidate.normalized_base_url
    if native_base.endswith("/v1"):
        native_base = native_base[:-3]

    try:
        with httpx.Client(timeout=httpx.Timeout(timeout=timeout_seconds, connect=connect_timeout_seconds)) as client:
            response = client.post(
                f"{native_base}/api/chat",
                json=payload,
                headers=candidate.headers(),
            )
    except httpx.HTTPError as exc:
        logger.info("Ollama native fallback for %s skipped: %s", candidate.name, exc)
        return None

    if response.status_code != 200:
        logger.info("Ollama native fallback for %s returned HTTP %s", candidate.name, response.status_code)
        return None
    return response.json()
