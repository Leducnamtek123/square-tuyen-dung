import { readFileSync } from 'fs';
import { join } from 'path';

describe('InterviewCompletedView & Shadcn Component Integration', () => {
  const completedViewFile = join(
    __dirname,
    '../components/InterviewCompletedView.tsx'
  );
  const reviewSectionFile = join(
    __dirname,
    '../components/InterviewQuestionReviewSection.tsx'
  );
  const competencyCardFile = join(
    __dirname,
    '../components/CompetencyOverviewCard.tsx'
  );
  const buttonUiFile = join(
    __dirname,
    '../../../../src/components/ui/button.tsx'
  );

  it('verifies that InterviewCompletedView imports shadcn Button from @/components/ui/button', () => {
    const content = readFileSync(completedViewFile, 'utf8');
    expect(content).toContain("import { Button } from '@/components/ui/button'");
    expect(content).not.toContain("Button,");
    expect(content).not.toContain("import Button from '@mui/material/Button'");
  });

  it('verifies that raw custom <button className="..." tags in navigation were replaced with shadcn Button', () => {
    const content = readFileSync(completedViewFile, 'utf8');
    // Top back button
    expect(content).toContain('<Button');
    expect(content).toContain('variant="ghost"');
    expect(content).toContain('<span>{isMock ? \'Kết quả luyện tập AI\' : \'Kết quả phỏng vấn\'}</span>');
    // Top share button
    expect(content).toContain('variant="outline"');
    expect(content).toContain('<span>Chia sẻ kết quả</span>');
    // Bottom bar buttons
    expect(content).toContain('<span>{isMock ? \'Lịch phỏng vấn\' : \'Về lịch phỏng vấn\'}</span>');
    expect(content).toContain('<span>{isMock ? \'Luyện tập phiên mới\' : \'Luyện phỏng vấn AI\'}</span>');
    expect(content).toContain('<span>{isMock ? \'Luyện lại phiên này\' : \'Luyện tập lại\'}</span>');
  });

  it('verifies that shadcn Button supports asChild with Slot from @radix-ui/react-slot', () => {
    const content = readFileSync(buttonUiFile, 'utf8');
    expect(content).toContain("import { Slot } from '@radix-ui/react-slot'");
    expect(content).toContain('asChild?: boolean');
    expect(content).toContain('const Comp = asChild ? Slot : \'button\'');
  });

  it('verifies that InterviewQuestionReviewSection imports and uses shadcn Button', () => {
    const content = readFileSync(reviewSectionFile, 'utf8');
    expect(content).toContain("import { Button } from '@/components/ui/button'");
    expect(content).toContain('<span>Thử lại câu này</span>');
  });

  it('ensures zero parentheses rule in Vietnamese text in all 3 components', () => {
    const completedContent = readFileSync(completedViewFile, 'utf8');
    const reviewContent = readFileSync(reviewSectionFile, 'utf8');
    const competencyContent = readFileSync(competencyCardFile, 'utf8');

    // Check STAR description has no parentheses
    expect(reviewContent).not.toContain('(STAR)');
    expect(reviewContent).toContain('STAR');

    // Check competency notice message has no parentheses
    expect(competencyContent).not.toContain('(${completedQuestionsCount}');
    expect(competencyContent).toContain('tiến độ ${completedQuestionsCount}/${totalQuestionsCount}');

    const files = [completedContent, reviewContent, competencyContent];
    for (const text of files) {
      // Find all string literals (single/double quoted or backticked) or JSX text containing Vietnamese characters
      const stringMatches = text.match(/['"`>][^'"`<]*[àáạảãâầấậẩẫăằắặẳẵèéẹẻẽêềếệểễìíịỉĩòóọỏõôồốộổỗơờớợởỡùúụủũưừứựửữỳýỵỷỹđ][^'"`<]*['"`<]/gi) || [];
      for (const str of stringMatches) {
        // Strip out ${...} interpolation
        const cleanStr = str.replace(/\$\{[^}]*\}/g, '');
        expect(cleanStr).not.toContain('(');
        expect(cleanStr).not.toContain(')');
      }
    }
  });
});
