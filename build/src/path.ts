import { dirname, resolve } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));

/** 项目根目录 */
export const projRoot = resolve(__dirname, '..', '..');

/** /build */
export const buildRoot = resolve(projRoot, 'build');

/** /i18n-check */
export const checkRoot = resolve(projRoot, 'i18n-check');
/** /i18n-check/package */
export const checkPackagePath = resolve(checkRoot, 'package.json');
/** /i18n-check/dist */
export const checkDistRoot = resolve(checkRoot, 'dist');
/** /i18n-check/dist/cjs */
export const checkDistCjsRoot = resolve(checkDistRoot, 'cjs');
/** /i18n-check/dist/es */
export const checkDistEsRoot = resolve(checkDistRoot, 'es');
/** /i18n-check/dist/types */
export const checkDistTypesRoot = resolve(checkDistRoot, 'types');
