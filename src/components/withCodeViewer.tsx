import { ComponentType } from 'react';
import CodeViewer from './CodeViewer';
import { getComponentCode, getFileNameFromPath } from '../services/codeService';

/**
 * 高阶组件：为页面添加源代码查看功能
 * @param Component 要包装的组件
 * @param filePath 组件源代码文件路径
 * @returns 增强后的组件
 */
export const withCodeViewer = <P extends object>(
  Component: ComponentType<P>,
  filePath: string
) => {
  // 获取文件名
  const fileName = getFileNameFromPath(filePath);

  // 获取源代码
  const sourceCode = getComponentCode(filePath);

  // 返回包装后的组件
  const WrappedComponent = (props: P) => {
    return (
      <>
        <Component {...props} />
        <CodeViewer sourceCode={sourceCode} fileName={fileName} />
      </>
    );
  };

  // 设置显示名称，便于调试
  WrappedComponent.displayName = `withCodeViewer(${Component.displayName || Component.name || 'Component'})`;

  return WrappedComponent;
};

/**
 * 为模块添加代码查看器的便捷方法
 *
 * 使用方式：
 * ```tsx
 * // 在页面组件中
 * const Page: FC = () => { ... }
 *
 * // 导出时包装组件
 * export default addCodeViewer(Page, import.meta.url);
 * ```
 *
 * @param Component 要添加代码查看器的组件
 * @param moduleUrl 当前模块的URL (使用 import.meta.url)
 * @returns 增强后的组件
 */
export const addCodeViewer = <P extends object>(
  Component: ComponentType<P>,
  moduleUrl: string
) => {
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

  // 使用高阶组件包装
  return withCodeViewer(Component, relativePath);
};
