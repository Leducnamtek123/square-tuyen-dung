const VI_TO_EN_SEGMENT_MAP = {
  "dang-nhap": "login",
  "dang-ky": "register",
  "quen-mat-khau": "forgot-password",
  "cap-nhat-mat-khau": "reset-password",
  "viec-lam": "jobs",
  "cong-ty": "companies",
  "ve-chung-toi": "about-us",
  "viec-lam-theo-nganh-nghe": "jobs-by-career",
  "viec-lam-theo-tinh-thanh": "jobs-by-city",
  "viec-lam-theo-hinh-thuc-lam-viec": "jobs-by-type",
  "bang-dieu-khien": "dashboard",
  "ho-so": "profile",
  "ho-so-tung-buoc": "profile-step",
  "ho-so-dinh-kem": "attached-profile",
  "viec-lam-cua-toi": "my-jobs",
  "cong-ty-cua-toi": "my-companies",
  "phong-van-cua-toi": "my-interviews",
  "thong-bao": "notifications",
  "tai-khoan": "account",
  "ket-noi-voi-nha-tuyen-dung": "chat-with-employer",
  "lien-he": "contact",
  "cau-hoi-thuong-gap": "faq",
  "dieu-khoan-dich-vu": "terms-of-service",
  "chinh-sach-bao-mat": "privacy-policy",
  "gioi-thieu": "introduction",
  "dich-vu": "services",
  "bao-gia": "pricing",
  "ho-tro": "support",
  "blog-tuyen-dung": "employer-blog",
  "tin-tuyen-dung": "job-posts",
  "ho-so-ung-tuyen": "applied-profiles",
  "ho-so-da-luu": "saved-profiles",
  "danh-sach-ung-vien": "candidate-list",
  "chi-tiet-ung-vien": "candidate-detail",
  "nhan-su-va-vai-tro": "employees-and-roles",
  "cai-dat": "settings",
  "ket-noi-voi-ung-vien": "chat-with-candidates",
  "danh-sach-phong-van": "interview-list",
  "phong-van-ung-vien-truc-tiep": "candidate-live-interview",
  "phong-van-truc-tiep": "live-interview",
  "len-lich-phong-van": "schedule-interview",
  "chi-tiet-phong-van": "interview-detail",
  "ngan-hang-cau-hoi": "question-bank",
  "bo-cau-hoi": "question-groups",
  "xac-thuc-nha-tuyen-dung": "employer-verification",
  "quan-ly-nguoi-dung": "user-management",
  "quan-ly-tin-tuyen-dung": "job-management",
  "kho-cau-hoi": "question-repository",
  "quan-ly-bo-cau-hoi": "question-group-management",
  "quan-ly-phong-van": "interview-management",
  "cai-dat-he-thong": "system-settings",
  "quan-ly-nganh-nghe": "career-management",
  "quan-ly-tinh-thanh": "city-management",
  "quan-ly-quan-huyen": "district-management",
  "quan-ly-phuong-xa": "ward-management",
  "quan-ly-cong-ty": "company-management",
  "quan-ly-ho-so-ung-vien": "candidate-profile-management",
  "quan-ly-cv-resume": "resume-management",
  "nhat-ky-tin-tuyen-dung": "job-post-activity",
  "thong-bao-viec-lam": "job-notifications",
  "phong-van-cong-ty-truc-tiep": "company-live-interview",
  "phong-van": "interview",
  "room": "room",
};

const EN_TO_VI_SEGMENT_MAP = Object.entries(VI_TO_EN_SEGMENT_MAP).reduce(
  (acc, [vi, en]) => {
    acc[en] = vi;
    return acc;
  },
  {}
);

const normalizeLanguage = (language) => {
  const code = (language || "vi").split("-")[0].split("_")[0].toLowerCase();
  return code === "en" ? "en" : "vi";
};

const localizePathSegment = (segment, language) => {
  if (!segment || segment.startsWith(":") || segment === "*") {
    return segment;
  }

  const normalizedLanguage = normalizeLanguage(language);
  if (normalizedLanguage === "en") {
    return VI_TO_EN_SEGMENT_MAP[segment] || segment;
  }

  return EN_TO_VI_SEGMENT_MAP[segment] || segment;
};

const splitPathAndSuffix = (path = "") => {
  const queryIndex = path.indexOf("?");
  const hashIndex = path.indexOf("#");
  const hasQuery = queryIndex >= 0;
  const hasHash = hashIndex >= 0;

  if (!hasQuery && !hasHash) {
    return { pathname: path, suffix: "" };
  }

  let cutIndex = path.length;
  if (hasQuery) cutIndex = Math.min(cutIndex, queryIndex);
  if (hasHash) cutIndex = Math.min(cutIndex, hashIndex);

  return {
    pathname: path.slice(0, cutIndex),
    suffix: path.slice(cutIndex),
  };
};

export const localizeRoutePath = (path, language) => {
  if (typeof path !== "string" || !path.length) {
    return path;
  }

  const { pathname, suffix } = splitPathAndSuffix(path);
  const hasLeadingSlash = pathname.startsWith("/");

  const localizedPathname = pathname
    .split("/")
    .map((segment) => localizePathSegment(segment, language))
    .join("/");

  return `${hasLeadingSlash ? localizedPathname : localizedPathname.replace(/^\//, "")}${suffix}`;
};

export const getLocalizedRouteVariants = (path) => {
  if (typeof path !== "string" || !path.length || path === "*") {
    return [path];
  }

  const viPath = localizeRoutePath(path, "vi");
  const enPath = localizeRoutePath(path, "en");
  return [...new Set([viPath, enPath])];
};
