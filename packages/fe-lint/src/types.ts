import { ESLint } from "eslint";
import stylelint from "stylelint";
import markdownlint from "markdownlint";

export interface PKG {
  eslintConfig?: any;
  eslintIgnore?: string[];
  stylelint?: any;
  peerDependencies?: Record<string, string>;
  dependencies?: Record<string, string>;
  devDependencies?: Record<string, string>;

  [key: string]: any;
}

export interface Config {
  // 是否开启 ESLint
  enableESLint?: boolean;
  // 是否开启 Stylelint
  enableStylelint?: boolean;
  // 是否开启 Markdownlint
  enableMarkdownlint?: boolean;
  // 是否开启 Prettier
  enablePrettier?: boolean;
  // ESLint 配置项
  eslintOptions?: ESLint.Options;
  // Stylelint 配置项
  stylelintOptions?: stylelint.LinterOptions;
  // Markdownlint 配置项
  markdownlintOptions?: markdownlint.Options;
}

export interface InitOptions {
  cwd: string;
  // 是否检查并升级 fe-lint 版本
  checkVersionUpdate?: boolean;
  // 是否需要自动重写 lint 配置
  rewriteLintConfig?: boolean;
  // eslint 类型
  eslintType?: string;
  // 是否启用 ESLint
  enableESLint?: boolean;
  // 是否启用 Stylelint
  enableStylelint?: boolean;
  // 是否启用 Markdownlint
  enableMarkdownlint?: boolean;
  // 是否启用 Prettier
  enablePrettier?: boolean;
  // 是否禁用自动在初始化完成后安装依赖
  disableInstallDependencies?: boolean;
}
