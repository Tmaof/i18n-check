import { getPackageDependencies } from './pkg';

/**
 * 生成外部依赖
 * @param pkgPath package.json 文件路径
 * @param full 是否是 full 打包
 * @returns
 */
export const generateExternal = (pkgPath: string, full = false) => {
  const { dependencies, peerDependencies } = getPackageDependencies(pkgPath);
  const packages: string[] = [...peerDependencies];

  if (!full) {
    packages.push(...dependencies);
  }

  return (id: string) => {
    return packages.some((pkg) => id === pkg || id.startsWith(`${pkg}/`));
  };
};
