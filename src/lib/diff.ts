export interface DiffLine {
  type: 'added' | 'removed' | 'unchanged';
  value: string;
}

/**
 * Computes a line-by-line diff using a classic dynamic programming Longest Common Subsequence (LCS) algorithm.
 */
export function computeLineDiff(oldText: string, newText: string): DiffLine[] {
  const oldLines = oldText.split('\n');
  const newLines = newText.split('\n');

  const m = oldLines.length;
  const n = newLines.length;

  // dp[i][j] stores the length of LCS of oldLines[0..i-1] and newLines[0..j-1]
  const dp: number[][] = Array(m + 1)
    .fill(null)
    .map(() => Array(n + 1).fill(0));

  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      if (oldLines[i - 1] === newLines[j - 1]) {
        dp[i][j] = dp[i - 1][j - 1] + 1;
      } else {
        dp[i][j] = Math.max(dp[i - 1][j], dp[i][j - 1]);
      }
    }
  }

  // Backtrack to build the diff list in reverse order
  const diff: DiffLine[] = [];
  let i = m;
  let j = n;

  while (i > 0 || j > 0) {
    if (i > 0 && j > 0 && oldLines[i - 1] === newLines[j - 1]) {
      diff.push({ type: 'unchanged', value: oldLines[i - 1] });
      i--;
      j--;
    } else if (j > 0 && (i === 0 || dp[i][j - 1] >= dp[i - 1][j])) {
      diff.push({ type: 'added', value: newLines[j - 1] });
      j--;
    } else if (i > 0 && (j === 0 || dp[i][j - 1] < dp[i - 1][j])) {
      diff.push({ type: 'removed', value: oldLines[i - 1] });
      i--;
    }
  }

  return diff.reverse();
}
