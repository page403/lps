import { useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';

function PageLayout({ children, title, showFab, onFabClick }) {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    let lastScrollY = window.scrollY;
    
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      setIsVisible(currentScrollY <= lastScrollY || currentScrollY < 10);
      lastScrollY = currentScrollY;
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="page-container">
      <div className="app-header">
        <h1>{title}</h1>
        <div className="header-actions">
          <button className="icon-button">
            <span>👤</span>
          </button>
        </div>
      </div>

      <div className="page-content">
        {children}
      </div>

      {showFab && (
        <button 
          className={`fab ${isVisible ? 'fab-visible' : 'fab-hidden'}`}
          onClick={onFabClick}
        >
          +
        </button>
      )}
    </div>
  );
}

export default PageLayout; 