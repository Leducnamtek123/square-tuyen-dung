from __future__ import annotations

from functools import lru_cache
from datetime import date
from typing import Any
from urllib.parse import urlparse
import json
import logging
import uuid


VIECLAM24H_ORIGIN = "https://ntd.vieclam24h.vn"
VIECLAM24H_API_ORIGIN = "https://apiv2.vieclam24h.vn"
VIECLAM24H_LOGIN_PATH = "/account/login"
VIECLAM24H_SEARCH_PATH = "/tim-kiem-ung-vien-nhanh"
VIECLAM24H_SEARCH_API_PATH = "/seeker/fe/api/v1/search/ai-resume"
VIECLAM24H_RESUME_API_PATH = "/seeker/fe/resume/{resume_id}"

logger = logging.getLogger(__name__)


def _resolve_origin(source_url: str | None) -> str:
    parsed = urlparse(source_url or "")
    if parsed.scheme and parsed.netloc:
        return f"{parsed.scheme}://{parsed.netloc}"
    return VIECLAM24H_ORIGIN


def _login_url(origin: str) -> str:
    return f"{origin}{VIECLAM24H_LOGIN_PATH}"


def _search_url(origin: str) -> str:
    return f"{origin}{VIECLAM24H_SEARCH_PATH}"


def _search_api_url(origin: str) -> str:
    return f"{_api_origin(origin)}{VIECLAM24H_SEARCH_API_PATH}"


def _resume_api_url(origin: str, resume_id: int | str) -> str:
    return f"{_api_origin(origin)}{VIECLAM24H_RESUME_API_PATH.format(resume_id=resume_id)}"



def _api_origin(origin: str) -> str:
    parsed = urlparse(origin or "")
    if not parsed.scheme or not parsed.netloc:
        return VIECLAM24H_API_ORIGIN

    if parsed.netloc.startswith("ntd."):
        return f"{parsed.scheme}://apiv2.{parsed.netloc.removeprefix('ntd.')}"

    if parsed.netloc == urlparse(VIECLAM24H_ORIGIN).netloc:
        return VIECLAM24H_API_ORIGIN

    return f"{parsed.scheme}://{parsed.netloc}"

def _default_search_params(page: int = 1, per_page: int = 20) -> dict[str, str]:
    params = {
        "order_by[relevance]": "DESC",
        "per_page": str(per_page),
        "includes": "is_seen",
        "action": "search",
    }
    if page > 1:
        params["page"] = str(page)
    return params


def _build_search_url(origin: str, page: int = 1, per_page: int = 20, occupation_ids: list[int] | None = None) -> str:
    from urllib.parse import urlencode

    params = _default_search_params(page=page, per_page=per_page)
    query_parts = list(params.items())
    for occupation_id in occupation_ids or []:
        query_parts.append(("occupation_ids[]", str(occupation_id)))
    return f"{_search_api_url(origin)}?{urlencode(query_parts, doseq=True)}"


def _normalize_int(value: Any) -> int | None:
    try:
        return int(value)
    except (TypeError, ValueError):
        return None


def _normalize_catalog_items(items: list[dict[str, Any]], top_ids: set[int]) -> list[dict[str, Any]]:
    normalized: list[dict[str, Any]] = []
    for item in items or []:
        item_id = _normalize_int(item.get("id") or item.get("value"))
        if item_id is None:
            continue
        normalized.append(
            {
                "id": item_id,
                "name": item.get("name") or "",
                "slug": item.get("slug"),
                "jobFieldIds": item.get("job_field_ids") or [],
                "isTop": item_id in top_ids,
            }
        )
    return normalized


def _normalize_provinces(items: list[dict[str, Any]]) -> list[dict[str, Any]]:
    normalized: list[dict[str, Any]] = []
    for item in items or []:
        item_id = _normalize_int(item.get("id") or item.get("value"))
        if item_id is None:
            continue
        normalized.append(
            {
                "id": item_id,
                "name": item.get("name") or "",
                "slug": item.get("slug"),
            }
        )
    return normalized


@lru_cache(maxsize=4)
def get_vieclam24h_catalog(source_url: str | None = None) -> dict[str, Any]:
    origin = _resolve_origin(source_url)

    try:
        from playwright.sync_api import sync_playwright
    except ImportError as exc:  # pragma: no cover - import guard
        raise RuntimeError(
            "Playwright is not installed in the current backend environment. "
            "Install the backend dependencies and rebuild the image."
        ) from exc

    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page(viewport={"width": 1440, "height": 1600})
        try:
            page.goto(f"{origin}{VIECLAM24H_SEARCH_PATH}", wait_until="domcontentloaded", timeout=60000)
            page.wait_for_timeout(1500)
            raw_catalog = page.evaluate(
                """() => {
                    const init = window.__NEXT_DATA__?.props?.initialState?.api?.initCommon?.data || {};
                    return {
                        occupations: init.occupation || [],
                        topOccupations: init.top_occupation || [],
                        topOccupationCounts: init.top_occupation_count || [],
                        provinces: init.provinces || [],
                        provincesAll: init.provinces_all || [],
                    };
                }"""
            )
        finally:
            browser.close()

    top_ids = {
        _normalize_int(item.get("occupation_id") or item.get("id") or item.get("value"))
        for item in (raw_catalog.get("topOccupationCounts") or [])
        if _normalize_int(item.get("occupation_id") or item.get("id") or item.get("value")) is not None
    }
    top_ids.discard(None)  # type: ignore[arg-type]

    occupations = _normalize_catalog_items(raw_catalog.get("occupations") or [], {item for item in top_ids if item is not None})
    top_occupations = _normalize_catalog_items(raw_catalog.get("topOccupations") or [], {item for item in top_ids if item is not None})

    if not top_occupations and occupations:
        top_occupations = occupations[:10]

    if not top_ids:
        top_ids = {item["id"] for item in top_occupations[:6]}

    return {
        "origin": origin,
        "occupations": occupations,
        "topOccupations": top_occupations,
        "provinces": _normalize_provinces(raw_catalog.get("provinces") or []),
        "provincesAll": _normalize_provinces(raw_catalog.get("provincesAll") or []),
        "recommendedOccupationIds": sorted(top_ids)[:8],
    }


