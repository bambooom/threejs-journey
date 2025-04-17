/**
 * 源代码服务 - 用于获取组件源代码
 */

// 使用Vite的import.meta.glob获取所有源代码文件
// 使用正确的参数格式
const codeFiles: Record<string, string> = import.meta.glob(
  '/src/course/**/*.tsx',
  {
    query: '?raw',
    import: 'default',
    eager: true,
  }
);

/**
 * 获取组件源代码
 * @param filePath 组件文件路径，相对于项目根目录(以/src开头)
 * @returns 源代码字符串
 */
export const getComponentCode = (filePath: string): string => {
  // 确保路径以/src开头
  const fullPath = filePath.startsWith('/src') ? filePath : `/src${filePath}`;

  // 从导入的文件中查找匹配路径
  if (codeFiles[fullPath]) {
    return codeFiles[fullPath];
  }

  console.error(`找不到源代码文件: ${fullPath}`);
  return `// 无法加载源代码 ${filePath}\n// 错误: 文件不存在`;
};

/**
 * 从组件路径中提取文件名
 * @param path 组件路径
 * @returns 文件名
 */
export const getFileNameFromPath = (path: string): string => {
  return path.split('/').pop() || path;
};

/**
 * 获取当前模块的文件路径
 * 注意：在Vite中，import.meta.url包含了当前模块的URL
 * @returns 当前模块的文件路径(相对于src目录)
 */
export const getCurrentModulePath = (): string => {
  // 从URL中提取文件路径
  const url = import.meta.url;
  const pathMatch = url.match(/\/src\/(.+?)$/);

  if (pathMatch && pathMatch[1]) {
    // 返回相对于src的路径
    return `/${pathMatch[1]}`;
  }

  console.error('无法确定当前模块路径', url);
  return '未知路径';
};
