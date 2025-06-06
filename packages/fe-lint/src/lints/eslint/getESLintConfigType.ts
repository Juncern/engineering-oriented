import glob from "glob";
import { PKG } from "../../types";

export function getESLintConfigType(cwd: string, pkg: PKG): string {
  const tsFiles = glob.sync('./!(node_moudles)/**/*.{ts,tsx}', { cwd });
  const reactFiles = glob.sync('./!(node_moudles)/**/*.{jsx,js}', { cwd });
  const vueFiles = glob.sync('./!(node_moudles)/**/*.{vue}', { cwd });
  const dependencies = Object.keys(pkg.dependencies || {});
  const language = tsFiles.length > 0 ? 'typescript' : '';
  let dsl = '';

  if (reactFiles.length > 0 || dependencies.some((name) => /^react(-|$)/.test(name))) {
    dsl = 'react';
  } else if (vueFiles.length > 0 || dependencies.some((name) => /^vue(-|$)/.test(name))) {
    dsl = 'vue';
  } else if (dependencies.some((name) => /^rax(-|$)/.test(name))) {
    dsl = 'rax';
  }

  return `@juncern/eslint-config/${language}/${dsl}`.replace(/\/$/, '/index').replace(/^\//, '');
}