def _catalog_lookup(catalog: dict[str, Any]) -> tuple[dict[int, dict[str, Any]], dict[int, dict[str, Any]]]:
    occupation_lookup = {item["id"]: item for item in catalog.get("occupations") or []}
    province_lookup = {item["id"]: item for item in catalog.get("provinces") or []}
    return occupation_lookup, province_lookup


def _merge_text(parts: list[Any]) -> str:
    values = []
    for part in parts:
        if isinstance(part, str):
            stripped = part.strip()
            if stripped:
                values.append(stripped)
        elif isinstance(part, list):
            nested = _merge_text(part)
            if nested:
                values.append(nested)
    return " | ".join(values)


def _normalize_resume_options(options: dict[str, Any] | None) -> dict[str, Any]:
    if not isinstance(options, dict):
        return {}

    def _normalize_rows(rows: Any, field_map: dict[str, str]) -> list[dict[str, Any]]:
        normalized: list[dict[str, Any]] = []
        if not isinstance(rows, list):
            return normalized
        for row in rows:
            if not isinstance(row, dict):
                continue
            normalized.append({target: row.get(source) for source, target in field_map.items()})
        return normalized

    return {
        "education": _normalize_rows(
            options.get("diploma"),
            {
                "school_name": "schoolName",
                "specialized": "specialized",
                "degree_type_code": "degreeTypeCode",
                "start_date": "startDate",
                "end_date": "endDate",
            },
        ),
        "experience": _normalize_rows(
            options.get("experience"),
            {
                "company_name": "companyName",
                "position": "position",
                "start_date": "startDate",
                "end_date": "endDate",
                "is_current_work": "isCurrentWork",
                "description": "description",
            },
        ),
        "language": _normalize_rows(
            options.get("language"),
            {
                "language": "language",
                "level": "level",
            },
        ),
        "certificate": _normalize_rows(
            options.get("certificate"),
            {
                "name": "name",
                "training_place": "trainingPlace",
                "start_date": "startDate",
                "expiration_date": "expirationDate",
            },
        ),
    }


def _normalize_candidate_detail(detail: dict[str, Any]) -> dict[str, Any]:
    resume_options = _normalize_resume_options(detail.get("resume_options"))
    skills = detail.get("skills_new") or []
    experience_summary = _merge_text(
        [
            detail.get("career_objective"),
            detail.get("introduce"),
            [row.get("position") for row in resume_options.get("experience", []) if row.get("position")],
            [row.get("companyName") for row in resume_options.get("experience", []) if row.get("companyName")],
        ]
    )
    education_summary = _merge_text(
        [
            [row.get("specialized") for row in resume_options.get("education", []) if row.get("specialized")],
            [row.get("schoolName") for row in resume_options.get("education", []) if row.get("schoolName")],
        ]
    )
    description = _merge_text(
        [
            detail.get("career_objective"),
            detail.get("introduce"),
            experience_summary,
            education_summary,
            skills,
        ]
    )
    skills_summary = ", ".join([str(skill).strip() for skill in skills if str(skill).strip()])

    return {
        "title": (detail.get("title") or "").strip(),
        "description": description,
        "skills_summary": skills_summary,
        "detail_payload": {
            "id": detail.get("id"),
            "slug": detail.get("slug"),
            "resume_type": detail.get("resume_type"),
            "level": detail.get("level"),
            "position": detail.get("position"),
            "current_position": detail.get("current_position"),
            "occupation_ids": detail.get("occupation_ids") or [],
            "field_ids": detail.get("field_ids") or [],
            "province_ids": detail.get("province_ids") or [],
            "working_method": detail.get("working_method") or [],
            "experience": detail.get("experience"),
            "salary_range": detail.get("salary_range"),
            "min_expected_salary": detail.get("min_expected_salary"),
            "max_expected_salary": detail.get("max_expected_salary"),
            "skills_new": skills,
            "resume_options": resume_options,
            "career_objective": detail.get("career_objective"),
            "introduce": detail.get("introduce"),
            "refreshed_at": detail.get("refreshed_at"),
            "completed_at": detail.get("completed_at"),
            "created_at": detail.get("created_at"),
            "updated_at": detail.get("updated_at"),
            "has_resume_meta": detail.get("has_resume_meta"),
        },
    }


