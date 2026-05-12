const FALLBACK_LANGUAGE = "en";
const LANGUAGE_STORAGE_KEY = "square_hrm_language";
const LANGUAGE_COOKIE = "preferred_language";
const SUPPORTED_LANGUAGES = new Set(["en", "vi"]);

export const squareLanguageOptions = [
	{ code: "en", label: "English", shortLabel: "EN" },
	{ code: "vi", label: "Tiếng Việt", shortLabel: "VI" },
];

const fallbackMessages = {
	en: {},
	vi: {
		"Square HRM": "Square HRM",
		"Login to Square HRM": "Đăng nhập Square HRM",
		"Email": "Email",
		"Password": "Mật khẩu",
		"Login": "Đăng nhập",
		"or": "hoặc",
		"Login with {0}": "Đăng nhập bằng {0}",
		"No login methods are available. Please contact your administrator.": "Không có phương thức đăng nhập khả dụng. Vui lòng liên hệ quản trị viên.",
		"Reset Password": "Đặt lại mật khẩu",
		"Your password has expired. Please reset your password to continue": "Mật khẩu đã hết hạn. Vui lòng đặt lại mật khẩu để tiếp tục",
		"Go to Reset Password page": "Đi đến trang đặt lại mật khẩu",
		"OTP Verification": "Xác minh OTP",
		"OTP Code": "Mã OTP",
		"Verify": "Xác minh",
		"Home": "Trang chủ",
		"Attendance": "Chấm công",
		"Leaves": "Nghỉ phép",
		"Expenses": "Chi phí",
		"Salary": "Lương",
		"Settings": "Cài đặt",
		"Profile": "Hồ sơ",
		"Notifications": "Thông báo",
		"Log Out": "Đăng xuất",
		"Hey, {0} 👋": "Xin chào, {0} 👋",
		"Last {0} was at {1}": "Lần {0} gần nhất lúc {1}",
		"Confirm {0}": "Xác nhận {0}",
		"Check In": "Chấm công vào",
		"Check Out": "Chấm công ra",
		"Check-in": "Chấm công vào",
		"Check-out": "Chấm công ra",
		"IN": "Vào",
		"OUT": "Ra",
		"Latitude: {0}°": "Vĩ độ: {0}°",
		"Longitude: {0}°": "Kinh độ: {0}°",
		"Geolocation is not supported by your current browser": "Trình duyệt hiện tại không hỗ trợ định vị",
		"Locating...": "Đang định vị...",
		"Success": "Thành công",
		"Error": "Lỗi",
		"{0} successful!": "{0} thành công!",
		"{0} failed!": "{0} thất bại!",
		"Quick Links": "Liên kết nhanh",
		"Request Attendance": "Yêu cầu chấm công",
		"Request a Shift": "Yêu cầu ca làm",
		"Request Leave": "Yêu cầu nghỉ phép",
		"Claim an Expense": "Yêu cầu chi phí",
		"Request an Advance": "Yêu cầu tạm ứng",
		"View Salary Slips": "Xem phiếu lương",
		"My Requests": "Yêu cầu của tôi",
		"Team Requests": "Yêu cầu nhóm",
		"Attendance Calendar": "Lịch chấm công",
		"Recent Attendance Requests": "Yêu cầu chấm công gần đây",
		"Upcoming Shifts": "Ca làm sắp tới",
		"Recent Shift Requests": "Yêu cầu ca làm gần đây",
		"You have no upcoming shifts": "Bạn chưa có ca làm sắp tới",
		"Attendance Request History": "Lịch sử yêu cầu chấm công",
		"Employee Checkin History": "Lịch sử chấm công nhân viên",
		"Shift Assignment History": "Lịch sử phân ca",
		"Expense Claims": "Yêu cầu chi phí",
		"Recent Expenses": "Chi phí gần đây",
		"Employee Advance Balance": "Số dư tạm ứng nhân viên",
		"View List": "Xem danh sách",
		"Employee Advances": "Tạm ứng nhân viên",
		"Salary Slips": "Phiếu lương",
		"Year To Date": "Từ đầu năm đến nay",
		"Payroll Period": "Kỳ lương",
		"Select Payroll Period": "Chọn kỳ lương",
		"No salary slips found": "Không tìm thấy phiếu lương",
		"Present": "Có mặt",
		"Half Day": "Nửa ngày",
		"Absent": "Vắng mặt",
		"On Leave": "Đang nghỉ phép",
		"Work From Home": "Làm việc tại nhà",
		"Sunday": "Chủ nhật",
		"Monday": "Thứ hai",
		"Tuesday": "Thứ ba",
		"Wednesday": "Thứ tư",
		"Thursday": "Thứ năm",
		"Friday": "Thứ sáu",
		"Saturday": "Thứ bảy",
		"Pending": "Đang chờ",
		"Approved": "Đã duyệt",
		"Rejected": "Từ chối",
		"Cancelled": "Đã hủy",
		"Draft": "Nháp",
		"Submitted": "Đã gửi",
		"Status": "Trạng thái",
		"Employee": "Nhân viên",
		"Department": "Phòng ban",
		"Shift": "Ca làm",
		"Shift Type": "Loại ca",
		"From Date": "Từ ngày",
		"To Date": "Đến ngày",
		"Start Date": "Ngày bắt đầu",
		"End Date": "Ngày kết thúc",
		"Posting Date": "Ngày ghi nhận",
		"Advance Amount": "Số tiền tạm ứng",
		"Paid Amount": "Số tiền đã trả",
		"Delete": "Xóa",
		"Cancel": "Hủy",
		"Close": "Đóng",
		"Confirm": "Xác nhận",
		"No": "Không",
		"Yes": "Có",
		"New": "Tạo mới",
		"Reload": "Tải lại",
		"Download PDF": "Tải PDF",
		"Menu": "Menu",
		"Uploading...": "Đang tải lên...",
		"Filters": "Bộ lọc",
		"Clear All": "Xóa tất cả",
		"Apply Filters": "Áp dụng bộ lọc",
		"Select {0}": "Chọn {0}",
		"Enter {0}": "Nhập {0}",
		"No {0} found": "Không tìm thấy {0}",
		"You have no requests": "Bạn chưa có yêu cầu",
		"You have no notifications": "Bạn chưa có thông báo",
		"Load more": "Tải thêm",
		"Mark all as read": "Đánh dấu tất cả là đã đọc",
		"{0} Unread": "{0} chưa đọc",
		"Install Square HRM": "Cài đặt Square HRM",
		"Get the app on your device for easy access & a better experience!": "Cài ứng dụng trên thiết bị để truy cập nhanh và trải nghiệm tốt hơn!",
		"Get the app on your iPhone for easy access & a better experience": "Cài ứng dụng trên iPhone để truy cập nhanh và trải nghiệm tốt hơn",
		"Install": "Cài đặt",
		"Enable Push Notifications": "Bật thông báo đẩy",
		"Disabling Push Notifications...": "Đang tắt thông báo đẩy...",
		"Enabling Push Notifications...": "Đang bật thông báo đẩy...",
		"Push notifications have been disabled on your site": "Thông báo đẩy đã bị tắt trên hệ thống",
		"Push notifications disabled": "Đã tắt thông báo đẩy",
		"Push Notification permission denied": "Quyền thông báo đẩy bị từ chối",
	},
};

