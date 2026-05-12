from contextlib import suppress

import frappe


BRAND_NAME = "Square HRM"
BRAND_LOGO = "/assets/square_hrm_branding/images/square/text-logo-black.svg"
BRAND_ICON = "/assets/square_hrm_branding/images/square/icon.svg"
DEFAULT_LANGUAGE = "en"
SUPPORTED_LANGUAGES = {
	"en": "English",
	"vi": "Vietnamese",
}
BRAND_HTML = (
	'<span class="square-hrm-web-brand">'
	'<img src="/assets/square_hrm_branding/images/square/text-logo-black.svg" alt="Square" />'
	'<span class="square-hrm-web-brand__suffix">HRM</span>'
	"</span>"
)


def _set_single_value(doctype, field, value):
	if frappe.get_meta(doctype).has_field(field):
		frappe.db.set_single_value(doctype, field, value, update_modified=False)


def _clear_language_cache():
	for key in ("languages", "languages_with_name"):
		with suppress(Exception):
			frappe.cache.delete_value(key)
		with suppress(Exception):
			frappe.client_cache.delete_value(key)


def _configure_languages():
	if not frappe.db.table_exists("Language"):
		return

	for language_code, language_name in SUPPORTED_LANGUAGES.items():
		if frappe.db.exists("Language", language_code):
			frappe.db.set_value(
				"Language",
				language_code,
				{
					"language_code": language_code,
					"language_name": language_name,
					"enabled": 1,
				},
				update_modified=False,
			)
		else:
			frappe.get_doc(
				{
					"doctype": "Language",
					"language_code": language_code,
					"language_name": language_name,
					"enabled": 1,
				}
			).insert(ignore_permissions=True)

	for language_code in frappe.get_all("Language", pluck="name"):
		if language_code not in SUPPORTED_LANGUAGES:
			frappe.db.set_value("Language", language_code, "enabled", 0, update_modified=False)

	frappe.db.sql(
		"""
		update `tabUser`
		set language = %s
		where coalesce(language, '') = ''
		   or language not in ('en', 'vi')
		""",
		(DEFAULT_LANGUAGE,),
	)
	_clear_language_cache()


def apply_branding():
	frappe.db.set_default("lang", DEFAULT_LANGUAGE)
	_configure_languages()
	_set_single_value("System Settings", "app_name", BRAND_NAME)
	_set_single_value("System Settings", "disable_product_suggestion", 1)
	_set_single_value("System Settings", "language", DEFAULT_LANGUAGE)
	_set_single_value("Website Settings", "app_name", BRAND_NAME)
	_set_single_value("Website Settings", "app_logo", BRAND_LOGO)
	_set_single_value("Website Settings", "favicon", BRAND_ICON)
	_set_single_value("Website Settings", "splash_image", BRAND_LOGO)
	_set_single_value("Website Settings", "brand_html", BRAND_HTML)
	_set_single_value("Website Settings", "show_footer_on_login", 0)
	_set_single_value("Website Settings", "show_language_picker", 0)
	_set_single_value("Website Settings", "language", DEFAULT_LANGUAGE)
	_set_single_value("Navbar Settings", "app_logo", BRAND_LOGO)
	for user in ("Administrator", "Guest"):
		if frappe.db.exists("User", user):
			frappe.db.set_value("User", user, "language", DEFAULT_LANGUAGE, update_modified=False)
	frappe.db.commit()
