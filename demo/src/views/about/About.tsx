import { useEffect, useState } from 'react';
import './About.css';

const About = () => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  const experiences = [
    {
      year: '2024',
      title: '高级前端工程师',
      company: '科技公司',
      description:
        '负责核心产品的前端架构设计和开发，带领团队完成多个重要项目。',
    },
    {
      year: '2022',
      title: '前端工程师',
      company: '互联网公司',
      description:
        '参与多个 Web 应用的开发，积累了丰富的 React 和 Vue 项目经验。',
    },
    {
      year: '2020',
      title: '初级前端工程师',
      company: '创业公司',
      description: '开始前端开发之旅，学习并实践各种前端技术栈。',
    },
  ];

  const interests = [
    { icon: '💻', title: '编程', desc: '热爱写代码，享受解决问题的过程' },
    { icon: '📚', title: '阅读', desc: '喜欢阅读技术书籍和文章' },
    { icon: '🎮', title: '游戏', desc: '偶尔玩玩游戏放松心情' },
    { icon: '☕', title: '咖啡', desc: '咖啡爱好者，喜欢尝试不同口味' },
  ];

  return (
    <div className={`about ${isVisible ? 'visible' : ''}`}>
      <section className="about-hero">
        <div className="about-content">
          <div className="about-image">
            <div className="avatar-container">
              <div className="avatar">👨‍💻</div>
            </div>
          </div>
          <div className="about-text">
            <h1 className="about-title">关于我</h1>
            <p className="about-description">
              我是一名充满热情的前端开发者，专注于构建美观且高性能的 Web 应用。
              我喜欢学习新技术，分享知识，并与团队协作解决复杂问题。
            </p>
            <p className="about-description">
              在我的职业生涯中，我积累了丰富的 React、TypeScript、Node.js
              等技术的实践经验。
              我相信代码不仅是实现功能的工具，更是表达创意和解决问题的方式。
            </p>
          </div>
        </div>
      </section>

      <section className="experience-section">
        <h2 className="section-title">工作经历</h2>
        <div className="timeline">
          {experiences.map((exp, index) => (
            <div key={index} className="timeline-item">
              <div className="timeline-marker"></div>
              <div className="timeline-content">
                <div className="timeline-year">{exp.year}</div>
                <h3 className="timeline-title">{exp.title}</h3>
                <div className="timeline-company">{exp.company}</div>
                <p className="timeline-description">{exp.description}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="interests-section">
        <h2 className="section-title">兴趣爱好</h2>
        <div className="interests-grid">
          {interests.map((interest, index) => (
            <div
              key={interest.title}
              className="interest-card"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <div className="interest-icon">{interest.icon}</div>
              <h3 className="interest-title">{interest.title}</h3>
              <p className="interest-desc">{interest.desc}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="contact-section">
        <h2 className="section-title">联系我</h2>
        <div className="contact-content">
          <p>
            如果你对我的工作感兴趣，或者想要交流技术，欢迎通过以下方式联系我：
          </p>
          <div className="contact-methods">
            <a href="mailto:your.email@example.com" className="contact-link">
              📧 Email
            </a>
            <a
              href="https://github.com"
              target="_blank"
              rel="noopener noreferrer"
              className="contact-link"
            >
              💻 GitHub
            </a>
            <a
              href="https://twitter.com"
              target="_blank"
              rel="noopener noreferrer"
              className="contact-link"
            >
              🐦 Twitter
            </a>
          </div>
        </div>
      </section>
    </div>
  );
};

export default About;
