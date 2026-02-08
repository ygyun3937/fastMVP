import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { projectApi } from '../services/api';
import type { Project } from '../types';
import { PROJECT_STATUS_LABELS } from '../types';

export default function ProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadProjects();
  }, []);

  const loadProjects = async () => {
    try {
      setLoading(true);
      const response = await projectApi.getAll();
      setProjects(response.data);
    } catch (error) {
      console.error('프로젝트 로드 실패:', error);
      alert('프로젝트 목록을 불러오는데 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('정말 삭제하시겠습니까?')) return;
    try {
      await projectApi.delete(id);
      alert('삭제되었습니다.');
      loadProjects();
    } catch (error) {
      console.error('삭제 실패:', error);
      alert('삭제에 실패했습니다.');
    }
  };

  if (loading) {
    return <div className="loading">로딩 중...</div>;
  }

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">프로젝트 관리</h1>
        <p className="page-description">수주된 프로젝트를 관리하고 재고 가용성을 확인하세요</p>
      </div>

      <div className="card">
        <div className="card-header">
          <h2 className="card-title">프로젝트 목록</h2>
          <button className="btn btn-primary" onClick={() => alert('프로젝트 등록 모달 (구현 예정)')}>
            + 프로젝트 등록
          </button>
        </div>

        {projects.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">📋</div>
            <p>등록된 프로젝트가 없습니다.</p>
          </div>
        ) : (
          <table className="table">
            <thead>
              <tr>
                <th>프로젝트코드</th>
                <th>프로젝트명</th>
                <th>고객사</th>
                <th>상태</th>
                <th>시작일</th>
                <th>종료일</th>
                <th>관리</th>
              </tr>
            </thead>
            <tbody>
              {projects.map((project) => (
                <tr key={project.id}>
                  <td>{project.projectCode}</td>
                  <td>
                    <Link to={`/projects/${project.id}`} style={{ color: '#1e40af', textDecoration: 'none', fontWeight: '500' }}>
                      {project.projectName}
                    </Link>
                  </td>
                  <td>{project.client || '-'}</td>
                  <td>
                    <span className={`badge ${
                      project.status === 'IN_PROGRESS' ? 'badge-info' :
                      project.status === 'COMPLETED' ? 'badge-success' :
                      project.status === 'CANCELLED' ? 'badge-danger' :
                      'badge-gray'
                    }`}>
                      {PROJECT_STATUS_LABELS[project.status]}
                    </span>
                  </td>
                  <td>{project.startDate || '-'}</td>
                  <td>{project.endDate || '-'}</td>
                  <td>
                    <Link
                      to={`/projects/${project.id}`}
                      className="btn btn-secondary"
                      style={{ marginRight: '0.5rem', padding: '0.25rem 0.75rem' }}
                    >
                      상세
                    </Link>
                    <button
                      className="btn btn-danger"
                      style={{ padding: '0.25rem 0.75rem' }}
                      onClick={() => handleDelete(project.id)}
                    >
                      삭제
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
