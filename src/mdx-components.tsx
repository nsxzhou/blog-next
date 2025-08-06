import { MDXComponents } from 'mdx/types';
import { Image } from '@/components/ui/image';

// 定义 MDX 组件
export function useMDXComponents(components: MDXComponents): MDXComponents {
  return {
    // 使用自定义图片组件
    img: Image,
    // 可以添加更多自定义组件
    h1: ({ children }) => (
      <h1 className="text-3xl font-bold mb-4 mt-6 text-foreground">
        {children}
      </h1>
    ),
    h2: ({ children }) => (
      <h2 className="text-2xl font-semibold mb-3 mt-5 text-foreground">
        {children}
      </h2>
    ),
    h3: ({ children }) => (
      <h3 className="text-xl font-medium mb-2 mt-4 text-foreground">
        {children}
      </h3>
    ),
    p: ({ children }) => (
      <p className="mb-4 leading-relaxed text-foreground">
        {children}
      </p>
    ),
    blockquote: ({ children }) => (
      <blockquote className="border-l-4 border-primary pl-4 italic my-4 text-muted-foreground">
        {children}
      </blockquote>
    ),
    code: ({ children, className }) => (
      <code className={`${className} bg-muted px-1 py-0.5 rounded text-sm font-mono`}>
        {children}
      </code>
    ),
    pre: ({ children }) => (
      <pre className="bg-muted p-4 rounded-lg overflow-x-auto my-4">
        {children}
      </pre>
    ),
    ...components,
  };
}