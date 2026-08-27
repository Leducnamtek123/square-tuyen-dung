const queryStringMock = {
  stringify: (params) => {
    if (!params) return '';
    const sp = new URLSearchParams();
    for (const [k, v] of Object.entries(params)) {
      if (v !== undefined && v !== null) {
        if (Array.isArray(v)) {
          v.forEach((val) => sp.append(k, String(val)));
        } else {
          sp.append(k, String(v));
        }
      }
    }
    return sp.toString();
  },
  parse: (str) => {
    if (!str) return {};
    const sp = new URLSearchParams(str.startsWith('?') ? str.slice(1) : str);
    return Object.fromEntries(sp.entries());
  },
};

queryStringMock.default = queryStringMock;

module.exports = queryStringMock;
