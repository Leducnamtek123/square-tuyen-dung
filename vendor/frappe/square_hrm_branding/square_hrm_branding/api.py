import frappe


SUPPORTED_LANGUAGES = {"en", "vi"}
DEFAULT_LANGUAGE = "vi"


def _normalize_language(language):
	language = str(language or "").lower().replace("_", "-").split("-")[0]
	return language if language in SUPPORTED_LANGUAGES else DEFAULT_LANGUAGE


@frappe.whitelist()
def set_user_language(language):
	language = _normalize_language(language)
	user = frappe.session.user
	if not user or user == "Guest":
		return {"language": language}

	frappe.db.set_value("User", user, "language", language, update_modified=False)
	frappe.cache.hdel("bootinfo", user)
	frappe.cache.hdel("lang", user)
	return {"language": language}
