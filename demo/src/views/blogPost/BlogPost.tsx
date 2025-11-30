import { useEffect, useState } from 'react';
import './BlogPost.css';

interface BlogPostProps {
  postId: number;
  onBack: () => void;
}

const BlogPost = ({ postId, onBack }: BlogPostProps) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  // 模拟文章内容
  const postContent: Record<
    number,
    { title: string; date: string; content: string[] }
  > = {
    1: {
      title: 'React 18 新特性深度解析',
      date: '2024-01-15',
      content: [
        'React 18 是 React 的一个重要版本更新，引入了许多令人兴奋的新特性。本文将深入探讨这些新特性的实现原理和使用场景。',
        '## 并发渲染 (Concurrent Rendering)',
        '并发渲染是 React 18 最重要的新特性之一。它允许 React 中断渲染工作，处理更高优先级的更新，然后再继续之前的工作。这使得应用能够保持响应性，即使在执行大量计算时也是如此。',
        '## 自动批处理 (Automatic Batching)',
        '在 React 18 之前，React 只会在事件处理器中批处理状态更新。现在，React 会在所有情况下自动批处理更新，包括 Promise、setTimeout 和原生事件处理器。',
        '## Suspense 改进',
        'React 18 对 Suspense 进行了重大改进，现在可以在服务器端渲染中使用，并且支持更多的使用场景。',
        '## 新的 Hooks',
        'React 18 引入了几个新的 Hooks，如 `useId`、`useTransition` 和 `useDeferredValue`，这些 Hooks 可以帮助我们更好地处理并发特性。',
      ],
    },
    2: {
      title: 'TypeScript 最佳实践指南',
      date: '2024-01-10',
      content: [
        'TypeScript 已经成为现代前端开发的标准工具。在大型项目中使用 TypeScript 时，如何编写类型安全的代码？本文将分享一些实用的技巧和最佳实践。',
        '## 使用严格的类型检查',
        '启用 TypeScript 的严格模式可以帮助我们发现更多的潜在问题。建议在 `tsconfig.json` 中启用所有严格检查选项。',
        '## 合理使用类型推断',
        'TypeScript 的类型推断非常强大，我们应该充分利用它。不要过度使用显式类型注解，让 TypeScript 为我们推断类型。',
        '## 使用联合类型和字面量类型',
        '联合类型和字面量类型可以帮助我们创建更精确的类型定义，提高代码的类型安全性。',
        '## 避免使用 any',
        '`any` 类型会破坏 TypeScript 的类型检查，应该尽量避免使用。如果确实需要，可以考虑使用 `unknown` 类型。',
      ],
    },
    3: {
      title: '现代前端构建工具对比',
      date: '2024-01-05',
      content: [
        '前端构建工具层出不穷，每个工具都有自己的特点和适用场景。本文将从多个维度对比这些工具。',
        '## Vite',
        'Vite 是一个快速的前端构建工具，它利用浏览器原生的 ES 模块和 esbuild 来实现快速的开发服务器启动。',
        '## Webpack',
        'Webpack 是最成熟的前端构建工具之一，拥有丰富的插件生态和强大的配置能力。',
        '## Turbopack',
        'Turbopack 是 Next.js 团队开发的新一代构建工具，使用 Rust 编写，性能非常出色。',
        '## 选择建议',
        '对于新项目，建议使用 Vite 或 Turbopack。对于已有的大型项目，Webpack 仍然是一个可靠的选择。',
      ],
    },
  };

  const post = postContent[postId] || {
    title: '文章未找到',
    date: '',
    content: ['这篇文章不存在。'],
  };

  return (
    <div className={`blog-post ${isVisible ? 'visible' : ''}`}>
      <button className="back-button" onClick={onBack}>
        ← 返回博客列表
      </button>

      <article className="post-article">
        <header className="post-header">
          <h1 className="post-title">{post.title}</h1>
          <div className="post-meta">
            <span className="post-date">📅 {post.date}</span>
            <span className="post-read-time">📖 约 8 分钟阅读</span>
          </div>
        </header>

        <div className="post-content">
          {post.content.map((paragraph, index) => {
            if (paragraph.startsWith('## ')) {
              return (
                <h2 key={index} className="content-heading">
                  {paragraph.replace('## ', '')}
                </h2>
              );
            }
            return (
              <p key={index} className="content-paragraph">
                {paragraph}
              </p>
            );
          })}
        </div>

        <footer className="post-footer">
          <div className="post-tags">
            <span className="tag">React</span>
            <span className="tag">前端</span>
            <span className="tag">技术</span>
          </div>
          <div className="post-actions">
            <button className="action-button">👍 点赞</button>
            <button className="action-button">💬 评论</button>
            <button className="action-button">🔗 分享</button>
          </div>
        </footer>
      </article>
    </div>
  );
};

export default BlogPost;
