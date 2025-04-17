import { RouteObject } from 'react-router-dom';
import PageWithCodeViewer from '../layouts/PageWithCodeViewer';

/**
 * 包装路由，为所有页面添加源代码查看功能
 * 使用PageWithCodeViewer布局组件
 *
 * @param routes 原始路由配置
 * @returns 增强后的路由配置
 */
export function wrapRoutes(routes: RouteObject[]): RouteObject[] {
  return routes.map(route => {
    // 处理嵌套路由
    if (route.children) {
      route.children = wrapRoutes(route.children);
    }

    // 如果路由有元素（页面组件），则使用布局组件包装
    if (route.element) {
      const originalElement = route.element;

      // 创建包装组件
      route.element = <PageWithCodeViewer>{originalElement}</PageWithCodeViewer>;
    }

    return route;
  });
}

/**
 * 增强整个路由配置，为所有页面添加源代码查看功能
 *
 * @param routes 原始路由配置对象
 * @returns 增强后的路由配置
 */
export function enhanceRoutes(routes: RouteObject[]): RouteObject[] {
  // console.log('添加源代码查看器到所有路由...');
  return wrapRoutes(routes);
}