function getSupportedLanguage(value) {
	const language = String(value || "").toLowerCase().replace("_", "-").split("-")[0];
	return SUPPORTED_LANGUAGES.has(language) ? language : "";
}

export function normalizeSquareLanguage(value) {
	return getSupportedLanguage(value) || FALLBACK_LANGUAGE;
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

export function getSquareLanguage() {
	return normalizeSquareLanguage(
		getQueryLanguage()
			|| getStoredLanguage()
			|| getCookie(LANGUAGE_COOKIE)
			|| window.frappe?.boot?.lang
			|| document.documentElement.lang
			|| navigator.language
	);
}

export function setSquareLanguage(language) {
	const normalizedLanguage = normalizeSquareLanguage(language);
	try {
		window.localStorage?.setItem(LANGUAGE_STORAGE_KEY, normalizedLanguage);
	} catch {
		// localStorage can be unavailable in restricted browser modes.
	}
	document.cookie = `${LANGUAGE_COOKIE}=${encodeURIComponent(normalizedLanguage)}; Path=/; Max-Age=31536000; SameSite=Lax`;
	document.documentElement.lang = normalizedLanguage;
	if (!window.frappe) window.frappe = {};
	if (!window.frappe.boot) window.frappe.boot = {};
	window.frappe.boot.lang = normalizedLanguage;
	return normalizedLanguage;
}

function makeTranslationFunction() {
	let messages = {};
	let currentLanguage = FALLBACK_LANGUAGE;
	return {
		translate,
		load: () => Promise.allSettled([
			setup(),
			// TODO: load dayjs locales
		]),
	}

	async function setup() {
		const bootLanguage = getSupportedLanguage(window.frappe?.boot?.lang);
		currentLanguage = setSquareLanguage(getSquareLanguage());
		const fallback = fallbackMessages[currentLanguage] || {};

		if (window.frappe?.boot?.__messages && bootLanguage === currentLanguage) {
			messages = {
				...fallback,
				...window.frappe.boot.__messages,
			};
			return;
		}

		const url = new URL("/api/method/frappe.translate.load_all_translations", location.origin);
		url.searchParams.append("lang", currentLanguage);
		url.searchParams.append("hash", window.frappe?.boot?.translations_hash || window._version_number || Math.random()); // for cache busting
		// url.searchParams.append("app", "hrms");

		try {
			const response = await fetch(url);
			messages = {
				...fallback,
				...(await response.json() || {}),
			}
		} catch (error) {
			console.error("Failed to fetch translations:", error)
			messages = fallback
		}
	}

	function translate(txt, replace, context = null) {
		if (!txt || typeof txt != "string") return txt;

		let translated_text = "";
		let key = txt;
		if (context) {
			translated_text = messages[`${key}:${context}`];
		}
		if (!translated_text) {
			translated_text = messages[key] || fallbackMessages[currentLanguage]?.[key] || txt;
		}
		if (replace && typeof replace === "object") {
			translated_text = format(translated_text, replace);
		}

		return translated_text;
	}

	function format(str, args) {
		if (str == undefined) return str;

		let unkeyed_index = 0;
		return str.replace(
			/\{(\w*)\}/g,
			(match, key) => {
				if (key === "") {
					key = unkeyed_index;
					unkeyed_index++;
				}
				if (key == +key) {
					return args[key] !== undefined ? args[key] : match;
				}
			}
		);
	}
}

const { translate, load } = makeTranslationFunction();

export const translationsPlugin = {
	async isReady() {
		await load();
	},
	install(/** @type {import('vue').App} */ app, options) {
		const __ = translate;
		// app.mixin({ methods: { __ } })
		app.config.globalProperties.__ = __;
		app.provide("$translate", __);
	},
}
