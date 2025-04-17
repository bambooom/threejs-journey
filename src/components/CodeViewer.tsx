import { type FC, useState } from 'react';
import SyntaxHighlighter from 'react-syntax-highlighter';
import { docco } from 'react-syntax-highlighter/dist/esm/styles/hljs';
import './codeviewer.css';

interface CodeViewerProps {
  sourceCode: string;
  fileName: string;
}

const CodeViewer: FC<CodeViewerProps> = ({ sourceCode, fileName }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="code-viewer">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="code-viewer-toggle"
      >
        {isOpen ? 'Close Source Code' : 'Check Source Code'}
      </button>

      {isOpen && (
        <div className="code-viewer-panel">
          <div className="code-viewer-header">
            <h3>{fileName}</h3>
            <button
              className="code-viewer-close"
              onClick={() => setIsOpen(false)}
              title="Close Source Code"
            >
              ×
            </button>
          </div>
          <SyntaxHighlighter
            language="typescript"
            style={docco}
            showLineNumbers
            wrapLongLines
          >
            {sourceCode}
          </SyntaxHighlighter>
        </div>
      )}
    </div>
  );
};

export default CodeViewer;