def _normalize_search_item(item: dict[str, Any], catalog: dict[str, Any]) -> dict[str, Any] | None:
    if not isinstance(item, dict):
        return None

    seeker_info = item.get("seeker_info") if isinstance(item.get("seeker_info"), dict) else {}
    occupation_lookup, province_lookup = _catalog_lookup(catalog)
    occupation_ids = [_normalize_int(value) for value in item.get("occupation_ids") or []]
    occupation_ids = [value for value in occupation_ids if value is not None]
    province_ids = [_normalize_int(value) for value in item.get("province_ids") or []]
    province_ids = [value for value in province_ids if value is not None]

    occupation_names = [occupation_lookup[value]["name"] for value in occupation_ids if value in occupation_lookup]
    province_names = [province_lookup[value]["name"] for value in province_ids if value in province_lookup]

    full_name = (seeker_info.get("name") or item.get("title") or "").strip()
    if not full_name:
        return None

    return {
        "resume_id": item.get("id"),
        "seeker_id": item.get("seeker_id"),
        "full_name": full_name,
        "title": (item.get("title") or full_name).strip(),
        "email": "",
        "phone": "",
        "career_name": ", ".join(occupation_names),
        "source_occupation_ids": occupation_ids,
        "source_occupation_names": occupation_names,
        "city_name": province_names[0] if province_names else "",
        "province_names": province_names,
        "source_ref": str(item.get("id") or item.get("seeker_id") or full_name).strip(),
        "source_url": "",
        "search_payload": {
            "id": item.get("id"),
            "seeker_id": item.get("seeker_id"),
            "title": item.get("title"),
            "slug": item.get("slug"),
            "resume_type": item.get("resume_type"),
            "level": item.get("level"),
            "position": item.get("position"),
            "current_position": item.get("current_position"),
            "field_ids": item.get("field_ids") or [],
            "occupation_ids": occupation_ids,
            "province_ids": province_ids,
            "work_time": item.get("work_time"),
            "experience": item.get("experience"),
            "current_salary": item.get("current_salary"),
            "salary_range": item.get("salary_range"),
            "min_expected_salary": item.get("min_expected_salary"),
            "max_expected_salary": item.get("max_expected_salary"),
            "language": item.get("language"),
            "total_views": item.get("total_views"),
            "is_search_allowed": item.get("is_search_allowed"),
            "status": item.get("status"),
            "refreshed_at": item.get("refreshed_at"),
            "completed_at": item.get("completed_at"),
            "created_at": item.get("created_at"),
            "updated_at": item.get("updated_at"),
            "point": item.get("point"),
            "is_seen": item.get("is_seen"),
            "seeker_info": seeker_info,
        },
        "source_payload": {
            "search": {
                "id": item.get("id"),
                "seeker_id": item.get("seeker_id"),
                "title": item.get("title"),
                "slug": item.get("slug"),
                "resume_type": item.get("resume_type"),
                "level": item.get("level"),
                "position": item.get("position"),
                "current_position": item.get("current_position"),
                "field_ids": item.get("field_ids") or [],
                "occupation_ids": occupation_ids,
                "province_ids": province_ids,
                "work_time": item.get("work_time"),
                "experience": item.get("experience"),
                "current_salary": item.get("current_salary"),
                "salary_range": item.get("salary_range"),
                "min_expected_salary": item.get("min_expected_salary"),
                "max_expected_salary": item.get("max_expected_salary"),
                "language": item.get("language"),
                "total_views": item.get("total_views"),
                "is_search_allowed": item.get("is_search_allowed"),
                "status": item.get("status"),
                "refreshed_at": item.get("refreshed_at"),
                "completed_at": item.get("completed_at"),
                "created_at": item.get("created_at"),
                "updated_at": item.get("updated_at"),
                "point": item.get("point"),
                "is_seen": item.get("is_seen"),
                "seeker_info": seeker_info,
            },
            "catalog": {
                "occupationNames": occupation_names,
                "provinceNames": province_names,
            },
        },
    }


def _build_browser_headers(auth_token: str | None, origin: str) -> dict[str, str]:
    headers = {
        "Accept": "application/json",
        "Content-Type": "application/json",
        "X-Lang": "vi",
        "X-Branch": "vl24h.south",
        "X-Request-Id": str(uuid.uuid4()),
        "X-Correlation-Id": str(uuid.uuid4()),
        "Referer": f"{origin}/",
    }
    if auth_token:
        headers["Authorization"] = auth_token
    return headers


def _evaluate_response(
    page,
    url: str,
    auth_token: str | None,
    origin: str,
    *,
    method: str = "GET",
    body: dict[str, Any] | None = None,
) -> dict[str, Any]:
    headers = _build_browser_headers(auth_token, origin)
    if body is not None:
        headers["Content-Type"] = "application/json"
    result = page.evaluate(
        """async ({url, headers, method, body}) => {
            const response = await fetch(url, {
                credentials: 'include',
                method,
                headers,
                body: body ? JSON.stringify(body) : undefined,
            });
            const contentType = (response.headers.get('content-type') || '').toLowerCase();
            const responseText = await response.text();
            return {
                status: response.status,
                url: response.url,
                contentType,
                body: responseText,
            };
        }""",
        {"url": url, "headers": headers, "method": method, "body": body},
    )
    if not isinstance(result, dict):
        raise RuntimeError("Vieclam24h returned an unexpected response shape.")
    return result


def _evaluate_json(
    page,
    url: str,
    auth_token: str | None,
    origin: str,
    *,
    method: str = "GET",
    body: dict[str, Any] | None = None,
    allow_empty_body: bool = False,
) -> dict[str, Any]:
    result = _evaluate_response(
        page,
        url,
        auth_token,
        origin,
        method=method,
        body=body,
    )
    body_text = (result.get("body") or "").strip()
    if not body_text:
        if allow_empty_body:
            return {}
        raise RuntimeError("Vieclam24h returned an empty response.")

    content_type = (result.get("contentType") or "").lower()
    if "application/json" not in content_type:
        snippet = body_text[:240].replace("\n", " ")
        logger.warning(
            "Vieclam24h non-JSON response status=%s url=%s content_type=%s body=%s",
            result.get("status"),
            result.get("url"),
            result.get("contentType"),
            snippet,
        )
        raise RuntimeError("Vieclam24h returned a non-JSON response.")
    try:
        parsed = json.loads(body_text)
    except Exception as exc:
        raise RuntimeError("Vieclam24h returned invalid JSON.") from exc
    if not isinstance(parsed, dict):
        raise RuntimeError("Vieclam24h returned an unexpected response shape.")
    return parsed


