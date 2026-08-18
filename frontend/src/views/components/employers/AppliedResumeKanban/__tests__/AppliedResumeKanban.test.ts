import { readFileSync } from 'fs';
import { join } from 'path';

describe('AppliedResumeKanban Component & Drag Drop Pipeline', () => {
  const filePath = join(__dirname, '../index.tsx');
  const source = readFileSync(filePath, 'utf8');

  it('integrates DragDropContext, Droppable, and Draggable for candidate pipeline management', () => {
    expect(source).toContain('DragDropContext');
    expect(source).toContain('Droppable');
    expect(source).toContain('Draggable');
  });

  it('validates state transitions with canTransitionApplicationStatus before updating', () => {
    expect(source).toContain('canTransitionApplicationStatus');
    expect(source).toContain('handleChangeApplicationStatus');
  });

  it('integrates AIAnalysisDrawer for analyzing candidate resume fit', () => {
    expect(source).toContain('AIAnalysisDrawer');
    expect(source).toContain('openDrawerId');
  });
});
