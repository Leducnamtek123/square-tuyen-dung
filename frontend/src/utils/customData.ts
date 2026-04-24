const convertMoney = (n: number): string => {
  if (n >= 1000000000) {
    return `${Math.trunc(n / 1000000000)} tỷ`;
  }
  if (n >= 1000000) {
    return `${Math.trunc(n / 1000000)} tr`;
  }
  return `${Math.trunc(n)}`;
};

const salaryString = (
  salaryFrom?: number | null,
  salaryTo?: number | null
): string => {
  if (!salaryFrom && !salaryTo) return '---';
  return `${!salaryFrom ? '?' : convertMoney(salaryFrom)} - ${
    !salaryTo ? '?' : convertMoney(salaryTo)
  }`;
};

const toSlug = (str?: string): string => {
  if (!str) return '';
  let value = str.toLowerCase();
  value = value.replace(/(à|á|ạ|ả|ã|â|ầ|ấ|ậ|ẩ|ẫ|ă|ằ|ắ|ặ|ẳ|ẵ)/g, 'a');
  value = value.replace(/(è|é|ẹ|ẻ|ẽ|ê|ề|ế|ệ|ể|ễ)/g, 'e');
  value = value.replace(/(ì|í|ị|ỉ|ĩ)/g, 'i');
  value = value.replace(/(ò|ó|ọ|ỏ|õ|ô|ồ|ố|ộ|ổ|ỗ|ơ|ờ|ớ|ợ|ở|ỡ)/g, 'o');
  value = value.replace(/(ù|ú|ụ|ủ|ũ|ư|ừ|ứ|ự|ử|ữ)/g, 'u');
  value = value.replace(/(ỳ|ý|ỵ|ỷ|ỹ)/g, 'y');
  value = value.replace(/(đ)/g, 'd');
  value = value.replace(/([^0-9a-z-\s])/g, '');
  value = value.replace(/(\s+)/g, '-');
  value = value.replace(/^-+/g, '');
  value = value.replace(/-+$/g, '');
  return value;
};

export default toSlug;

export { convertMoney, salaryString };
