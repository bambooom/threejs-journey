import React, { ReactNode } from 'react';
import { useLocation } from 'react-router-dom';
import CodeViewer from '../components/CodeViewer';
import { getComponentCode, getFileNameFromPath } from '../services/codeService';

interface PageWithCodeViewerProps {
  children: ReactNode;
}

/**
 * 页面布局组件，为所有页面添加源代码查看功能
 * 基于当前路由路径自动查找对应的源代码文件
 * 首页('/'路径)不显示源代码按钮
 *
 * @param props 组件属性，包含子元素
 * @returns 包含源代码查看器的布局组件
 */
const PageWithCodeViewer: React.FC<PageWithCodeViewerProps> = ({ children }) => {
  const location = useLocation();

  // 如果是首页，不显示源代码按钮
  if (location.pathname === '/') {
    return <>{children}</>;
  }

  // 从当前路径推断源代码文件路径
  // 例如，'/chapter1-basics/03-first-threejs-project' -> '/course/chapter1-basics/03-first-threejs-project.tsx'
  const filePath = `/course${location.pathname}.tsx`;

  // 获取源代码和文件名
  const sourceCode = getComponentCode(filePath);
  const fileName = getFileNameFromPath(filePath);

  return (
    <>
      {children}
      <CodeViewer sourceCode={sourceCode} fileName={fileName} />
    </>
  );
};

export default PageWithCodeViewer;