def _collect_search_items(page, auth_token: str | None, origin: str, occupation_ids: list[int], page_number: int, per_page: int) -> list[dict[str, Any]]:
    url = _build_search_url(origin, page=page_number, per_page=per_page, occupation_ids=occupation_ids)
    payload = _evaluate_json(page, url, auth_token, origin)
    if payload.get("code") != 200:
        message = payload.get("msg") or "Vieclam24h search failed."
        raise RuntimeError(str(message))
    data = payload.get("data") or {}
    items = data.get("items") if isinstance(data, dict) else []
    if not isinstance(items, list):
        return []
    return items


def _collect_resume_detail(page, auth_token: str | None, origin: str, resume_id: int | str) -> dict[str, Any]:
    url = f"{_resume_api_url(origin, resume_id)}?id={resume_id}&options=1"
    payload = _evaluate_json(page, url, auth_token, origin)
    if payload.get("code") != 200:
        message = payload.get("msg") or "Vieclam24h resume detail failed."
        raise RuntimeError(str(message))
    data = payload.get("data") or {}
    return data if isinstance(data, dict) else {}

def _collect_contact_detail(page, auth_token: str | None, origin: str, seeker_id: int | str, view_token: str) -> dict[str, Any]:
    url = f"{_api_origin(origin)}/seeker/fe/employer/seeker-contact/{seeker_id}"
    payload = _evaluate_json(
        page,
        url,
        auth_token,
        origin,
        method="POST",
        body={"id": seeker_id, "check_view_seeker_token": view_token},
    )
    if payload.get("code") != 200:
        message = payload.get("msg") or "Vieclam24h contact detail failed."
        raise RuntimeError(str(message))
    data = payload.get("data") or {}
    return data if isinstance(data, dict) else {}

def _collect_employer_seen_resume(page, auth_token: str | None, origin: str, resume_id: int | str) -> dict[str, Any]:
    url = f"{_api_origin(origin)}/mix/fe/employer/employer-seen-resume/{resume_id}"
    payload = _evaluate_json(
        page,
        url,
        auth_token,
        origin,
        method="POST",
        body={"id": str(resume_id)},
    )
    if payload.get("code") != 200:
        message = payload.get("msg") or "Vieclam24h seen resume failed."
        raise RuntimeError(str(message))
    return payload

def _collect_check_view_seeker(page, auth_token: str | None, origin: str, resume_id: int | str) -> str:
    url = f"{_api_origin(origin)}/mix/fe/employer/check-view-seeker/{resume_id}"
    payload = _evaluate_json(
        page,
        url,
        auth_token,
        origin,
        method="POST",
        body={"id": str(resume_id)},
    )
    if payload.get("code") != 200:
        message = payload.get("msg") or "Vieclam24h check-view-seeker failed."
        raise RuntimeError(str(message))
    data = payload.get("data") or {}
    token = data.get("check_view_seeker_token") if isinstance(data, dict) else None
    if not isinstance(token, str) or not token.strip():
        raise RuntimeError("Vieclam24h did not return a view-seeker token.")
    return token.strip()

def _collect_resume_hidden(page, auth_token: str | None, origin: str, resume_id: int | str) -> dict[str, Any]:
    url = f"{_api_origin(origin)}/seeker/fe/resume-hidden/{resume_id}"
    result = _evaluate_response(page, url, auth_token, origin)
    status = result.get("status")
    if status not in (200, 204):
        raise RuntimeError("Vieclam24h resume-hidden failed.")

    body_text = (result.get("body") or "").strip()
    content_type = (result.get("contentType") or "").lower()
    if not body_text or "application/json" not in content_type:
        return {}

    try:
        payload = json.loads(body_text)
    except Exception:
        logger.warning("Vieclam24h resume-hidden returned unreadable json for resume_id=%s", resume_id, exc_info=True)
        return {}

    if not isinstance(payload, dict):
        return {}

    if payload.get("code") not in (200, 0):
        message = payload.get("msg") or "Vieclam24h resume-hidden failed."
        raise RuntimeError(str(message))
    return payload


def _normalize_detail_text(value: str) -> str:
    import unicodedata

    text = (value or "").replace("đ", "d").replace("Đ", "D")
    text = unicodedata.normalize("NFKD", text)
    text = "".join(ch for ch in text if not unicodedata.combining(ch))
    return " ".join(text.lower().split())


def _find_detail_line_index(lines: list[str], target: str) -> int:
    target_norm = _normalize_detail_text(target)
    if not target_norm:
        return -1
    for index, line in enumerate(lines):
        if target_norm in _normalize_detail_text(line):
            return index
    return -1


