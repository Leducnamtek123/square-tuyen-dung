(function () {
	const BRAND_NAME = "Square HRM";
	const BRAND_LOGO = "/assets/square_hrm_branding/images/square/text-logo-black.svg";
	const BRAND_ICON = "/assets/square_hrm_branding/images/square/icon.svg";
	const BRAND_FAVICON = BRAND_ICON;
	const FALLBACK_LANGUAGE = "vi";
	const LANGUAGE_STORAGE_KEY = "square_hrm_language_v2";
	const LANGUAGE_COOKIE = "preferred_language";
	const SUPPORTED_LANGUAGES = new Set(["en", "vi"]);
	const LANGUAGE_OPTIONS = {
		en: "English",
		vi: "Ti\u1ebfng Vi\u1ec7t",
	};
	const LANGUAGE_LABELS = {
		en: "Language",
		vi: "Ng\u00f4n ng\u1eef",
	};
	const translations = {
		"Login to Square HRM": {
			en: "Login to Square HRM",
			vi: "\u0110\u0103ng nh\u1eadp Square HRM",
		},
		"Create a Square HRM Account": {
			en: "Create a Square HRM Account",
			vi: "T\u1ea1o t\u00e0i kho\u1ea3n Square HRM",
		},
		"Signup Disabled": {
			en: "Signup Disabled",
			vi: "\u0110\u0103ng k\u00fd \u0111\u00e3 t\u1eaft",
		},
		"Signups have been disabled for this website.": {
			en: "Signups have been disabled for this website.",
			vi: "Website n\u00e0y \u0111\u00e3 t\u1eaft \u0111\u0103ng k\u00fd.",
		},
		"Login": {
			en: "Login",
			vi: "\u0110\u0103ng nh\u1eadp",
		},
		"Forgot Password": {
			en: "Forgot Password",
			vi: "Qu\u00ean m\u1eadt kh\u1ea9u",
		},
		"Forgot Password?": {
			en: "Forgot Password?",
			vi: "Qu\u00ean m\u1eadt kh\u1ea9u?",
		},
		"Reset Password": {
			en: "Reset Password",
			vi: "\u0110\u1eb7t l\u1ea1i m\u1eadt kh\u1ea9u",
		},
		"Back to Login": {
			en: "Back to Login",
			vi: "Quay l\u1ea1i \u0111\u0103ng nh\u1eadp",
		},
		"Show": {
			en: "Show",
			vi: "Hi\u1ec7n",
		},
		"Login with Email Link": {
			en: "Login with Email Link",
			vi: "\u0110\u0103ng nh\u1eadp b\u1eb1ng li\u00ean k\u1ebft email",
		},
		"Send login link": {
			en: "Send login link",
			vi: "G\u1eedi li\u00ean k\u1ebft \u0111\u0103ng nh\u1eadp",
		},
		"or": {
			en: "or",
			vi: "ho\u1eb7c",
		},
		"Email": {
			en: "Email",
			vi: "Email",
		},
		"Email Address": {
			en: "Email Address",
			vi: "\u0110\u1ecba ch\u1ec9 email",
		},
		"Password": {
			en: "Password",
			vi: "M\u1eadt kh\u1ea9u",
		},
		"Search": {
			en: "Search",
			vi: "T\u00ecm ki\u1ebfm",
		},
		"Home": {
			en: "Home",
			vi: "Trang ch\u1ee7",
		},
		"Logout": {
			en: "Logout",
			vi: "\u0110\u0103ng xu\u1ea5t",
		},
		"Language": {
			en: "Language",
			vi: "Ng\u00f4n ng\u1eef",
		},
	};
	const translationAliases = {
		"Connexion": "Login",
		"Afficher": "Show",
		"Ou": "or",
		"ou": "or",
		"Courriel": "Email",
		"E-mail": "Email",
		"Mot de passe": "Password",
		"Rechercher": "Search",
		"Accueil": "Home",
		"Langue": "Language",
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

	function getBootLanguage() {
		return window.frappe?.boot?.lang || "";
	}

	function getCurrentLanguage() {
		return normalizeLanguage(
			getQueryLanguage()
				|| getStoredLanguage()
				|| getBootLanguage()
				|| getCookie(LANGUAGE_COOKIE)
				|| FALLBACK_LANGUAGE
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
					setAttributeIfChanged(element, attr, replaceText(value));
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

	function isDeskShell() {
		const path = window.location.pathname;
		const user = window.frappe?.session?.user || window.frappe?.boot?.user?.name || "";
		return (
			user !== "Guest"
			&& (
				path.startsWith("/app")
				|| path.startsWith("/desk")
				|| !!document.querySelector(".body-sidebar, .page-container[data-page-route], .desktop-navbar, .navbar")
			)
		);
	}

	function getDeskHeaderActions() {
		if (!isDeskShell()) return null;
		const navbar = document.querySelector("header.desktop-navbar")
			|| document.querySelector(".desktop-navbar")
			|| document.querySelector("header .navbar")
			|| document.querySelector(".navbar");
		if (!navbar) return null;
		let actions = navbar.querySelector(".square-hrm-desk-actions");
		if (!actions) {
			actions = document.createElement("div");
			actions.className = "square-hrm-desk-actions";
			const parent = navbar.querySelector(".navbar-right")
				|| navbar.querySelector(".container")
				|| navbar;
			parent.appendChild(actions);
		}
		return actions;
	}

	function renderLanguageSwitcher() {
		let switcher = document.querySelector(".square-hrm-language-switcher");
		if (isDeskShell()) {
			switcher?.remove();
			return;
		}
		if (!switcher) {
			switcher = document.createElement("div");
			switcher.className = "square-hrm-language-switcher";
			switcher.setAttribute("role", "group");
		}

		document.body.appendChild(switcher);
		switcher.classList.remove("is-in-desk");
		switcher.classList.add("is-floating");

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

	function getVisibleSidebarMenu() {
		const menus = [...document.querySelectorAll(".frappe-menu.context-menu")];
		return menus.find((menu) => {
			const style = getComputedStyle(menu);
			if (style.display === "none" || style.visibility === "hidden" || !menu.getClientRects().length) return false;
			const titles = [...menu.querySelectorAll(".menu-item-title")].map((title) => title.textContent.trim());
			return titles.includes("Reload") && titles.includes("Toggle Theme");
		});
	}

	function getMenuItemByTitle(menu, label) {
		return [...menu.querySelectorAll(".dropdown-menu-item")].find((item) => {
			return item.querySelector(".menu-item-title")?.textContent.trim() === label;
		});
	}

	function renderDeskMenuLanguageSwitcher() {
		if (!isDeskShell()) return;
		const menu = getVisibleSidebarMenu();
		if (!menu) return;
		const language = getCurrentLanguage();
		let item = menu.querySelector(".square-hrm-menu-language-item");
		if (!item) {
			item = document.createElement("div");
			item.className = "dropdown-menu-item square-hrm-menu-language-item";
			item.addEventListener("click", (event) => {
				event.preventDefault();
				event.stopPropagation();
			});
		}
		item.innerHTML = `
			<a>
				<div class="menu-item-icon">${window.frappe?.utils?.icon?.("globe") || ""}</div>
				<span class="menu-item-title">${LANGUAGE_LABELS[language]}</span>
				<div class="square-hrm-menu-language-toggle" role="group" aria-label="${LANGUAGE_LABELS[language]}"></div>
			</a>
		`;
		const toggle = item.querySelector(".square-hrm-menu-language-toggle");
		for (const code of Object.keys(LANGUAGE_OPTIONS)) {
			const button = document.createElement("button");
			button.type = "button";
			button.className = `square-hrm-menu-language-button${code === language ? " is-active" : ""}`;
			button.textContent = code.toUpperCase();
			button.setAttribute("aria-pressed", code === language ? "true" : "false");
			button.setAttribute("title", LANGUAGE_OPTIONS[code]);
			button.addEventListener("click", (event) => {
				event.preventDefault();
				event.stopPropagation();
				if (code !== getCurrentLanguage()) {
					setPreferredLanguage(code, true);
				}
			});
			toggle.appendChild(button);
		}
		const themeItem = getMenuItemByTitle(menu, "Toggle Theme");
		const helpItem = getMenuItemByTitle(menu, "Help");
		const logoutItem = getMenuItemByTitle(menu, "Logout");
		if (themeItem?.nextSibling) {
			themeItem.after(item);
		} else if (helpItem) {
			menu.insertBefore(item, helpItem);
		} else if (logoutItem) {
			menu.insertBefore(item, logoutItem);
		} else {
			menu.appendChild(item);
		}
	}

	function getUserDisplayName() {
		const bootUser = window.frappe?.boot?.user;
		if (bootUser && typeof bootUser === "object") {
			return bootUser.full_name || bootUser.name || window.frappe?.session?.user || "User";
		}
		return window.frappe?.boot?.full_name || window.frappe?.session?.user || "User";
	}

	function getUserInitials(name) {
		const cleanName = String(name || "A").replace(/@.*/, "").trim();
		const parts = cleanName.split(/\s+/).filter(Boolean);
		if (!parts.length) return "A";
		return parts.slice(0, 2).map((part) => part[0]).join("").toUpperCase();
	}

	function logoutFromAvatar() {
		const csrfToken = window.frappe?.csrf_token
			|| document.querySelector("meta[name='csrf-token']")?.content
			|| "";
		window.fetch("/api/method/logout", {
			method: "POST",
			credentials: "same-origin",
			headers: {
				"Accept": "application/json",
				"X-Frappe-CSRF-Token": csrfToken,
			},
		}).finally(() => {
			window.location.assign("/login");
		});
	}

	function renderDeskUserAvatar() {
		let avatar = document.querySelector(".square-hrm-user-avatar");
		if (!isDeskShell()) {
			avatar?.remove();
			return;
		}
		const headerActions = getDeskHeaderActions();
		if (!headerActions) return;
		if (!avatar) {
			avatar = document.createElement("button");
			avatar.type = "button";
			avatar.className = "square-hrm-user-avatar";
			avatar.addEventListener("click", logoutFromAvatar);
		}
		const language = getCurrentLanguage();
		const name = getUserDisplayName();
		const label = translations.Logout[language] || translations.Logout.en;
		avatar.setAttribute("title", label);
		avatar.setAttribute("aria-label", label);
		avatar.innerHTML = `
			<span class="square-hrm-user-avatar__initials">${getUserInitials(name)}</span>
			<span class="square-hrm-user-avatar__name">${name}</span>
		`;
		headerActions.appendChild(avatar);
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
			renderDeskMenuLanguageSwitcher();
			renderDeskUserAvatar();
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
