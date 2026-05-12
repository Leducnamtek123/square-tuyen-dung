BRAND_NAME = "Square HRM"
BRAND_LOGO = "/assets/square_hrm_branding/images/square/text-logo-black.svg"


def extend_bootinfo(bootinfo):
	bootinfo.app_logo_url = BRAND_LOGO
	bootinfo.square_hrm_brand = {
		"name": BRAND_NAME,
		"logo": BRAND_LOGO,
		"supported_languages": ["en", "vi"],
	}

	for app in bootinfo.get("app_data") or []:
		if app.get("app_name") in {"frappe", "hrms", "erpnext"}:
			app["app_title"] = BRAND_NAME
			app["app_logo_url"] = BRAND_LOGO

	if bootinfo.get("apps_data", {}).get("apps"):
		for app in bootinfo["apps_data"]["apps"]:
			if app.get("name") in {"frappe", "hrms", "erpnext"}:
				app["title"] = BRAND_NAME
				app["logo"] = BRAND_LOGO