def _next_non_label_line(lines: list[str], start_index: int) -> str:
    stop_labels = {
        _normalize_detail_text(label)
        for label in [
            "Li?n h?",
            "L?u",
            "T?i CV ??nh k?m",
            "Th?ng tin c? nh?n",
            "Email",
            "Số điện thoại",
            "Tỉnh / Thành phố",
            "Ngày sinh & Giới tính",
            "Địa chỉ",
            "File ??nh k?m",
            "??nh gi? ?ng vi?n",
            "Chia s?/l?y ??nh gi?",
            "T? v?n",
        ]
    }
    for line in lines[start_index + 1:]:
        normalized = _normalize_detail_text(line)
        if normalized and normalized not in stop_labels:
            return line.strip()
    return ""


def _extract_detail_label_value(lines: list[str], label: str) -> str:
    label_index = _find_detail_line_index(lines, label)
    if label_index < 0:
        return ""
    return _next_non_label_line(lines, label_index)


def _parse_birth_and_gender(value: str) -> tuple[str, str]:
    cleaned = " ".join((value or "").replace("-", ",").split())
    parts = [part.strip() for part in cleaned.split(",") if part.strip()]
    if len(parts) >= 2:
        first, second = parts[0], parts[1]
        if first.isdigit() and len(first) == 4:
            return first, second
        if second.isdigit() and len(second) == 4:
            return second, first
        return first, second
    if len(parts) == 1:
        return parts[0], ""
    return "", ""

def _map_gender_value(value: object) -> str | None:
    if value in {"M", "F", "O"}:
        return str(value)
    if str(value) == "2":
        return "M"
    if str(value) == "3":
        return "F"
    if str(value) == "4":
        return "O"
    return None

def _clean_hidden_contact_value(value: object) -> str:
    if not isinstance(value, str):
        return ""
    text = " ".join(value.split()).strip()
    if not text:
        return ""
    normalized = _normalize_detail_text(text)
    if normalized in {"thong tin da an", "n/a", "na", "hidden"}:
        return ""
    if "thong tin" in normalized and "an" in normalized:
        return ""
    return text


def _extract_detail_html_label_value(html_source: str, label: str) -> str:
    import html
    import re

    if not html_source or not label:
        return ""

    normalized_source = html.unescape(html_source)
    label_pattern = re.escape(html.unescape(label))
    pattern = re.compile(
        rf"<div[^>]*>\s*{label_pattern}\s*</div>\s*<div[^>]*>(.*?)</div>",
        re.IGNORECASE | re.DOTALL,
    )
    match = pattern.search(normalized_source)
    if not match:
        return ""

    value_html = match.group(1)
    value = re.sub(r"<[^>]+>", " ", value_html)
    value = html.unescape(value)
    value = " ".join(value.split())
    if _normalize_detail_text(value) in {"thong tin da an", "n/a"} or value.strip() == "-":
        return ""
    return value

def _extract_detail_html_label_value_any(html_source: str, *labels: str) -> str:
    for label in labels:
        value = _extract_detail_html_label_value(html_source, label)
        if value:
            return value
    return ""

def _try_unlock_contact_information(page) -> bool:
    import re

    selectors = []
    try:
        selectors.append(page.get_by_role("button", name=re.compile("Mua thông tin liên hệ", re.IGNORECASE)))
    except Exception:
        pass
    try:
        selectors.append(page.get_by_text("Mua thông tin liên hệ", exact=False))
    except Exception:
        pass
    try:
        selectors.append(page.locator("button").filter(has_text="Mua thông tin liên hệ"))
    except Exception:
        pass
    try:
        selectors.append(page.locator("a").filter(has_text="Mua thông tin liên hệ"))
    except Exception:
        pass

    for locator in selectors:
        try:
            if locator.count() <= 0:
                continue
            locator.first.click(timeout=5000)
            page.wait_for_timeout(3000)
            return True
        except Exception:
            continue
    return False

def _collect_detail_page_snapshot(
    page,
    full_name: str,
    resume_id: int | str,
    source_url: str,
    seeker_id: int | str | None = None,
    auth_token: str | None = None,
) -> dict[str, Any]:
    detail_url = f"{_resolve_origin(source_url)}/chi-tiet-nguoi-tim-viec?id={resume_id}"
    page.goto(detail_url, wait_until="commit", timeout=60000)
    page.wait_for_timeout(5000)

    if seeker_id is None:
        raise RuntimeError("Vieclam24h detail page is missing seeker_id; cannot unlock contact information.")

    seeker_id_int = _normalize_int(seeker_id)
    if seeker_id_int is None:
        raise RuntimeError(f"Vieclam24h detail page returned an invalid seeker_id: {seeker_id!r}")

    _collect_employer_seen_resume(page, auth_token, source_url, resume_id)
    view_token = _collect_check_view_seeker(page, auth_token, source_url, resume_id)
    _collect_resume_hidden(page, auth_token, source_url, resume_id)
    contact_api = _collect_contact_detail(page, auth_token, source_url, seeker_id_int, view_token)

    email = _clean_hidden_contact_value(contact_api.get("email"))
    phone = _clean_hidden_contact_value(contact_api.get("mobile") or contact_api.get("phone"))
    birthday_value = contact_api.get("birthday")
    birthday = ""
    if birthday_value not in (None, ""):
        try:
            birthday = str(date.fromtimestamp(int(birthday_value)).year)
        except Exception:
            logger.warning("Vieclam24h contact api returned invalid birthday for seeker_id=%s", seeker_id, exc_info=True)
    gender = _map_gender_value(contact_api.get("gender")) or ""
    address = _clean_hidden_contact_value(contact_api.get("address"))
    city_name = _clean_hidden_contact_value(contact_api.get("province_name") or contact_api.get("city_name"))

    return {
        "detail_url": detail_url,
        "title": "",
        "email": email,
        "phone": phone,
        "city_name": city_name,
        "birthday": birthday,
        "gender": gender,
        "address": address,
        "province_id": contact_api.get("province_id"),
        "district_id": contact_api.get("district_id"),
        "cv_file_url": _clean_hidden_contact_value(
            contact_api.get("cv_file_url")
            or contact_api.get("file_url")
            or contact_api.get("fileUrl")
            or contact_api.get("resume_file_url")
        ),
        "avatar_url": _clean_hidden_contact_value(
            contact_api.get("avatar")
            or contact_api.get("avatar_url")
            or contact_api.get("avatarUrl")
        ),
    }


