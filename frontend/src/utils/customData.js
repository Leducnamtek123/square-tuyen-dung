const convertMoney = n => {
  if (n >= 1000000000) {
    return `${Math.trunc(n / 1000000000)} tỉ`;
  } else if (n >= 1000000) {
    return `${Math.trunc(n / 1000000)} tr`;
  } else {
    return `${Math.trunc(n)}`;
  }
};

const salaryString = (salaryFrom, salaryTo) => {
  if (!salaryFrom && !salaryTo) return '---';
  else
    return `${!salaryFrom ? '?' : convertMoney(salaryFrom)} - ${
      !salaryTo ? '?' : convertMoney(salaryTo)
    }`;
};

const toSlug = (str) => {
  if (!str) return '';
  str = str.toLowerCase();
  str = str.replace(/(à|á|ạ|ả|ã|â|ầ|ấ|ậ|ẩ|ẫ|ă|ằ|ắ|ặ|ẳ|ẵ)/g, 'a');
  str = str.replace(/(è|é|ẹ|ẻ|ẽ|ê|ề|ế|ệ|ể|ễ)/g, 'e');
  str = str.replace(/(ì|í|ị|ỉ|ĩ)/g, 'i');
  str = str.replace(/(ò|ó|ọ|ỏ|õ|ô|ồ|ố|ộ|ổ|ỗ|ơ|ờ|ớ|ợ|ở|ỡ)/g, 'o');
  str = str.replace(/(ù|ú|ụ|ủ|ũ|ư|ừ|ứ|ự|ử|ữ)/g, 'u');
  str = str.replace(/(ỳ|ý|ỵ|ỷ|ỹ)/g, 'y');
  str = str.replace(/(đ)/g, 'd');
  str = str.replace(/([^0-9a-z-\s])/g, '');
  str = str.replace(/(\s+)/g, '-');
  str = str.replace(/^-+/g, '');
  str = str.replace(/-+$/g, '');
  return str;
};

export default toSlug;

export {
  convertMoney,
  salaryString,
  toSlug,
};
