import type { ProjectManifest } from '@pnpm/types';

/**
 * 获取 package.json 文件内容
 * @param pkgPath package.json 文件路径
 * @returns
 */
export const getPackageManifest = (pkgPath: string) => {
  return require(pkgPath) as ProjectManifest;
};

/**
 * 获取 package.json 文件中的 dependencies 和 peerDependencies
 * @param pkgPath package.json 文件路径
 * @returns
 */
export const getPackageDependencies = (
  pkgPath: string,
): Record<'dependencies' | 'peerDependencies', string[]> => {
  const manifest = getPackageManifest(pkgPath);
  const { dependencies = {}, peerDependencies = {} } = manifest;

  return {
    dependencies: Object.keys(dependencies),
    peerDependencies: Object.keys(peerDependencies),
  };
};