def _enrich_candidate_from_detail(candidate: dict[str, Any], detail_api: dict[str, Any], detail_page: dict[str, Any]) -> dict[str, Any]:
    enriched = dict(candidate)
    source_payload = dict(enriched.get("source_payload") or {})

    if detail_api:
        normalized_detail = _normalize_candidate_detail(detail_api)
        if normalized_detail.get("title"):
            enriched["title"] = normalized_detail["title"]
        if normalized_detail.get("description"):
            enriched["description"] = normalized_detail["description"]
        if normalized_detail.get("skills_summary"):
            enriched["skills_summary"] = normalized_detail["skills_summary"]
        source_payload["detail_api"] = detail_api
        source_payload["detail_api_normalized"] = normalized_detail

    if detail_page:
        if detail_page.get("title"):
            enriched["title"] = detail_page["title"]
        if detail_page.get("email"):
            enriched["email"] = detail_page["email"]
        if detail_page.get("phone"):
            enriched["phone"] = detail_page["phone"]
        if detail_page.get("city_name"):
            enriched["city_name"] = detail_page["city_name"]
        if detail_page.get("birthday"):
            enriched["birthday"] = detail_page["birthday"]
        if detail_page.get("gender"):
            enriched["gender"] = detail_page["gender"]
        if detail_page.get("address"):
            enriched["address"] = detail_page["address"]
        if detail_page.get("cv_file_url"):
            enriched["cv_file_url"] = detail_page["cv_file_url"]
        if detail_page.get("avatar_url"):
            enriched["avatar_url"] = detail_page["avatar_url"]
        if detail_page.get("province_id") is not None:
            enriched["province_id"] = detail_page["province_id"]
        if detail_page.get("district_id") is not None:
            enriched["district_id"] = detail_page["district_id"]
        source_payload["detail_page"] = {
            key: value
            for key, value in detail_page.items()
            if key != "body_text"
        }
        source_payload["detail_page"]["bodyText"] = (detail_page.get("body_text") or "")[:8000]

    enriched["source_payload"] = source_payload
    return enriched


def _capture_login_token(page, search_url: str) -> str:
    captured: dict[str, str] = {}

    def on_request(request):
        if "apiv2.vieclam24h.vn" not in request.url:
            return
        auth = request.headers.get("authorization") or request.headers.get("Authorization")
        if auth:
            captured["auth"] = auth

    page.on("request", on_request)
    page.goto(search_url, wait_until="domcontentloaded", timeout=60000)
    try:
        page.wait_for_load_state("networkidle", timeout=15000)
    except Exception:
        pass

    import time

    deadline = time.monotonic() + 20
    while time.monotonic() < deadline:
        token = captured.get("auth")
        if token:
            return token
        page.wait_for_timeout(500)

    token = captured.get("auth")
    if not token:
        raise RuntimeError("Không thể lấy token xác thực của Vieclam24h.")
    return token


def _extract_auth_token_from_browser_state(snapshot: Any) -> str | None:
    if not isinstance(snapshot, dict):
        return None

    preferred_keys = (
        "authorization",
        "access_token",
        "accessToken",
        "auth_token",
        "authToken",
        "token",
        "bearer",
        "id_token",
        "idToken",
    )
    token_key_hints = ("token", "auth", "bearer")

    def _clean(value: Any) -> str | None:
        if not isinstance(value, str):
            return None
        text = value.strip()
        return text or None

    def _from_mapping(mapping: dict[str, Any]) -> str | None:
        for key in preferred_keys:
            token = _clean(mapping.get(key))
            if token:
                return token

        for key, value in mapping.items():
            key_lower = str(key).lower()
            if any(hint in key_lower for hint in token_key_hints):
                token = _clean(value)
                if token:
                    return token

            if isinstance(value, (dict, list)):
                token = _extract_auth_token_from_browser_state(value)
                if token:
                    return token

        return None

    for key in ("localStorage", "sessionStorage"):
        value = snapshot.get(key)
        if isinstance(value, dict):
            token = _from_mapping(value)
            if token:
                return token

    cookies = snapshot.get("cookies")
    if isinstance(cookies, str):
        for chunk in cookies.split(";"):
            if "=" not in chunk:
                continue
            cookie_key, cookie_value = chunk.split("=", 1)
            if any(hint in cookie_key.strip().lower() for hint in token_key_hints):
                token = _clean(cookie_value)
                if token:
                    return token

    return _from_mapping(snapshot)


def _capture_auth_token_from_browser_state(page) -> str | None:
    try:
        snapshot = page.evaluate(
            """() => ({
                localStorage: Object.fromEntries(Object.entries(window.localStorage || {})),
                sessionStorage: Object.fromEntries(Object.entries(window.sessionStorage || {})),
                cookies: document.cookie || '',
            })"""
        )
    except Exception:
        return None

    return _extract_auth_token_from_browser_state(snapshot)


