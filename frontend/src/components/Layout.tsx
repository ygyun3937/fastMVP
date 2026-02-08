import { ReactNode } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { notificationApi } from '../services/api';
import '../styles/Layout.css';

interface LayoutProps {
  children: ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const location = useLocation();
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    loadUnreadCount();
    const interval = setInterval(loadUnreadCount, 30000); // 30초마다 갱신
    return () => clearInterval(interval);
  }, []);

  const loadUnreadCount = async () => {
    try {
      const response = await notificationApi.getUnreadCount();
      setUnreadCount(response.data);
    } catch (error) {
      console.error('알림 카운트 로드 실패:', error);
    }
  };

  const isActive = (path: string) => location.pathname === path;

  return (
    <div className="layout">
      <header className="header">
        <div className="header-content">
          <h1 className="logo">재고 관리 시스템</h1>
          <nav className="header-nav">
            <Link to="/notifications" className="notification-link">
              <span className="notification-icon">🔔</span>
              {unreadCount > 0 && (
                <span className="notification-badge">{unreadCount}</span>
              )}
            </Link>
          </nav>
        </div>
      </header>

      <div className="main-container">
        <aside className="sidebar">
          <nav className="sidebar-nav">
            <Link
              to="/"
              className={`nav-item ${isActive('/') ? 'active' : ''}`}
            >
              📊 대시보드
            </Link>
            <Link
              to="/inventory"
              className={`nav-item ${isActive('/inventory') ? 'active' : ''}`}
            >
              📦 재고 관리
            </Link>
            <Link
              to="/projects"
              className={`nav-item ${isActive('/projects') ? 'active' : ''}`}
            >
              📋 프로젝트 관리
            </Link>
            <Link
              to="/transactions"
              className={`nav-item ${isActive('/transactions') ? 'active' : ''}`}
            >
              📝 입출고 관리
            </Link>
            <Link
              to="/reports"
              className={`nav-item ${isActive('/reports') ? 'active' : ''}`}
            >
              📈 보고서
            </Link>
          </nav>
        </aside>

        <main className="content">
          {children}
        </main>
      </div>
    </div>
  );
}
