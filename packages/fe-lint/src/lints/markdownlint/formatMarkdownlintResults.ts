import markdownlint from 'markdownlint';
import type { ScanResult } from '../../types';

/**
 * 格式化 markdownlint 输出结果
 */
export function formatMarkdownlintResults(
  results: markdownlint.LintResults,
  quiet: boolean,
): ScanResult[] {
  const parsedResults: ScanResult[] = [];

  for (const file in results) {
    if (!Object.prototype.hasOwnProperty.call(results, file) || quiet) {
      continue;
    }
    let warningCount = 0;
    let fixableWarningCount = 0;
    const message = results[file].map(
      ({ lineNumber, ruleNames, ruleDescription, ruleInformation, errorRange, fixInfo }) => {
        if (fixInfo) {
          fixableWarningCount++;
        }
        warningCount++;
        return {
          line: lineNumber,
          column: Array.isArray(errorRange) ? errorRange[0] : 1,
          rule: ruleNames[0],
          url: ruleInformation,
          message: ruleDescription,
          errored: false,
        };
      },
    );
    parsedResults.push({
      filePath: file,
      messages: message,
      errorCount: 0,
      warningCount,
      fixableWarningCount,
      fixableErrorCount: 0,
    })
  }

  return parsedResults;
}