def _login_vieclam24h(page, username: str, password: str, search_url: str) -> str | None:
    page.goto(_login_url(_resolve_origin(search_url)), wait_until="domcontentloaded", timeout=60000)
    page.locator('input[name="email"]').fill(username)
    page.locator('input[name="password"]').fill(password)
    page.locator('button[type="submit"]').click()
    page.wait_for_timeout(2500)
    try:
        return _capture_login_token(page, search_url)
    except RuntimeError:
        token = _capture_auth_token_from_browser_state(page)
        if token:
            return token
        logger.warning("Vieclam24h auth token lookup failed; continuing with browser session cookies.")
        return None


def _normalize_selected_occupation_ids(occupation_ids: list[int] | None, catalog: dict[str, Any]) -> list[int]:
    normalized = []
    for value in occupation_ids or []:
        item_id = _normalize_int(value)
        if item_id is not None:
            normalized.append(item_id)
    return normalized


def _pick_text(value: Any, keys: list[str]) -> str:
    if not isinstance(value, dict):
        return ""
    for key in keys:
        raw = value.get(key)
        if isinstance(raw, str) and raw.strip():
            return raw.strip()
        if isinstance(raw, (int, float)) and not isinstance(raw, bool):
            return str(raw)
    return ""


def _extract_nested_object(value: Any) -> dict[str, Any]:
    if not isinstance(value, dict):
        return {}
    for key in ("user", "candidate", "profile", "resume", "data", "item", "row"):
        nested = value.get(key)
        if isinstance(nested, dict):
            return nested
    return value


def _normalize_candidate_like(value: Any, fallback_source_url: str, catalog: dict[str, Any]) -> dict[str, Any] | None:
    source = _extract_nested_object(value)
    if not source:
        return None

    if (
        source.get("role") == "employer"
        or source.get("nameOfCompany")
        or source.get("service_type")
        or source.get("position_key")
        or source.get("banner_type")
        or source.get("group_key")
        or source.get("channel_code")
    ):
        return None

    candidate_markers = (
        source.get("token_sms"),
        source.get("token_email"),
        source.get("last_apply_resume_id"),
        source.get("last_apply_at"),
        source.get("province_id"),
        source.get("district_id"),
        source.get("job_search_status"),
        source.get("fullName"),
        source.get("full_name"),
        source.get("candidateName"),
        source.get("candidate_name"),
        source.get("title"),
        source.get("jobTitle"),
        source.get("job_title"),
    )
    if not any(marker is not None and marker != "" for marker in candidate_markers):
        return None

    occupation_lookup, province_lookup = _catalog_lookup(catalog)
    occupation_ids = [_normalize_int(value) for value in (source.get("occupation_ids") or source.get("occupationIds") or [])]
    occupation_ids = [value for value in occupation_ids if value is not None]
    province_ids = [_normalize_int(value) for value in (source.get("province_ids") or source.get("provinceIds") or [])]
    province_ids = [value for value in province_ids if value is not None]

    occupation_names = [occupation_lookup[value]["name"] for value in occupation_ids if value in occupation_lookup]
    province_names = [province_lookup[value]["name"] for value in province_ids if value in province_lookup]

    full_name = _pick_text(source, ["fullName", "full_name", "name", "candidateName", "candidate_name"])
    if not full_name:
        full_name = _pick_text(source, ["title", "jobTitle", "job_title", "position", "headline", "currentJobTitle", "current_job_title"])
    if not full_name:
        return None

    email = _pick_text(source, ["email", "mail", "contactEmail", "contact_email"])
    phone = _pick_text(source, ["phone", "phoneNumber", "phone_number", "mobile", "contactPhone", "contact_phone"])
    title = _pick_text(source, ["title", "jobTitle", "job_title", "position", "headline", "currentJobTitle", "current_job_title"]) or full_name
    career_name = _pick_text(source, ["careerName", "career_name", "industry", "occupation", "occupationName", "field", "field_name"]) or ", ".join(occupation_names)
    city_name = _pick_text(source, ["cityName", "city_name", "locationName", "location_name", "city"]) or (province_names[0] if province_names else "")
    source_ref = _pick_text(source, ["sourceRef", "source_ref", "id", "candidateId", "candidate_id", "slug", "profileId", "profile_id"])
    skills_summary = _pick_text(source, ["skillsSummary", "skills_summary", "skills", "summary"])
    description = _pick_text(source, ["description", "bio", "summary", "about"])

    if not source_ref:
        source_ref = email or phone or full_name

    if not email and not phone and not title and not skills_summary and not description:
        return None

    return {
        "full_name": full_name,
        "email": email,
        "phone": phone,
        "title": title,
        "career_name": career_name,
        "city_name": city_name,
        "source_ref": source_ref,
        "source_url": fallback_source_url,
        "source_payload": source,
        "skills_summary": skills_summary,
        "description": description,
        "source_occupation_ids": occupation_ids,
        "source_occupation_names": occupation_names,
        "province_names": province_names,
    }


def _walk_json(value: Any, fallback_source_url: str, candidates: list[dict[str, Any]], seen: set[str], catalog: dict[str, Any]) -> None:
    if isinstance(value, list):
        for item in value:
            _walk_json(item, fallback_source_url, candidates, seen, catalog)
        return

    if not isinstance(value, dict):
        return

    normalized = _normalize_candidate_like(value, fallback_source_url, catalog)
    if normalized:
        key = (normalized.get("source_ref") or normalized.get("email") or normalized.get("phone") or normalized.get("full_name") or "").strip()
        if key and key not in seen:
            seen.add(key)
            candidates.append(normalized)

    for entry in value.values():
        _walk_json(entry, fallback_source_url, candidates, seen, catalog)


