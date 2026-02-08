import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import InventoryPage from './pages/InventoryPage';
import ProjectsPage from './pages/ProjectsPage';
import ProjectDetailPage from './pages/ProjectDetailPage';
import './styles/App.css';

function App() {
  return (
    <BrowserRouter>
      <Layout>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/inventory" element={<InventoryPage />} />
          <Route path="/projects" element={<ProjectsPage />} />
          <Route path="/projects/:id" element={<ProjectDetailPage />} />
          <Route path="/transactions" element={<div className="page-header"><h1 className="page-title">입출고 관리</h1><p className="page-description">구현 예정</p></div>} />
          <Route path="/reports" element={<div className="page-header"><h1 className="page-title">보고서</h1><p className="page-description">구현 예정</p></div>} />
          <Route path="/notifications" element={<div className="page-header"><h1 className="page-title">알림</h1><p className="page-description">구현 예정</p></div>} />
        </Routes>
      </Layout>
    </BrowserRouter>
  );
}

export default App;
