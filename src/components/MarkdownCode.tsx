'use client'

import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';
import rehypeHighlight from 'rehype-highlight';
import { DetailedHTMLProps, HTMLAttributes } from 'react';
import 'highlight.js/styles/github-dark.css';

interface MarkdownCodeProps {
  content: string;
  className?: string;
}

type CodeProps = DetailedHTMLProps<HTMLAttributes<HTMLElement>, HTMLElement> & {
  inline?: boolean;
};

export default function MarkdownCode({ content, className }: MarkdownCodeProps) {
  return (
    <div className={`markdown-body ${className}`}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[rehypeRaw, rehypeHighlight]}
        components={{
          code: ({ inline, className, children, ...props }: CodeProps) => {
            const match = /language-(\w+)/.exec(className || '');
            return !inline && match ? (
              <div className="relative group">
                <div className="absolute right-2 top-2 opacity-0 group-hover:opacity-100 transition">
                  <button
                    className="bg-gray-700 text-white px-2 py-1 rounded text-sm hover:bg-gray-600"
                    onClick={() => {
                      navigator.clipboard.writeText(String(children).replace(/\n$/, ''));
                    }}
                  >
                    Copy
                  </button>
                </div>
                <pre className={`${className} p-4 rounded-lg !bg-gray-900`}>
                  <code className={`language-${match[1]}`} {...props}>
                    {children}
                  </code>
                </pre>
              </div>
            ) : (
              <code className={className} {...props}>
                {children}
              </code>
            );
          },
          pre({ children }) {
            return <>{children}</>;
          },
        }}
      >
        {content}
      </ReactMarkdown>

      <style jsx global>{`
        .markdown-body {
          color: #24292e;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Helvetica, Arial,
            sans-serif, 'Apple Color Emoji', 'Segoe UI Emoji';
          font-size: 16px;
          line-height: 1.5;
          word-wrap: break-word;
        }

        .markdown-body pre {
          margin-bottom: 1rem;
        }

        .markdown-body code {
          background-color: rgba(27, 31, 35, 0.05);
          border-radius: 3px;
          font-size: 85%;
          margin: 0;
          padding: 0.2em 0.4em;
        }

        .markdown-body pre > code {
          background-color: transparent;
          border: 0;
          font-size: 100%;
          margin: 0;
          padding: 0;
          white-space: pre;
          word-break: normal;
        }

        .markdown-body .highlight pre {
          background-color: #f6f8fa;
          border-radius: 3px;
          font-size: 85%;
          line-height: 1.45;
          overflow: auto;
          padding: 16px;
        }

        .markdown-body h1,
        .markdown-body h2,
        .markdown-body h3,
        .markdown-body h4,
        .markdown-body h5,
        .markdown-body h6 {
          margin-bottom: 1rem;
          margin-top: 1.5rem;
          font-weight: 600;
          line-height: 1.25;
        }

        .markdown-body h1 { font-size: 2em; }
        .markdown-body h2 { font-size: 1.5em; }
        .markdown-body h3 { font-size: 1.25em; }
        .markdown-body h4 { font-size: 1em; }
        .markdown-body h5 { font-size: 0.875em; }
        .markdown-body h6 { font-size: 0.85em; }

        .markdown-body p {
          margin-bottom: 1rem;
        }

        .markdown-body ul,
        .markdown-body ol {
          margin-bottom: 1rem;
          padding-left: 2em;
        }

        .markdown-body li {
          margin: 0.25em 0;
        }

        .markdown-body blockquote {
          border-left: 0.25em solid #dfe2e5;
          color: #6a737d;
          margin: 0 0 1rem;
          padding: 0 1em;
        }

        .markdown-body table {
          border-collapse: collapse;
          margin-bottom: 1rem;
          width: 100%;
        }

        .markdown-body table th,
        .markdown-body table td {
          border: 1px solid #dfe2e5;
          padding: 6px 13px;
        }

        .markdown-body table tr {
          background-color: #fff;
          border-top: 1px solid #c6cbd1;
        }

        .markdown-body table tr:nth-child(2n) {
          background-color: #f6f8fa;
        }
      `}</style>
    </div>
  );
}
