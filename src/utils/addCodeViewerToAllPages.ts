import { ComponentType } from 'react';
import { addCodeViewer } from '../components/withCodeViewer';

/**
 * 为课程的所有页面添加源代码查看功能
 * 这个函数接收一组页面组件并返回添加了源代码查看功能的新组件
 *
 * 使用方式：
 * ```ts
 * // 在routes配置中
 * import { Pages } from './pages';
 * import { addCodeViewerToAllPages } from './utils/addCodeViewerToAllPages';
 *
 * const EnhancedPages = addCodeViewerToAllPages(Pages);
 * ```
 *
 * @param pages 页面组件对象，键为路径，值为组件
 * @returns 增强后的页面组件对象
 */
export function addCodeViewerToAllPages<T extends Record<string, ComponentType<object>>>(
  pages: T
): Record<string, ComponentType<object>> {
  const enhancedPages: Record<string, ComponentType<object>> = {};

  // 获取当前模块URL的基础部分
  const baseUrl = import.meta.url.replace(/\/[^/]+$/, '');

  // 遍历所有页面组件
  Object.entries(pages).forEach(([path, Component]) => {
    // 模拟该组件所在的URL
    // 注意：这只是一个近似值，因为我们不知道每个组件的确切位置
    // 但这对于演示目的足够了
    const simulatedUrl = `${baseUrl}/../course/${path}.tsx`;

    // 包装组件添加源代码查看功能
    enhancedPages[path] = addCodeViewer(Component, simulatedUrl);
  });

  return enhancedPages as T;
}

/**
 * 替代方法：使用批量导入文件的方式添加代码查看器
 * 这个函数使用Vite的import.meta.glob函数来批量导入文件
 * 与上面的函数不同，这个函数不需要预先知道所有页面组件
 *
 * @returns 一个函数，将组件和其URL关联起来
 */
export function createCodeViewerAdder() {
  // 使用Vite的功能获取所有模块及其URL
  const modules = import.meta.glob('/src/course/**/*.tsx');

  /**
   * 为指定组件添加代码查看功能
   * @param Component 要增强的组件
   * @param componentName 组件的名称或标识符
   * @returns 增强后的组件
   */
  return function addCodeViewerToComponent<P extends object>(
    Component: ComponentType<P>,
    componentName: string
  ): ComponentType<P> {
    // 查找匹配的URL
    const matchingUrl = Object.keys(modules).find(url =>
      url.includes(`/${componentName}.tsx`) ||
      url.endsWith(`/${componentName}`)
    );

    if (matchingUrl) {
      return addCodeViewer(Component, matchingUrl) as ComponentType<P>;
    }

    // 如果找不到匹配的URL，返回原始组件
    console.warn(`找不到组件 ${componentName} 的源代码位置`);
    return Component;
  };
}
