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


def _split_csv(value: str) -> List[str]:
    if not value or not str(value).strip():
        return []
    return [item.strip() for item in str(value).split(",")]


def _add_candidate(candidates: List[AIEndpointCandidate], seen: set[str], candidate: AIEndpointCandidate) -> None:
    base_url = candidate.normalized_base_url
    if not base_url or base_url in seen:
        return
    candidates.append(
        AIEndpointCandidate(
            name=candidate.name,
            base_url=base_url,
            api_key=candidate.api_key,
            model=candidate.model,
        )
    )
    seen.add(base_url)


def get_llm_candidates(default_model: str = "") -> List[AIEndpointCandidate]:
    candidates: List[AIEndpointCandidate] = []
    seen: set[str] = set()

    primary_api_key = (
        _setting("AI_LLM_API_KEY")
        or _setting("LLM_API_KEY")
        or _setting("GROQ_API_KEY")
    )
    _add_candidate(
        candidates,
        seen,
        AIEndpointCandidate(
            name="primary",
            base_url=_setting("AI_LLM_BASE_URL", _setting("LLM_BASE_URL", _setting("OLLAMA_BASE_URL", ""))),
            api_key=primary_api_key,
            model="",
        ),
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
                json=candidate.payload(payload),
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
                    json=candidate.payload(payload),
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
