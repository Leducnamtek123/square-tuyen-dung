import { readFileSync } from 'fs';
import { join } from 'path';

const readSource = (relativePath: string) => readFileSync(join(__dirname, relativePath), 'utf8');

describe('employer public routes', () => {
  it('keeps public employer pages in the employer section whitelist', () => {
    const source = readSource('../EmployerSectionClient.tsx');

    expect(source).toContain("'/employer/contact'");
    expect(source).toContain("'/nha-tuyen-dung/lien-he'");
    expect(source).toContain("'/employer/faq'");
    expect(source).toContain("'/nha-tuyen-dung/cau-hoi-thuong-gap'");
    expect(source).toContain("'/employer/terms-of-service'");
    expect(source).toContain("'/nha-tuyen-dung/dieu-khoan-dich-vu'");
    expect(source).toContain("'/employer/privacy-policy'");
    expect(source).toContain("'/nha-tuyen-dung/chinh-sach-bao-mat'");
  });

  it('keeps public employer pages out of the employer portal detector in ClientAppRoot', () => {
    const source = readSource('../ClientAppRoot.tsx');

    expect(source).toContain("'/employer/contact'");
    expect(source).toContain("'/nha-tuyen-dung/lien-he'");
    expect(source).toContain("'/employer/faq'");
    expect(source).toContain("'/nha-tuyen-dung/cau-hoi-thuong-gap'");
    expect(source).toContain("'/employer/terms-of-service'");
    expect(source).toContain("'/nha-tuyen-dung/dieu-khoan-dich-vu'");
    expect(source).toContain("'/employer/privacy-policy'");
    expect(source).toContain("'/nha-tuyen-dung/chinh-sach-bao-mat'");
  });
});
