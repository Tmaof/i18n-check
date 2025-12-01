import { useEffect, useState } from 'react';
import './Blog.css';

interface BlogProps {
  onPostClick: (id: number) => void;
}

interface Post {
  id: number;
  title: string;
  date: string;
  category: string;
  excerpt: string;
  readTime: number;
  tags: string[];
}

const Blog = ({ onPostClick }: BlogProps) => {
  const [isVisible, setIsVisible] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>('全部');

  useEffect(() => {
    setIsVisible(true);
  }, []);

  const posts: Post[] = [
    {
      id: 1,
      title: 'React 18 新特性深度解析',
      date: '2024-01-15',
      category: '前端',
      excerpt:
        'React 18 带来了许多令人兴奋的新特性，包括并发渲染、自动批处理、Suspense 改进等。本文将深入探讨这些新特性的实现原理和使用场景。',
      readTime: 8,
      tags: ['React', 'JavaScript', '前端'],
    },
    {
      id: 2,
      title: 'TypeScript 最佳实践指南',
      date: '2024-01-10',
      category: '前端',
      excerpt:
        '在大型项目中使用 TypeScript 时，如何编写类型安全的代码？本文将分享一些实用的技巧和最佳实践，帮助你更好地利用 TypeScript 的类型系统。',
      readTime: 12,
      tags: ['TypeScript', '编程', '最佳实践'],
    },
    {
      id: 3,
      title: '现代前端构建工具对比',
      date: '2024-01-05',
      category: '工具',
      excerpt:
        'Vite、Webpack、Turbopack、esbuild... 前端构建工具层出不穷。本文将从性能、配置复杂度、生态等多个维度对比这些工具，帮助你选择最适合的工具。',
      readTime: 10,
      tags: ['构建工具', 'Vite', 'Webpack'],
    },
    {
      id: 4,
      title: 'CSS 新特性：Container Queries 详解',
      date: '2023-12-28',
      category: '前端',
      excerpt:
        'Container Queries 是 CSS 的一个革命性特性，它允许我们基于容器的尺寸而不是视口来应用样式。本文将详细介绍其用法和实际应用场景。',
      readTime: 6,
      tags: ['CSS', '响应式设计', '前端'],
    },
    {
      id: 5,
      title: 'Node.js 性能优化实战',
      date: '2023-12-20',
      category: '后端',
      excerpt:
        '如何优化 Node.js 应用的性能？本文将分享一些实用的优化技巧，包括异步处理、内存管理、集群模式等。',
      readTime: 15,
      tags: ['Node.js', '性能优化', '后端'],
    },
    {
      id: 6,
      title: 'Git 工作流最佳实践',
      date: '2023-12-15',
      category: '工具',
      excerpt:
        '良好的 Git 工作流可以提高团队协作效率。本文将介绍 Git Flow、GitHub Flow 等常见工作流，并分享一些实用的 Git 技巧。',
      readTime: 9,
      tags: ['Git', '版本控制', '协作'],
    },
  ];

  const categories = ['全部', '前端', '后端', '工具'];

  const filteredPosts =
    selectedCategory === '全部'
      ? posts
      : posts.filter((post) => post.category === selectedCategory);

  return (
    <div className={`blog ${isVisible ? 'visible' : ''}`}>
      <section className="blog-header">
        <h1 className="blog-title">博客文章</h1>
        <p className="blog-subtitle">分享技术见解、学习心得和项目经验</p>
      </section>

      <section className="blog-filters">
        <div className="category-tabs">
          {categories.map((category) => (
            <button
              key={category}
              className={`category-tab ${selectedCategory === category ? 'active' : ''}`}
              onClick={() => setSelectedCategory(category)}
            >
              {category}
            </button>
          ))}
        </div>
      </section>

      <section className="blog-posts">
        <div className="posts-list">
          {filteredPosts.map((post, index) => (
            <article
              key={post.id}
              className="blog-post-card"
              style={{ animationDelay: `${index * 0.1}s` }}
              onClick={() => onPostClick(post.id)}
            >
              <div className="post-meta">
                <span className="post-category">{post.category}</span>
                <span className="post-date">{post.date}</span>
                <span className="post-read-time">📖 {post.readTime} 分钟</span>
              </div>
              <h2 className="post-title">{post.title}</h2>
              <p className="post-excerpt">{post.excerpt}</p>
              <div className="post-tags">
                {post.tags.map((tag) => (
                  <span key={tag} className="post-tag">
                    {tag}
                  </span>
                ))}
              </div>
              <div className="post-footer">
                <span className="read-more">阅读全文 →</span>
              </div>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
};

export default Blog;
