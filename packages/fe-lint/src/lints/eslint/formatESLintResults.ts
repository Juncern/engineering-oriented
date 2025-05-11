import { ESLint } from 'eslint';
import { ScanResult } from '../../types';

/**
 * 格式化 ESLint 输出结果
 */
export function formatESLintResults(
  results: ESLint.LintResult[],
  quiet: boolean,
  eslint: ESLint,
): ScanResult[] {
  const rulesMeta = eslint.getRulesMetaForResults(results);

  return results
    .filter(({ warningCount, errorCount }) => errorCount || warningCount)
    .map(
      ({
        filePath,
        messages,
        errorCount,
        warningCount,
        fixableErrorCount,
        fixableWarningCount,
      }) => ({
        filePath,
        errorCount,
        warningCount: quiet ? 0 : warningCount,
        fixableWarningCount: quiet ? 0 : fixableWarningCount,
        fixableErrorCount,
        messages: messages
          .map(({ line = 0, column = 0, ruleId, message, fatal, severity }) => ({
            line,
            column,
            rule: ruleId,
            url: rulesMeta[ruleId]?.docs?.url || '',
            message: message.replace(/([^ ])\.$/, '$1'),
            errored: fatal || severity === 2,
          }))
          .filter(({ errored }) => (quiet ? errored : true)),
      }),
    );
}
