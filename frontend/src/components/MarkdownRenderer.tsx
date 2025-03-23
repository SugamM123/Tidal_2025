import React from 'react';
import ReactMarkdown from 'react-markdown';
import DesmosStudio from './DesmosStudio';

interface MarkdownRendererProps {
  content: string;
  className?: string;
}

const MarkdownRenderer: React.FC<MarkdownRendererProps> = ({ content, className = '' }) => {
  // Check if content might contain math expressions that need a graph
  const mightNeedGraph = /\\\(.*\\\)|\\\[.*\\\]|`.*`|\$.*\$|\\int|\\sum|\\prod|\\lim|\\frac|y\s*=|f\(x\)|g\(x\)/i.test(content);
  
  // Extract potential LaTeX expression from the content
  const extractLatexExpression = (content: string): string | null => {
    // Try to find math expressions in various formats
    const mathPatterns = [
      /\\\((.*?)\\\)/,      // \( ... \)
      /\\\[(.*?)\\\]/,      // \[ ... \]
      /\$(.*?)\$/,          // $ ... $
      /`(.*?)`/,            // ` ... `
      /y\s*=\s*([^,.\n]+)/, // y = ...
      /f\(x\)\s*=\s*([^,.\n]+)/, // f(x) = ...
    ];
    
    for (const pattern of mathPatterns) {
      const match = content.match(pattern);
      if (match && match[1]) {
        return match[1].trim();
      }
    }
    
    return null;
  };
  
  const latexExpression = mightNeedGraph ? extractLatexExpression(content) : null;

  return (
    <div className={`markdown-renderer ${className}`}>
      <div className="prose prose-invert max-w-none">
        <ReactMarkdown
          components={{
            // Style headings
            h1: ({ node, ...props }) => <h1 className="text-2xl font-bold my-4" {...props} />,
            h2: ({ node, ...props }) => <h2 className="text-xl font-bold my-3" {...props} />,
            h3: ({ node, ...props }) => <h3 className="text-lg font-bold my-2" {...props} />,
            
            // Style paragraphs
            p: ({ node, ...props }) => <p className="my-2" {...props} />,
            
            // Style lists
            ul: ({ node, ...props }) => <ul className="list-disc pl-5 my-2" {...props} />,
            ol: ({ node, ...props }) => <ol className="list-decimal pl-5 my-2" {...props} />,
            li: ({ node, ...props }) => <li className="my-1" {...props} />,
            
            // Style code blocks and inline code
            code: ({ node, inline, className, children, ...props }) => {
              const match = /language-(\w+)/.exec(className || '');
              if (!inline) {
                return (
                  <pre className="bg-gray-800 rounded p-2 overflow-x-auto my-2">
                    <code className={match ? `language-${match[1]}` : ''} {...props}>
                      {children}
                    </code>
                  </pre>
                );
              }
              return (
                <code className="bg-gray-800 px-1 py-0.5 rounded text-sm" {...props}>
                  {children}
                </code>
              );
            },
            
            // Style blockquotes
            blockquote: ({ node, ...props }) => (
              <blockquote className="pl-4 border-l-4 border-gray-500 italic my-2" {...props} />
            ),
            
            // Style links
            a: ({ node, ...props }) => (
              <a className="text-blue-400 hover:underline" target="_blank" rel="noopener noreferrer" {...props} />
            ),
            
            // Style images
            img: ({ node, ...props }) => (
              <img className="max-w-full h-auto rounded my-2" {...props} alt={props.alt || 'Image'} />
            ),
          }}
        >
          {content}
        </ReactMarkdown>
      </div>
      
      {/* {latexExpression && (
        <div className="mt-4 mb-2">
          <DesmosStudio initialExpression={latexExpression} height="300px" />
        </div>
      )} */}
    </div>
  );
};

export default MarkdownRenderer; 