def _scrape_from_dom(page, fallback_source_url: str) -> list[dict[str, Any]]:
    selectors = [
        "table tbody tr",
        '[role="row"]',
        "article",
        "li",
        ".candidate",
        ".resume",
        ".profile",
        ".card",
    ]
    candidates: list[dict[str, Any]] = []
    seen: set[str] = set()

    for selector in selectors:
        try:
            rows = page.locator(selector).evaluate_all(
                """elements => elements.map((element) => ({
                    text: (element.innerText || '').trim(),
                    href: element.querySelector('a') ? element.querySelector('a').href : '',
                }))"""
            )
        except Exception:
            rows = []

        for row in rows or []:
            text = (row.get("text") or "").strip()
            lines = [line.strip() for line in text.split("\n") if line.strip()]
            if not lines:
                continue
            combined = " ".join(lines)
            import re

            email_match = re.search(r"[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}", combined, re.IGNORECASE)
            phone_match = re.search(r"(\+?\d[\d\s().-]{7,}\d)", combined)
            name = lines[0]
            key = (row.get("href") or "") or (email_match.group(0) if email_match else "") or (phone_match.group(0) if phone_match else "") or name
            if not key or key in seen or len(name) < 3:
                continue
            seen.add(key)
            candidates.append(
                {
                    "full_name": name,
                    "email": email_match.group(0) if email_match else "",
                    "phone": phone_match.group(0) if phone_match else "",
                    "title": lines[1] if len(lines) > 1 else name,
                    "career_name": "",
                    "city_name": "",
                    "source_ref": key,
                    "source_url": fallback_source_url,
                    "source_payload": {"text": combined, "href": row.get("href") or ""},
                    "skills_summary": "",
                    "description": combined,
                    "source_occupation_ids": [],
                    "source_occupation_names": [],
                    "province_names": [],
                }
            )

    return candidates


def _collect_json_payloads(page, source_url: str, wait_ms: int = 1500) -> list[Any]:
    payloads: list[Any] = []

    def on_response(response):
        content_type = (response.headers.get("content-type") or "").lower()
        if "application/json" not in content_type:
            return
        try:
            payloads.append(response.json())
        except Exception:
            return

    page.on("response", on_response)
    page.goto(source_url, wait_until="networkidle", timeout=60000)
    page.wait_for_timeout(wait_ms)
    return payloads


def _collect_candidates_from_search_api(
    page,
    auth_token: str | None,
    origin: str,
    source_url: str,
    occupation_ids: list[int],
    catalog: dict[str, Any],
    *,
    max_pages: int = 5,
    per_page: int = 20,
) -> list[dict[str, Any]]:
    candidates: list[dict[str, Any]] = []
    seen: set[str] = set()

    for page_number in range(1, max_pages + 1):
        items = _collect_search_items(page, auth_token, origin, occupation_ids, page_number, per_page)
        if not items:
            break

        for item in items:
            normalized = _normalize_search_item(item, catalog)
            if not normalized:
                continue

            key = (normalized.get("source_ref") or normalized.get("seeker_id") or normalized.get("full_name") or "").strip()
            if not key or key in seen:
                continue

            seen.add(key)
            candidates.append(normalized)

        if len(items) < per_page:
            break

    enriched_candidates: list[dict[str, Any]] = []
    for candidate in candidates:
        detail_page: dict[str, Any] = {}
        resume_id = candidate.get("resume_id")
        if resume_id is not None:
            try:
                detail_page = _collect_detail_page_snapshot(
                    page,
                    full_name=candidate.get("full_name") or "",
                    resume_id=resume_id,
                    source_url=source_url,
                    seeker_id=candidate.get("seeker_id"),
                    auth_token=auth_token,
                )
            except Exception:
                logger.warning(
                    "Vieclam24h detail page scrape failed for resume_id=%s",
                    resume_id,
                    exc_info=True,
                )
                detail_page = {}

        enriched_candidates.append(_enrich_candidate_from_detail(candidate, {}, detail_page))

    return enriched_candidates

def collect_vieclam24h_candidates(
    source_url: str,
    username: str,
    password: str,
    occupation_ids: list[int] | None = None,
    max_pages: int = 5,
    per_page: int = 20,
) -> list[dict[str, Any]]:
    if not source_url:
        raise ValueError("SOURCE_URL is required.")
    if not username:
        raise ValueError("SOURCE_USERNAME is required.")
    if not password:
        raise ValueError("SOURCE_PASSWORD is required.")

    try:
        from playwright.sync_api import sync_playwright
    except ImportError as exc:  # pragma: no cover - import guard
        raise RuntimeError(
            "Playwright is not installed in the current backend environment. "
            "Install the backend dependencies and rebuild the image."
        ) from exc

    origin = _resolve_origin(source_url)
    search_url = _search_url(origin)
    catalog = get_vieclam24h_catalog(source_url)
    selected_occupation_ids = _normalize_selected_occupation_ids(occupation_ids, catalog)

    candidates: list[dict[str, Any]] = []
    seen: set[str] = set()

    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page(viewport={"width": 1440, "height": 1600})
        try:
            auth_token = _login_vieclam24h(page, username, password, search_url)
            candidates = _collect_candidates_from_search_api(
                page,
                auth_token,
                origin,
                source_url,
                selected_occupation_ids,
                catalog,
                max_pages=max_pages,
                per_page=per_page,
            )
        finally:
            browser.close()

    return candidates
