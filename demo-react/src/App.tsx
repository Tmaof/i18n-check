import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import './App.css';
import About from './views/about/About.tsx';
import Blog from './views/blog/Blog.tsx';
import BlogPost from './views/blogPost/BlogPost.tsx';
import Home from './views/home/Home.tsx';

type Page = 'home' | 'about' | 'blog';

function App() {
  const [currentPage, setCurrentPage] = useState<Page>('home');
  const [selectedPost, setSelectedPost] = useState<number | null>(null);
  const [language, setLanguage] = useState('zh');
  const { t, i18n } = useTranslation();
  const navigate = (page: Page) => {
    setCurrentPage(page);
    setSelectedPost(null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handlePostClick = (id: number) => {
    setSelectedPost(id);
  };

  const handleBackToBlog = () => {
    setSelectedPost(null);
  };

  return (
    <div className="app">
      <nav className="navbar">
        <div className="nav-container">
          <div className="logo" onClick={() => navigate('home')}>
            <span className="logo-text">✨ My Blog</span>
          </div>
          <ul className="nav-menu">
            <li>
              <button
                className={currentPage === 'home' ? 'active' : ''}
                onClick={() => navigate('home')}
              >
                {t('首页')}
              </button>
            </li>
            <li>
              <button
                className={currentPage === 'about' ? 'active' : ''}
                onClick={() => navigate('about')}
              >
                {t('关于')}
              </button>
            </li>
            <li>
              <button
                className={currentPage === 'blog' ? 'active' : ''}
                onClick={() => navigate('blog')}
              >
                {t('博客')}
              </button>
            </li>
            <li>
              {language === 'zh' ? (
                <button
                  onClick={() => {
                    setLanguage('en');
                    i18n.changeLanguage('en');
                  }}
                >
                  切换英文
                </button>
              ) : (
                <button
                  onClick={() => {
                    setLanguage('zh');
                    i18n.changeLanguage('zh');
                  }}
                >
                  切换中文
                </button>
              )}
            </li>
          </ul>
        </div>
      </nav>

      <main className="main-content">
        {selectedPost !== null ? (
          <BlogPost postId={selectedPost} onBack={handleBackToBlog} />
        ) : (
          <>
            {currentPage === 'home' && <Home onNavigate={navigate} />}
            {currentPage === 'about' && <About />}
            {currentPage === 'blog' && <Blog onPostClick={handlePostClick} />}
          </>
        )}
      </main>

      <footer className="footer">
        <div className="footer-content">
          <p>© 2024 My Personal Blog. Made with ❤️ and React</p>
          <div className="social-links">
            <a
              href="https://github.com"
              target="_blank"
              rel="noopener noreferrer"
            >
              GitHub
            </a>
            <a
              href="https://twitter.com"
              target="_blank"
              rel="noopener noreferrer"
            >
              Twitter
            </a>
            <a
              href="https://linkedin.com"
              target="_blank"
              rel="noopener noreferrer"
            >
              LinkedIn
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;
