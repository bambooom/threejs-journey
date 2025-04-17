# 批量为所有页面添加源代码查看功能

本项目实现了一套完整的解决方案，可以为所有页面组件添加源代码查看功能，无需在每个页面中手动添加代码。

## 实现方式

我们通过以下几个关键组件实现了这一功能：

1. **CodeViewer 组件**：提供查看源代码的界面，包含显示/隐藏按钮和代码面板
2. **PageWithCodeViewer 布局**：一个布局组件，包装页面内容并添加代码查看器
3. **RouteWrapper 工具**：自动处理路由配置，为所有页面添加布局包装
4. **App.tsx 修改**：在应用入口处应用路由包装

## 使用方法

只需按照以下步骤操作，即可自动为所有页面添加源代码查看功能：

### 1. 确保已安装依赖

```bash
npm install react-syntax-highlighter @types/react-syntax-highlighter
```

### 2. 应用路由包装

在 App.tsx 中：

```tsx
import { Suspense, useMemo } from 'react';
import routes from '~react-pages';
import { useRoutes } from 'react-router-dom';
import './App.css';
import { enhanceRoutes } from './wrappers/RouteWrapper';

function App() {
  // 使用useMemo缓存增强后的路由，避免每次渲染都重新处理
  const enhancedRoutes = useMemo(() => enhanceRoutes(routes), [routes]);

  return (
    <Suspense fallback={<p>Loading...</p>}>
      {useRoutes(enhancedRoutes)}
    </Suspense>
  );
}

export default App;
```

## 工作原理

1. 在应用启动时，`enhanceRoutes` 函数处理所有定义的路由
2. 对于每个路由，将其对应的组件包装在 `PageWithCodeViewer` 布局中
3. 布局组件使用当前路由路径自动识别源文件位置
4. 通过 `codeService` 获取源代码并提供给 `CodeViewer` 组件显示

## 文件路径推断

系统会根据路由路径推断源文件位置，例如：

- 路由路径: `/chapter1-basics/03-first-threejs-project`
- 推断的源文件: `/course/chapter1-basics/03-first-threejs-project.tsx`

这样可以确保显示的源代码正确匹配当前页面。

## 自定义样式

可以通过编辑 `codeviewer.css` 文件自定义源代码查看器的样式。

## 注意事项

1. 此功能主要用于教学目的，建议只在开发环境中启用
2. 如果项目结构发生变化，可能需要调整文件路径推断逻辑
3. 为了减小包大小，可以考虑使用动态导入（React.lazy）延迟加载代码查看器
