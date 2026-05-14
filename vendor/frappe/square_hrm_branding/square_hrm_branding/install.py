import json
from contextlib import suppress

import frappe


BRAND_NAME = "Square HRM"
BRAND_LOGO = "/assets/square_hrm_branding/images/square/text-logo-black.svg"
BRAND_ICON = "/assets/square_hrm_branding/images/square/icon.svg"
DEFAULT_LANGUAGE = "vi"
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
HRMS_DESKTOP_LABELS = {"Frappe HR", "Square HRM"}
VISIBLE_DESKTOP_APPS = {"hrms"}
HIDDEN_WORKSPACE_APPS = {"frappe", "erpnext"}


def _set_single_value(doctype, field, value):
	if frappe.get_meta(doctype).has_field(field):
		frappe.db.set_single_value(doctype, field, value, update_modified=False)


def _clear_language_cache():
	for key in ("languages", "languages_with_name"):
		with suppress(Exception):
			frappe.cache.delete_value(key)
		with suppress(Exception):
			frappe.client_cache.delete_value(key)
	with suppress(Exception):
		from frappe.translate import MERGED_TRANSLATION_KEY, USER_TRANSLATION_KEY

		for language_code in SUPPORTED_LANGUAGES:
			frappe.cache.hdel(MERGED_TRANSLATION_KEY, language_code)
			frappe.cache.hdel(USER_TRANSLATION_KEY, language_code)


def _clear_desk_cache():
	for key in ("bootinfo", "desktop_icons"):
		with suppress(Exception):
			frappe.cache.delete_key(key)
	with suppress(Exception):
		frappe.client_cache.delete_value("assets_json", shared=True)
	with suppress(Exception):
		frappe.client_cache.delete_value("assets_json")


def _is_visible_desktop_icon(icon):
	return icon.get("app") in VISIBLE_DESKTOP_APPS or icon.get("label") in HRMS_DESKTOP_LABELS


def _configure_desktop_icons():
	if not frappe.db.table_exists("Desktop Icon"):
		return

	for icon in frappe.get_all("Desktop Icon", fields=["name", "label", "app", "hidden"]):
		hidden = 0 if _is_visible_desktop_icon(icon) else 1
		values = {"hidden": hidden}
		if icon.label in HRMS_DESKTOP_LABELS:
			values["logo_url"] = BRAND_ICON
		if icon.hidden != hidden or icon.label in HRMS_DESKTOP_LABELS:
			frappe.db.set_value("Desktop Icon", icon.name, values, update_modified=False)


def _configure_desktop_layouts():
	if not frappe.db.table_exists("Desktop Layout"):
		return

	for desktop_layout in frappe.get_all("Desktop Layout", fields=["name", "layout"]):
		with suppress(Exception):
			layout = json.loads(desktop_layout.layout or "[]")
			if not isinstance(layout, list):
				continue
			filtered_layout = [icon for icon in layout if _is_visible_desktop_icon(icon)]
			if filtered_layout != layout:
				frappe.db.set_value(
					"Desktop Layout",
					desktop_layout.name,
					"layout",
					json.dumps(filtered_layout),
					update_modified=False,
				)


def _configure_workspaces():
	if not frappe.db.table_exists("Workspace"):
		return

	for workspace in frappe.get_all("Workspace", fields=["name", "app", "module", "public", "is_hidden"]):
		app_name = workspace.app
		if not app_name and workspace.module:
			app_name = frappe.db.get_value("Module Def", workspace.module, "app_name")
		if app_name in HIDDEN_WORKSPACE_APPS:
			frappe.db.set_value(
				"Workspace",
				workspace.name,
				{"public": 0, "is_hidden": 1},
				update_modified=False,
			)


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
	_configure_desktop_icons()
	_configure_desktop_layouts()
	_configure_workspaces()
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
	_clear_desk_cache()
	frappe.db.commit()
