# 源代码查看器功能

这个功能允许在每个课程页面上查看该页面的源代码。我们提供了多种方式来实现这个功能，您可以根据项目需求选择最适合的方法。

## 方法1：直接在组件中使用Hook

这是最简单的方法，只需在每个页面组件中添加几行代码：

```tsx
import { type FC } from 'react';
import { useCodeViewer } from '../hooks/useCodeViewer';

const Page: FC = () => {
  // 使用Hook添加源代码查看功能
  const CodeViewerComponent = useCodeViewer(import.meta.url);

  return (
    <>
      {/* 页面内容 */}
      <div>页面内容...</div>

      {/* 添加代码查看器 */}
      <CodeViewerComponent />
    </>
  );
};

export default Page;
```

## 方法2：使用高阶组件包装每个页面

如果不想修改每个页面的内部代码，可以使用高阶组件：

```tsx
import { type FC } from 'react';

const Page: FC = () => {
  return <div>页面内容...</div>;
};

// 使用addCodeViewer高阶组件包装页面组件
import { addCodeViewer } from '../components/withCodeViewer';
export default addCodeViewer(Page, import.meta.url);
```

## 方法3：批量处理所有页面

如果您有集中的路由配置，可以使用我们提供的工具函数批量处理所有页面：

```tsx
// 假设您有这样的页面配置
import Chapter1Page1 from './course/chapter1-basics/01-page';
import Chapter1Page2 from './course/chapter1-basics/02-page';
// ... 更多页面导入

const Pages = {
  'chapter1-basics/01-page': Chapter1Page1,
  'chapter1-basics/02-page': Chapter1Page2,
  // ... 更多页面
};

// 使用我们的工具函数添加源代码查看功能
import { addCodeViewerToAllPages } from './utils/addCodeViewerToAllPages';
const EnhancedPages = addCodeViewerToAllPages(Pages);

// 然后在路由中使用EnhancedPages
```

## 自定义代码查看器样式

您可以通过修改`CodeViewer.tsx`组件来自定义代码查看器的样式和行为。目前的实现包括：

1. 固定在页面右下角的按钮，用于切换代码查看器
2. 右侧滑出的面板，显示代码
3. 使用语法高亮显示代码

## 获取源代码的原理

我们使用Vite的`import.meta.glob`功能在构建时导入所有源代码文件，这样就可以在运行时获取文件内容而不需要额外的API请求。

## 注意事项

1. 这个功能主要用于教学和学习目的，不建议在生产环境使用
2. 确保不要在源代码中包含敏感信息
3. 代码文件越多，构建包的体积越大
