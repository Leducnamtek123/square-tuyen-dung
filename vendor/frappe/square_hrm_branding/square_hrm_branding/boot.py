BRAND_NAME = "Square HRM"
BRAND_LOGO = "/assets/square_hrm_branding/images/square/text-logo-black.svg"
BRAND_ICON = "/assets/square_hrm_branding/images/square/icon.svg"
DEFAULT_LANGUAGE = "vi"
SUPPORTED_LANGUAGES = {"en", "vi"}
HRMS_DESKTOP_LABELS = {"Frappe HR", "Square HRM"}
VISIBLE_DESKTOP_APPS = {"hrms"}


def _is_visible_desktop_icon(icon):
	return icon.get("app") in VISIBLE_DESKTOP_APPS or icon.get("label") in HRMS_DESKTOP_LABELS


def _filter_desktop_icons(bootinfo):
	desktop_icons = bootinfo.get("desktop_icons") or []
	filtered_icons = []
	for icon in desktop_icons:
		if not _is_visible_desktop_icon(icon):
			continue
		if icon.get("label") in HRMS_DESKTOP_LABELS:
			icon["logo_url"] = BRAND_ICON
			icon["hidden"] = 0
		filtered_icons.append(icon)
	bootinfo.desktop_icons = filtered_icons


def extend_bootinfo(bootinfo):
	if bootinfo.get("lang") not in SUPPORTED_LANGUAGES:
		bootinfo.lang = DEFAULT_LANGUAGE
	bootinfo.app_logo_url = BRAND_LOGO
	bootinfo.square_hrm_brand = {
		"name": BRAND_NAME,
		"logo": BRAND_LOGO,
		"default_language": DEFAULT_LANGUAGE,
		"supported_languages": ["en", "vi"],
	}
	_filter_desktop_icons(bootinfo)

	for app in bootinfo.get("app_data") or []:
		if app.get("app_name") in {"frappe", "hrms", "erpnext"}:
			app["app_title"] = BRAND_NAME
			app["app_logo_url"] = BRAND_LOGO

	if bootinfo.get("apps_data", {}).get("apps"):
		for app in bootinfo["apps_data"]["apps"]:
			if app.get("name") in {"frappe", "hrms", "erpnext"}:
				app["title"] = BRAND_NAME
				app["logo"] = BRAND_LOGO
