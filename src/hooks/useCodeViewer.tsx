// import { useState } from 'react';
import CodeViewer from '../components/CodeViewer';
import { getComponentCode, getFileNameFromPath } from '../services/codeService';

/**
 * 自定义Hook：在组件中添加源代码查看功能
 *
 * 使用方式：
 * ```tsx
 * const Page: FC = () => {
 *   // 使用Hook，传入当前文件的URL
 *   const CodeViewerComponent = useCodeViewer(import.meta.url);
 *
 *   return (
 *     <>
 *       <div>页面内容...</div>
 *       <CodeViewerComponent />
 *     </>
 *   );
 * }
 * ```
 *
 * @param moduleUrl 当前模块的URL (使用 import.meta.url)
 * @returns 一个组件，用于显示源代码
 */
export const useCodeViewer = (moduleUrl: string) => {
  // 从URL中提取文件路径
  const pathMatch = moduleUrl.match(/\/src\/(.+?)$/);
  let relativePath = '';

  if (pathMatch && pathMatch[1]) {
    // 返回相对于src的路径
    relativePath = `/${pathMatch[1]}`;
  } else {
    console.error('无法确定模块路径', moduleUrl);
    relativePath = '未知路径';
  }

  // 获取文件名
  const fileName = getFileNameFromPath(relativePath);

  // 获取源代码
  const sourceCode = getComponentCode(relativePath);

  // 返回代码查看器组件
  return () => <CodeViewer sourceCode={sourceCode} fileName={fileName} />;
};
