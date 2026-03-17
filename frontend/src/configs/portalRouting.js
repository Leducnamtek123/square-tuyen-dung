const normalizeLanguage = (language) => {
  const code = (language || "vi").split("-")[0].split("_")[0].toLowerCase();
  return code === "en" ? "en" : "vi";
};

const isPrefixMatch = (pathname, prefix) => {
  if (!prefix) return false;
  return pathname === prefix || pathname.startsWith(`${prefix}/`);
};

const stripPrefix = (pathname, prefix) => {
  if (!isPrefixMatch(pathname, prefix)) {
    return pathname;
  }

  const stripped = pathname.slice(prefix.length);
  if (!stripped.length) return "/";
  return stripped.startsWith("/") ? stripped : `/${stripped}`;
};

const EMPLOYER_PREFIXES = ["/employee", "/employer", "/nha-tuyen-dung"];
const ADMIN_PREFIXES = ["/admin", "/quan-tri"];

export const getPreferredLanguage = () => {
  const i18nLanguage =
    typeof window !== "undefined" ? window.localStorage?.getItem("i18nextLng") : null;
  return normalizeLanguage(i18nLanguage || "vi");
};

export const getPortalPrefix = (portal, language) => {
  const normalizedLanguage = normalizeLanguage(language);
  if (portal === "admin") {
    return normalizedLanguage === "en" ? "/admin" : "/quan-tri";
  }
  if (portal === "employer") {
    return normalizedLanguage === "en" ? "/employer" : "/nha-tuyen-dung";
  }
  return "";
};

export const detectPortalFromPath = (pathname = "/") => {
  if (ADMIN_PREFIXES.some((prefix) => isPrefixMatch(pathname, prefix))) {
    return "admin";
  }
  if (EMPLOYER_PREFIXES.some((prefix) => isPrefixMatch(pathname, prefix))) {
    return "employer";
  }
  return "jobseeker";
};

export const isAdminPortalPath = (pathname = "/") =>
  detectPortalFromPath(pathname) === "admin";

export const isEmployerPortalPath = (pathname = "/") =>
  detectPortalFromPath(pathname) === "employer";

export const stripPortalPrefix = (pathname = "/") => {
  const portal = detectPortalFromPath(pathname);
  if (portal === "admin") {
    for (const prefix of ADMIN_PREFIXES) {
      const stripped = stripPrefix(pathname, prefix);
      if (stripped !== pathname) return stripped;
    }
  }
  if (portal === "employer") {
    for (const prefix of EMPLOYER_PREFIXES) {
      const stripped = stripPrefix(pathname, prefix);
      if (stripped !== pathname) return stripped;
    }
  }
  return pathname || "/";
};

export const buildPortalPath = (portal, childPath = "/", language = "vi") => {
  const prefix = getPortalPrefix(portal, language);
  const normalizedChild = childPath && childPath !== "/" ? `/${childPath.replace(/^\/+/, "")}` : "/";

  if (!prefix) {
    return normalizedChild;
  }
  if (normalizedChild === "/") {
    return prefix;
  }
  return `${prefix}${normalizedChild}`;
};

export const normalizePortalPath = (pathname = "/", language = "vi") => {
  const portal = detectPortalFromPath(pathname);
  if (portal === "jobseeker") {
    return pathname || "/";
  }
  const childPath = stripPortalPrefix(pathname);
  return buildPortalPath(portal, childPath, language);
};
