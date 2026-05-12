(function () {
	const BRAND_NAME = "Square HRM";
	const BRAND_LOGO = "/assets/square_hrm_branding/images/square/text-logo-black.svg";
	const BRAND_ICON = "/assets/square_hrm_branding/images/square/icon.svg";
	const BRAND_FAVICON = BRAND_ICON;
	const FALLBACK_LANGUAGE = "en";
	const LANGUAGE_STORAGE_KEY = "square_hrm_language";
	const LANGUAGE_COOKIE = "preferred_language";
	const SUPPORTED_LANGUAGES = new Set(["en", "vi"]);
	const LANGUAGE_OPTIONS = {
		en: "English",
		vi: "Tiếng Việt",
	};
	const LANGUAGE_LABELS = {
		en: "Language",
		vi: "Ngôn ngữ",
	};
	const translations = {
		"Login to Square HRM": {
			en: "Login to Square HRM",
			vi: "Đăng nhập Square HRM",
		},
		"Login": {
			en: "Login",
			vi: "Đăng nhập",
		},
		"Forgot Password?": {
			en: "Forgot Password?",
			vi: "Quên mật khẩu?",
		},
		"Show": {
			en: "Show",
			vi: "Hiện",
		},
		"Login with Email Link": {
			en: "Login with Email Link",
			vi: "Đăng nhập bằng liên kết email",
		},
		"or": {
			en: "or",
			vi: "hoặc",
		},
		"Email": {
			en: "Email",
			vi: "Email",
		},
		"Password": {
			en: "Password",
			vi: "Mật khẩu",
		},
		"Search": {
			en: "Search",
			vi: "Tìm kiếm",
		},
		"Home": {
			en: "Home",
			vi: "Trang chủ",
		},
		"Logout": {
			en: "Logout",
			vi: "Đăng xuất",
		},
		"Language": {
			en: "Language",
			vi: "Ngôn ngữ",
		},
	};
	const translationAliases = {
		"Se connecter à Square HRM": "Login to Square HRM",
		"Se connecter a Square HRM": "Login to Square HRM",
		"Connexion": "Login",
		"Mot de Passe Oublié ?": "Forgot Password?",
		"Mot de Passe Oublié?": "Forgot Password?",
		"Mot de passe oublié ?": "Forgot Password?",
		"Mot de passe oublié?": "Forgot Password?",
		"Afficher": "Show",
		"Ou": "or",
		"ou": "or",
		"Courriel": "Email",
		"E-mail": "Email",
		"Mot de passe": "Password",
		"Rechercher": "Search",
		"Accueil": "Home",
		"Déconnexion": "Logout",
		"Langue": "Language",
		"Đăng nhập Square HRM": "Login to Square HRM",
		"Đăng nhập": "Login",
		"Quên mật khẩu?": "Forgot Password?",
		"Hiện": "Show",
		"Đăng nhập bằng liên kết email": "Login with Email Link",
		"hoặc": "or",
		"Mật khẩu": "Password",
		"Tìm kiếm": "Search",
		"Trang chủ": "Home",
		"Đăng xuất": "Logout",
		"Ngôn ngữ": "Language",
	};
	const replacements = [
		[/Frappe HR/g, BRAND_NAME],
		[/Frappe Framework/g, BRAND_NAME],
		[/Frappe Cloud/g, `${BRAND_NAME} Cloud`],
		[/Built on Frappe/g, `Powered by ${BRAND_NAME}`],
		[/Frappe/g, BRAND_NAME],
		[/ERPNext/g, `${BRAND_NAME} Core`],
	];

	function replaceText(value) {
		if (!value) return value;
		return replacements.reduce((text, [pattern, replacement]) => text.replace(pattern, replacement), value);
	}

	function normalizeLanguage(value) {
		const language = String(value || "").toLowerCase().replace("_", "-").split("-")[0];
		return SUPPORTED_LANGUAGES.has(language) ? language : FALLBACK_LANGUAGE;
	}

	function getQueryLanguage() {
		try {
			return new URLSearchParams(window.location.search).get("_lang");
		} catch {
			return "";
		}
	}

	function getCookie(name) {
		const cookies = document.cookie ? document.cookie.split(";") : [];
		for (const cookie of cookies) {
			const [key, ...parts] = cookie.trim().split("=");
			if (key === name) return decodeURIComponent(parts.join("=") || "");
		}
		return "";
	}

	function getStoredLanguage() {
		try {
			return window.localStorage?.getItem(LANGUAGE_STORAGE_KEY) || "";
		} catch {
			return "";
		}
	}

	function getCurrentLanguage() {
		return normalizeLanguage(
			getQueryLanguage()
				|| getStoredLanguage()
				|| getCookie(LANGUAGE_COOKIE)
				|| window.frappe?.boot?.lang
				|| document.documentElement.lang
				|| navigator.language
		);
	}

	function rememberLanguage(language) {
		const normalizedLanguage = normalizeLanguage(language);
		try {
			window.localStorage?.setItem(LANGUAGE_STORAGE_KEY, normalizedLanguage);
		} catch {
			// localStorage can be disabled in private windows.
		}
		document.cookie = `${LANGUAGE_COOKIE}=${encodeURIComponent(normalizedLanguage)}; Path=/; Max-Age=31536000; SameSite=Lax`;
		document.documentElement.lang = normalizedLanguage;
		if (window.frappe?.boot) {
			window.frappe.boot.lang = normalizedLanguage;
		}
		return normalizedLanguage;
	}

	function setPreferredLanguage(language, shouldReload = false) {
		const normalizedLanguage = rememberLanguage(language);
		if (shouldReload) {
			const url = new URL(window.location.href);
			url.searchParams.set("_lang", normalizedLanguage);
			window.location.assign(url.toString());
		}
		return normalizedLanguage;
	}

	function setAttributeIfChanged(element, attr, value) {
		if (element && element.getAttribute(attr) !== value) {
			element.setAttribute(attr, value);
		}
	}

	function walkText(root) {
		if (!root || root.nodeType !== Node.ELEMENT_NODE) return;
		const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, {
			acceptNode(node) {
				const parent = node.parentElement;
				if (!parent) return NodeFilter.FILTER_REJECT;
				if (["SCRIPT", "STYLE", "TEXTAREA", "INPUT", "CODE", "PRE"].includes(parent.tagName)) {
					return NodeFilter.FILTER_REJECT;
				}
				return /Frappe|ERPNext/.test(node.nodeValue || "")
					? NodeFilter.FILTER_ACCEPT
					: NodeFilter.FILTER_REJECT;
			},
		});

		const nodes = [];
		while (walker.nextNode()) nodes.push(walker.currentNode);
		for (const node of nodes) node.nodeValue = replaceText(node.nodeValue || "");
	}

	function resolveTranslationKey(value) {
		const normalizedValue = replaceText(String(value || "").replace(/\s+/g, " ").trim());
		return translationAliases[normalizedValue] || (translations[normalizedValue] ? normalizedValue : "");
	}

	function translateValue(value, language) {
		if (!value) return value;
		const text = String(value);
		const trimmed = text.trim();
		if (!trimmed) return value;
		const key = resolveTranslationKey(trimmed);
		const translated = key ? translations[key]?.[language] : "";
		if (!translated || translated === trimmed) return value;
		return text.replace(trimmed, translated);
	}

	function patchI18nText(root) {
		if (!root || root.nodeType !== Node.ELEMENT_NODE) return;
		const language = getCurrentLanguage();
		const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, {
			acceptNode(node) {
				const parent = node.parentElement;
				if (!parent) return NodeFilter.FILTER_REJECT;
				if (["SCRIPT", "STYLE", "TEXTAREA", "INPUT", "CODE", "PRE"].includes(parent.tagName)) {
					return NodeFilter.FILTER_REJECT;
				}
				return resolveTranslationKey(node.nodeValue || "")
					? NodeFilter.FILTER_ACCEPT
					: NodeFilter.FILTER_REJECT;
			},
		});

		const nodes = [];
		while (walker.nextNode()) nodes.push(walker.currentNode);
		for (const node of nodes) node.nodeValue = translateValue(node.nodeValue || "", language);
	}

	function patchAttributes(root) {
		for (const element of root.querySelectorAll("[title], [aria-label], [alt], [placeholder]")) {
			for (const attr of ["title", "aria-label", "alt", "placeholder"]) {
				const value = element.getAttribute(attr);
				if (value && /Frappe|ERPNext/.test(value)) {
					const brandedValue = replaceText(value);
					setAttributeIfChanged(element, attr, brandedValue);
				}
			}
		}
	}

	function patchI18nAttributes(root) {
		const language = getCurrentLanguage();
		for (const element of root.querySelectorAll("[title], [aria-label], [alt], [placeholder], [data-original-title]")) {
			for (const attr of ["title", "aria-label", "alt", "placeholder", "data-original-title"]) {
				const value = element.getAttribute(attr);
				const translatedValue = translateValue(value, language);
				if (translatedValue && translatedValue !== value) {
					setAttributeIfChanged(element, attr, translatedValue);
				}
			}
		}
	}

	function patchImageList(root, selectors, source) {
		for (const img of root.querySelectorAll(selectors.join(","))) {
			setAttributeIfChanged(img, "src", source);
			setAttributeIfChanged(img, "alt", BRAND_NAME);
		}
	}

	function patchImages(root) {
		patchImageList(root, [
			".app-logo",
			".page-card-head img",
			".login-content img",
		], BRAND_LOGO);

		patchImageList(root, [
			".navbar-home img",
			"img[src*='frappe-hr-logo']",
			"img[src*='frappe-framework-logo']",
		], BRAND_ICON);
	}

	function patchFavicons() {
		const links = document.querySelectorAll("link[rel*='icon']");
		if (!links.length) {
			const link = document.createElement("link");
			link.rel = "icon";
			link.href = BRAND_FAVICON;
			document.head.appendChild(link);
			return;
		}
		for (const link of links) setAttributeIfChanged(link, "href", BRAND_FAVICON);
	}

	function patchLanguage() {
		return rememberLanguage(getCurrentLanguage());
	}

	function patchTitle() {
		const language = getCurrentLanguage();
		const title = replaceText(document.title || BRAND_NAME) || BRAND_NAME;
		document.title = translateValue(title, language) || title;
	}

	function renderLanguageSwitcher() {
		let switcher = document.querySelector(".square-hrm-language-switcher");
		if (!switcher) {
			switcher = document.createElement("div");
			switcher.className = "square-hrm-language-switcher";
			switcher.setAttribute("role", "group");
			document.body.appendChild(switcher);
		}

		const language = getCurrentLanguage();
		switcher.setAttribute("aria-label", LANGUAGE_LABELS[language]);
		switcher.innerHTML = "";
		for (const code of Object.keys(LANGUAGE_OPTIONS)) {
			const button = document.createElement("button");
			button.type = "button";
			button.className = `square-hrm-language-switcher__button${code === language ? " is-active" : ""}`;
			button.dataset.squareLanguage = code;
			button.setAttribute("aria-pressed", code === language ? "true" : "false");
			button.setAttribute("title", LANGUAGE_OPTIONS[code]);
			button.textContent = code.toUpperCase();
			button.addEventListener("click", () => {
				if (code !== getCurrentLanguage()) {
					setPreferredLanguage(code, true);
				}
			});
			switcher.appendChild(button);
		}
	}

	let observer;
	let patching = false;
	let scheduled = false;

	function apply() {
		if (!document.body || patching) return;
		patching = true;
		observer?.disconnect();
		try {
			patchLanguage();
			walkText(document.body);
			patchI18nText(document.body);
			patchAttributes(document.body);
			patchI18nAttributes(document.body);
			patchImages(document.body);
			patchFavicons();
			patchTitle();
			renderLanguageSwitcher();
		} finally {
			patching = false;
			observer?.observe(document.documentElement, { childList: true, subtree: true });
		}
	}

	function scheduleApply() {
		if (scheduled || patching) return;
		scheduled = true;
		window.requestAnimationFrame(() => {
			scheduled = false;
			apply();
		});
	}

	window.SquareHRMBranding = { apply, setPreferredLanguage, getCurrentLanguage };
	document.addEventListener("DOMContentLoaded", apply);
	window.addEventListener("load", apply);

	observer = new MutationObserver(scheduleApply);
	observer.observe(document.documentElement, { childList: true, subtree: true });
})();
