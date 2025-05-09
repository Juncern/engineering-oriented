import { LintResult } from 'stylelint';
import { ScanResult } from '../../types';
import { getStylelintRuleDocUrl } from './getStylelintDocUrl';

export function formatStylelintResults(results: LintResult[], quiet: boolean): ScanResult[] {
  return results.map(({ source, warnings }) => {
    let errorCount = 0;
    let warningCount = 0;
    const messages = warnings
      .filter((item) => !quiet || item.severity === 'error')
      .map((warning) => {
        const { line = 0, column = 0, rule, text, severity } = warning;
        if (severity === 'error') {
          errorCount++;
        } else {
          warningCount++;
        }
        return {
          line,
          column,
          rule,
          url: getStylelintRuleDocUrl(rule),
          message: text.replace(/([^ ])\.$/, '$1').replace(new RegExp(`\\(${rule}\\)`), ''),
          errored: severity === 'error',
        };
      });

    return {
      filePath: source,
      messages,
      errorCount,
      warningCount,
      fixableErrorCount: 0,
      fixableWarningCount: 0,
    };
  });
}
