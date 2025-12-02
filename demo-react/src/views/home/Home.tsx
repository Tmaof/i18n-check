import { useEffect, useState } from 'react';
import './Home.css';
import { t } from 'i18next';

interface HomeProps {
  onNavigate: (page: 'home' | 'about' | 'blog') => void;
}

const Home = ({ onNavigate }: HomeProps) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  const recentPosts = [
    {
      id: 1,
      title: 'React 18 新特性深度解析',
      date: '2024-01-15',
      excerpt: '探索 React 18 带来的并发特性、自动批处理等新功能...',
    },
    {
      id: 2,
      title: 'TypeScript 最佳实践指南',
      date: '2024-01-10',
      excerpt: '分享在大型项目中使用 TypeScript 的经验和技巧...',
    },
    {
      id: 3,
      title: '现代前端构建工具对比',
      date: '2024-01-05',
      excerpt: 'Vite、Webpack、Turbopack 等构建工具的详细对比...',
    },
  ];

  const skills = [
    { name: 'React', level: 90, color: '#61dafb' },
    { name: 'TypeScript', level: 85, color: '#3178c6' },
    { name: 'Node.js', level: 80, color: '#339933' },
    { name: 'Vue.js', level: 75, color: '#4fc08d' },
    { name: 'Python', level: 85, color: '#3776ab' },
  ];

  return (
    <div className={`home ${isVisible ? 'visible' : ''}`}>
      {/* Hero Section */}
      <section className="hero">
        <div className="hero-content">
          <div className="hero-text">
            <h1 className="hero-title">
              <span className="gradient-text">你好，我是</span>
              <br />
              <span className="hero-name">开发者</span>
            </h1>
            <p className="hero-subtitle">
              专注于前端开发，热爱技术分享
              <br />
              在这里记录我的学习与思考
            </p>
            <p className="hero-subtitle">{t('欢迎，{{name}}！', { name: '用户' })}</p>
            <div className="hero-buttons">
              <button
                className="btn btn-primary"
                onClick={() => onNavigate('about')}
              >
                了解更多
              </button>
              <button
                className="btn btn-secondary"
                onClick={() => onNavigate('blog')}
              >
                查看博客
              </button>
            </div>
          </div>
          <div className="hero-image">
            <div className="floating-card">
              <div className="code-snippet">
                <div className="code-line">
                  <span className="code-keyword">const</span>{' '}
                  <span className="code-variable">developer</span> = {'{'}
                </div>
                <div className="code-line indent">
                  <span className="code-property">name</span>:{' '}
                  <span className="code-string">'开发者'</span>,
                </div>
                <div className="code-line indent">
                  <span className="code-property">passion</span>:{' '}
                  <span className="code-string">'编程'</span>,
                </div>
                <div className="code-line indent">
                  <span className="code-property">skills</span>: [
                  <span className="code-string">'React'</span>,{' '}
                  <span className="code-string">'TypeScript'</span>]
                </div>
                <div className="code-line">{'}'}</div>
              </div>
            </div>
          </div>
        </div>
        <div className="scroll-indicator">
          <div className="mouse"></div>
        </div>
      </section>

      {/* Skills Section */}
      <section className="skills-section">
        <h2 className="section-title">技能树</h2>
        <div className="skills-grid">
          {skills.map((skill, index) => (
            <div
              key={skill.name}
              className="skill-card"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <div className="skill-header">
                <span className="skill-name">{skill.name}</span>
                <span className="skill-percent">{skill.level}%</span>
              </div>
              <div className="skill-bar">
                <div
                  className="skill-progress"
                  style={{
                    width: `${skill.level}%`,
                    backgroundColor: skill.color,
                  }}
                ></div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Recent Posts Section */}
      <section className="posts-section">
        <div className="section-header">
          <h2 className="section-title">最新文章</h2>
          <button className="view-all-btn" onClick={() => onNavigate('blog')}>
            查看全部 →
          </button>
        </div>
        <div className="posts-grid">
          {recentPosts.map((post) => (
            <article
              key={post.id}
              className="post-card"
              onClick={() => {
                onNavigate('blog');
                // 这里可以通过状态管理来打开对应文章
              }}
            >
              <div className="post-date">{post.date}</div>
              <h3 className="post-title">{post.title}</h3>
              <p className="post-excerpt">{post.excerpt}</p>
              <div className="post-footer">
                <span className="read-more">阅读更多 →</span>
              </div>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
};

export default Home;
