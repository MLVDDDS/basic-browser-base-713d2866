export interface DiffLine {
  type: 'add' | 'remove' | 'context';
  content: string;
  lineNumber: number;
  oldLineNumber?: number;
}

export interface FileDiff {
  path: string;
  status: 'added' | 'modified' | 'deleted';
  hunks: DiffLine[][];
  additions: number;
  deletions: number;
}

// Simple diff algorithm to generate line-by-line comparison.
function generateDiffLines(before: string, after: string): DiffLine[][] {
  const beforeLines = before.split('\n');
  const afterLines = after.split('\n');
  const hunks: DiffLine[][] = [];
  let currentHunk: DiffLine[] = [];

  // Simple LCS-like diff for small files.
  const maxLines = Math.max(beforeLines.length, afterLines.length);
  let oldLine = 1;
  let newLine = 1;

  for (let i = 0; i < maxLines; i++) {
    const oldContent = beforeLines[i] ?? null;
    const newContent = afterLines[i] ?? null;

    if (oldContent === newContent) {
      if (currentHunk.length > 0 || (i > 0 && i < maxLines - 1)) {
        currentHunk.push({
          type: 'context',
          content: oldContent || '',
          lineNumber: newLine,
          oldLineNumber: oldLine,
        });
      }
      oldLine++;
      newLine++;
    } else {
      if (oldContent !== null && !afterLines.includes(oldContent)) {
        currentHunk.push({
          type: 'remove',
          content: oldContent,
          lineNumber: newLine,
          oldLineNumber: oldLine,
        });
        oldLine++;
      }
      if (newContent !== null && !beforeLines.includes(newContent)) {
        currentHunk.push({
          type: 'add',
          content: newContent,
          lineNumber: newLine,
        });
        newLine++;
      }
    }

    if (currentHunk.length > 20) {
      hunks.push(currentHunk);
      currentHunk = [];
    }
  }

  if (currentHunk.length > 0) {
    hunks.push(currentHunk);
  }

  return hunks.length > 0 ? hunks : [[{ type: 'context', content: '(no changes)', lineNumber: 1 }]];
}

export function createFileDiff(
  path: string,
  before: string | null,
  after: string | null
): FileDiff {
  const status = before === null ? 'added' : after === null ? 'deleted' : 'modified';
  const hunks = generateDiffLines(before || '', after || '');

  let additions = 0;
  let deletions = 0;
  hunks.forEach((hunk) => {
    hunk.forEach((line) => {
      if (line.type === 'add') additions++;
      if (line.type === 'remove') deletions++;
    });
  });

  return { path, status, hunks, additions, deletions };
}
