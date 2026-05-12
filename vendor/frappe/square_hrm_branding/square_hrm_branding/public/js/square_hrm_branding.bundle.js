(function () {
	const BRAND_NAME = "Square HRM";
	const BRAND_LOGO = "/assets/square_hrm_branding/images/square/text-logo-black.svg";
	const FALLBACK_LANGUAGE = "en";
	const SUPPORTED_LANGUAGES = new Set(["en", "vi"]);
	const replacements = [
		[/Frappe HR/g, BRAND_NAME],
		[/Frappe Framework/g, BRAND_NAME],
		[/Frappe Cloud/g, `${BRAND_NAME} Cloud`],
		[/Frappe/g, BRAND_NAME],
		[/ERPNext/g, `${BRAND_NAME} Core`],
	];

	function replaceText(value) {
		if (!value) return value;
		return replacements.reduce((text, [pattern, replacement]) => text.replace(pattern, replacement), value);
	}

	function normalizeLanguage(value) {
		const language = String(value || "").toLowerCase().split("-")[0];
		return SUPPORTED_LANGUAGES.has(language) ? language : FALLBACK_LANGUAGE;
	}

	function patchBoot() {
		if (!window.frappe?.boot) return;
		window.frappe.boot.lang = normalizeLanguage(window.frappe.boot.lang || document.documentElement.lang);
		window.frappe.boot.app_logo_url = BRAND_LOGO;
		for (const app of window.frappe.boot.app_data || []) {
			if (["frappe", "hrms", "erpnext"].includes(app.app_name)) {
				app.app_title = BRAND_NAME;
				app.app_logo_url = BRAND_LOGO;
			}
		}
		if (window.frappe.boot.navbar_settings) {
			window.frappe.boot.navbar_settings.app_logo = BRAND_LOGO;
		}
	}

	function patchAboutDialog() {
		const aboutBody = document.querySelector(".modal.show .modal-body");
		if (!aboutBody || aboutBody.dataset.squareHrmAboutPatched) return;
		if (!aboutBody.textContent?.includes("Square HRM")) return;
		aboutBody.dataset.squareHrmAboutPatched = "1";
		aboutBody.closest(".modal")?.classList.add("square-hrm-about");
	}

	let observer;
	let patching = false;
	let scheduled = false;

	function patchDocument() {
		if (patching) return;
		patching = true;
		observer?.disconnect();
		try {
			patchBoot();
			window.SquareHRMBranding?.apply?.();
			patchAboutDialog();
		} finally {
			patching = false;
			observer?.observe(document.documentElement, { childList: true, subtree: true });
		}
	}

	function schedulePatchDocument() {
		if (scheduled || patching) return;
		scheduled = true;
		window.requestAnimationFrame(() => {
			scheduled = false;
			patchDocument();
		});
	}

	document.addEventListener("DOMContentLoaded", patchDocument);
	window.addEventListener("load", patchDocument);

	if (window.frappe?.router?.on) {
		window.frappe.router.on("change", () => setTimeout(patchDocument, 50));
	}

	observer = new MutationObserver(schedulePatchDocument);
	observer.observe(document.documentElement, { childList: true, subtree: true });
})();
