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
		vi: "Ti\u1ebfng Vi\u1ec7t",
		en: "English",
	};
	const LANGUAGE_LABELS = {
		vi: "Ng\u00f4n ng\u1eef",
		en: "Language",
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
	const hrmTranslations = {
		"Edit Profile": { en: "Edit Profile", vi: "Chỉnh sửa hồ sơ" },
		"Toggle Theme": { en: "Toggle Theme", vi: "Đổi giao diện" },
		"About": { en: "About", vi: "Giới thiệu" },
		"Frappe Support": { en: "Square HRM Support", vi: "Hỗ trợ Square HRM" },
		"Square HRM Support": { en: "Square HRM Support", vi: "Hỗ trợ Square HRM" },
		"Reset Desktop Layout": { en: "Reset Desktop Layout", vi: "Đặt lại bố cục" },
		"Desktop": { en: "Desktop", vi: "Màn hình chính" },
		"Workspaces": { en: "Workspaces", vi: "Không gian làm việc" },
		"Website": { en: "Website", vi: "Website" },
		"Edit Sidebar": { en: "Edit Sidebar", vi: "Sửa thanh bên" },
		"Session Defaults": { en: "Session Defaults", vi: "Mặc định phiên" },
		"Reload": { en: "Reload", vi: "Tải lại" },
		"Toggle Full Width": { en: "Toggle Full Width", vi: "Đổi chế độ toàn chiều rộng" },
		"Help": { en: "Help", vi: "Trợ giúp" },
		"Notification": { en: "Notification", vi: "Thông báo" },
		"Notifications": { en: "Notifications", vi: "Thông báo" },
		"Dashboard": { en: "Dashboard", vi: "Bảng điều khiển" },
		"Settings": { en: "Settings", vi: "Cài đặt" },
		"Setup": { en: "Setup", vi: "Thiết lập" },
		"Expenses": { en: "Expenses", vi: "Chi phí" },
		"Expense Claims": { en: "Expense Claims", vi: "Yêu cầu thanh toán chi phí" },
		"Expense Claim": { en: "Expense Claim", vi: "Yêu cầu thanh toán chi phí" },
		"Expense Claim Type": { en: "Expense Claim Type", vi: "Loại yêu cầu chi phí" },
		"Employee Advance": { en: "Employee Advance", vi: "Tạm ứng nhân viên" },
		"Travel": { en: "Travel", vi: "Công tác" },
		"Purpose of Travel": { en: "Purpose of Travel", vi: "Mục đích công tác" },
		"Travel Request": { en: "Travel Request", vi: "Yêu cầu công tác" },
		"Vehicle Log": { en: "Vehicle Log", vi: "Nhật ký xe" },
		"Accounting Entries": { en: "Accounting Entries", vi: "Bút toán kế toán" },
		"Reports": { en: "Reports", vi: "Báo cáo" },
		"Masters & Reports": { en: "Masters & Reports", vi: "Danh mục & Báo cáo" },
		"Masters and Reports": { en: "Masters and Reports", vi: "Danh mục & Báo cáo" },
		"Claims": { en: "Claims", vi: "Yêu cầu" },
		"Advances": { en: "Advances", vi: "Tạm ứng" },
		"Accounting Reports": { en: "Accounting Reports", vi: "Báo cáo kế toán" },
		"Fleet Management": { en: "Fleet Management", vi: "Quản lý đội xe" },
		"Payment Entry": { en: "Payment Entry", vi: "Phiếu thanh toán" },
		"Journal Entry": { en: "Journal Entry", vi: "Bút toán nhật ký" },
		"Additional Salary": { en: "Additional Salary", vi: "Lương bổ sung" },
		"Employee Advance Summary": { en: "Employee Advance Summary", vi: "Tổng hợp tạm ứng nhân viên" },
		"Unpaid Expense Claim": { en: "Unpaid Expense Claim", vi: "Yêu cầu chi phí chưa thanh toán" },
		"Vehicle Expenses": { en: "Vehicle Expenses", vi: "Chi phí xe" },
		"Accounts Receivable": { en: "Accounts Receivable", vi: "Phải thu" },
		"Accounts Payable": { en: "Accounts Payable", vi: "Phải trả" },
		"General Ledger": { en: "General Ledger", vi: "Sổ cái" },
		"Vehicle": { en: "Vehicle", vi: "Xe" },
		"Driver": { en: "Driver", vi: "Tài xế" },
		"Vehicle Service Item": { en: "Vehicle Service Item", vi: "Hạng mục dịch vụ xe" },
		"Last synced just now": { en: "Last synced just now", vi: "Vừa đồng bộ" },
		"Last Year": { en: "Last Year", vi: "Năm trước" },
		"Monthly": { en: "Monthly", vi: "Hàng tháng" },
		"Filter": { en: "Filter", vi: "Bộ lọc" },
		"New": { en: "New", vi: "Tạo mới" },
		"Save": { en: "Save", vi: "Lưu" },
		"Submit": { en: "Submit", vi: "Gửi duyệt" },
		"Cancel": { en: "Cancel", vi: "Hủy" },
		"Delete": { en: "Delete", vi: "Xóa" },
		"Duplicate": { en: "Duplicate", vi: "Nhân bản" },
		"Print": { en: "Print", vi: "In" },
		"Email": { en: "Email", vi: "Email" },
		"Export": { en: "Export", vi: "Xuất dữ liệu" },
		"Import": { en: "Import", vi: "Nhập dữ liệu" },
		"Refresh": { en: "Refresh", vi: "Làm mới" },
		"Upload": { en: "Upload", vi: "Tải lên" },
		"Download": { en: "Download", vi: "Tải xuống" },
		"Sort": { en: "Sort", vi: "Sắp xếp" },
		"List": { en: "List", vi: "Danh sách" },
		"Report": { en: "Report", vi: "Báo cáo" },
		"Calendar": { en: "Calendar", vi: "Lịch" },
		"Kanban": { en: "Kanban", vi: "Kanban" },
		"Gantt": { en: "Gantt", vi: "Gantt" },
		"Assign": { en: "Assign", vi: "Giao việc" },
		"Share": { en: "Share", vi: "Chia sẻ" },
		"Tags": { en: "Tags", vi: "Thẻ" },
		"Comments": { en: "Comments", vi: "Bình luận" },
		"Activity": { en: "Activity", vi: "Hoạt động" },
		"Timeline": { en: "Timeline", vi: "Dòng thời gian" },
		"Details": { en: "Details", vi: "Chi tiết" },
		"Created": { en: "Created", vi: "Đã tạo" },
		"Modified": { en: "Modified", vi: "Đã sửa" },
		"Owner": { en: "Owner", vi: "Người sở hữu" },
		"Status": { en: "Status", vi: "Trạng thái" },
		"Open": { en: "Open", vi: "Mở" },
		"Closed": { en: "Closed", vi: "Đã đóng" },
		"Draft": { en: "Draft", vi: "Nháp" },
		"Submitted": { en: "Submitted", vi: "Đã gửi duyệt" },
		"Cancelled": { en: "Cancelled", vi: "Đã hủy" },
		"Approved": { en: "Approved", vi: "Đã duyệt" },
		"Rejected": { en: "Rejected", vi: "Từ chối" },
		"Pending": { en: "Pending", vi: "Đang chờ" },
		"Active": { en: "Active", vi: "Đang hoạt động" },
		"Disabled": { en: "Disabled", vi: "Đã tắt" },
		"Enabled": { en: "Enabled", vi: "Đã bật" },
		"Employee": { en: "Employee", vi: "Nhân viên" },
		"Employees": { en: "Employees", vi: "Nhân viên" },
		"Company": { en: "Company", vi: "Công ty" },
		"Department": { en: "Department", vi: "Phòng ban" },
		"Designation": { en: "Designation", vi: "Chức danh" },
		"Branch": { en: "Branch", vi: "Chi nhánh" },
		"Leave": { en: "Leave", vi: "Nghỉ phép" },
		"Leaves": { en: "Leaves", vi: "Nghỉ phép" },
		"Attendance": { en: "Attendance", vi: "Chấm công" },
		"Payroll": { en: "Payroll", vi: "Bảng lương" },
		"Recruitment": { en: "Recruitment", vi: "Tuyển dụng" },
		"Performance": { en: "Performance", vi: "Hiệu suất" },
		"Shift & Attendance": { en: "Shift & Attendance", vi: "Ca làm & Chấm công" },
		"HR Setup": { en: "HR Setup", vi: "Thiết lập nhân sự" },
		"Salary Slip": { en: "Salary Slip", vi: "Phiếu lương" },
		"Salary Structure": { en: "Salary Structure", vi: "Cơ cấu lương" },
		"Leave Application": { en: "Leave Application", vi: "Đơn nghỉ phép" },
		"Attendance Request": { en: "Attendance Request", vi: "Yêu cầu chấm công" },
		"Shift Assignment": { en: "Shift Assignment", vi: "Phân ca" },
		"Job Opening": { en: "Job Opening", vi: "Vị trí tuyển dụng" },
		"Job Applicant": { en: "Job Applicant", vi: "Ứng viên" },
		"Interview": { en: "Interview", vi: "Phỏng vấn" },
	};
	Object.assign(translations, hrmTranslations);
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
	for (const [key, labels] of Object.entries(translations)) {
		for (const label of Object.values(labels || {})) {
			if (label) translationAliases[label] = key;
		}
	}
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
		patchFrappeMessages();
		if (shouldReload) {
			syncUserLanguage(normalizedLanguage).finally(() => {
				const url = new URL(window.location.href);
				url.searchParams.set("_lang", normalizedLanguage);
				window.location.assign(url.toString());
			});
		} else {
			syncUserLanguage(normalizedLanguage);
		}
		return normalizedLanguage;
	}

	function syncUserLanguage(language) {
		const user = window.frappe?.session?.user || window.frappe?.boot?.user?.name || "";
		if (!window.frappe?.xcall || !user || user === "Guest") {
			return Promise.resolve();
		}
		return window.frappe
			.xcall("square_hrm_branding.api.set_user_language", { language })
			.catch(() => {});
	}

	function patchFrappeMessages() {
		if (!window.frappe) return;
		const language = getCurrentLanguage();
		const messages = {};
		for (const [key, labels] of Object.entries(translations)) {
			const translated = labels?.[language];
			if (translated) messages[key] = translated;
		}
		window.frappe._messages = {
			...(window.frappe._messages || {}),
			...messages,
		};
		if (window.frappe.boot) {
			window.frappe.boot.lang = language;
			window.frappe.boot.__messages = {
				...(window.frappe.boot.__messages || {}),
				...messages,
			};
		}
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

	function normalizeDeskHeader() {
		for (const element of document.querySelectorAll(".square-hrm-desk-actions, .square-hrm-user-avatar")) {
			element.remove();
		}
		if (!isDeskShell()) return;
		const desktopNavbar = document.querySelector("header.desktop-navbar");
		if (!desktopNavbar) return;
		desktopNavbar.classList.add("square-hrm-desktop-navbar");
		const actionGroup = desktopNavbar.querySelector(".desktop-notifications")?.parentElement;
		actionGroup?.classList.add("square-hrm-desktop-native-actions");
		setAttributeIfChanged(desktopNavbar.querySelector("#brand-logo"), "alt", BRAND_NAME);
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

	function getCanonicalMenuTitle(title) {
		const text = String(title || "").replace(/\s+/g, " ").trim();
		return resolveTranslationKey(text) || text;
	}

	function getVisibleDeskMenu() {
		const menus = [...document.querySelectorAll(".frappe-menu.context-menu")];
		return menus.find((menu) => {
			const style = getComputedStyle(menu);
			if (style.display === "none" || style.visibility === "hidden" || !menu.getClientRects().length) return false;
			const titles = [...menu.querySelectorAll(".menu-item-title")].map((title) => getCanonicalMenuTitle(title.textContent));
			const isSidebarMenu = titles.includes("Reload") && titles.includes("Toggle Theme");
			const isAvatarMenu = titles.includes("Toggle Theme") && (
				titles.includes("Edit Profile")
				|| titles.includes("Reset Desktop Layout")
				|| titles.includes("About")
			);
			return isSidebarMenu || isAvatarMenu;
		});
	}

	function getMenuItemByTitle(menu, label) {
		return [...menu.querySelectorAll(".dropdown-menu-item")].find((item) => {
			return getCanonicalMenuTitle(item.querySelector(".menu-item-title")?.textContent) === label;
		});
	}

	function renderDeskMenuLanguageSwitcher() {
		if (!isDeskShell()) return;
		const menu = getVisibleDeskMenu();
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

	let observer;
	let patching = false;
	let scheduled = false;

	function apply() {
		if (!document.body || patching) return;
		patching = true;
		observer?.disconnect();
		try {
			patchLanguage();
			patchFrappeMessages();
			walkText(document.body);
			patchI18nText(document.body);
			patchAttributes(document.body);
			patchI18nAttributes(document.body);
			patchImages(document.body);
			patchFavicons();
			patchTitle();
			renderLanguageSwitcher();
			renderDeskMenuLanguageSwitcher();
			normalizeDeskHeader();
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

	patchLanguage();
	patchFrappeMessages();
	window.SquareHRMBranding = { apply, setPreferredLanguage, getCurrentLanguage };
	document.addEventListener("DOMContentLoaded", apply);
	window.addEventListener("load", apply);

	observer = new MutationObserver(scheduleApply);
	observer.observe(document.documentElement, { childList: true, subtree: true });
})();
