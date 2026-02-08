import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { projectApi } from '../services/api';
import type { Project, ProjectItem, ProjectAvailability } from '../types';
import { PROJECT_STATUS_LABELS } from '../types';

export default function ProjectDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [project, setProject] = useState<Project | null>(null);
  const [projectItems, setProjectItems] = useState<ProjectItem[]>([]);
  const [availability, setAvailability] = useState<ProjectAvailability | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      loadProjectDetail(parseInt(id));
    }
  }, [id]);

  const loadProjectDetail = async (projectId: number) => {
    try {
      setLoading(true);
      const [projectRes, itemsRes, availRes] = await Promise.all([
        projectApi.getById(projectId),
        projectApi.getItems(projectId),
        projectApi.checkAvailability(projectId),
      ]);
      setProject(projectRes.data);
      setProjectItems(itemsRes.data);
      setAvailability(availRes.data);
    } catch (error) {
      console.error('프로젝트 상세 로드 실패:', error);
      alert('프로젝트 정보를 불러오는데 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="loading">로딩 중...</div>;
  }

  if (!project) {
    return <div className="empty-state">프로젝트를 찾을 수 없습니다.</div>;
  }

  return (
    <div>
      <div className="page-header">
        <div>
          <Link to="/projects" style={{ color: '#6b7280', textDecoration: 'none', marginBottom: '0.5rem', display: 'block' }}>
            ← 프로젝트 목록으로
          </Link>
          <h1 className="page-title">{project.projectName}</h1>
          <p className="page-description">{project.projectCode}</p>
        </div>
      </div>

      <div className="card">
        <div className="card-header">
          <h2 className="card-title">프로젝트 정보</h2>
          <button className="btn btn-secondary">수정</button>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1rem' }}>
          <div>
            <div className="form-label">프로젝트명</div>
            <div>{project.projectName}</div>
          </div>
          <div>
            <div className="form-label">고객사</div>
            <div>{project.client || '-'}</div>
          </div>
          <div>
            <div className="form-label">상태</div>
            <div>
              <span className={`badge ${
                project.status === 'IN_PROGRESS' ? 'badge-info' :
                project.status === 'COMPLETED' ? 'badge-success' :
                project.status === 'CANCELLED' ? 'badge-danger' :
                'badge-gray'
              }`}>
                {PROJECT_STATUS_LABELS[project.status]}
              </span>
            </div>
          </div>
          <div>
            <div className="form-label">기간</div>
            <div>{project.startDate || '-'} ~ {project.endDate || '-'}</div>
          </div>
          <div style={{ gridColumn: '1 / -1' }}>
            <div className="form-label">설명</div>
            <div>{project.description || '-'}</div>
          </div>
        </div>
      </div>

      <div className="card">
        <div className="card-header">
          <h2 className="card-title">재고 가용성 체크</h2>
          <button
            className="btn btn-primary"
            onClick={() => id && loadProjectDetail(parseInt(id))}
          >
            새로고침
          </button>
        </div>

        {availability && (
          <div style={{ marginBottom: '1.5rem' }}>
            <div className={`badge ${availability.allItemsAvailable ? 'badge-success' : 'badge-danger'}`}
                 style={{ fontSize: '1rem', padding: '0.5rem 1rem' }}>
              {availability.allItemsAvailable ? '✓ 모든 구성품 재고 충분' : '⚠ 재고 부족 품목 있음'}
            </div>
          </div>
        )}

        {projectItems.length === 0 ? (
          <div className="empty-state">
            <p>등록된 구성품이 없습니다.</p>
            <button className="btn btn-primary" style={{ marginTop: '1rem' }}>
              + 구성품 추가
            </button>
          </div>
        ) : (
          <table className="table">
            <thead>
              <tr>
                <th>품목코드</th>
                <th>품목명</th>
                <th>필요수량</th>
                <th>현재재고</th>
                <th>부족수량</th>
                <th>상태</th>
              </tr>
            </thead>
            <tbody>
              {availability?.items.map((item) => (
                <tr key={item.itemId}>
                  <td>{item.itemCode}</td>
                  <td>{item.itemName}</td>
                  <td>{item.requiredQuantity}</td>
                  <td style={{
                    color: item.isAvailable ? '#10b981' : '#ef4444',
                    fontWeight: 'bold'
                  }}>
                    {item.availableStock}
                  </td>
                  <td style={{ color: item.shortfall > 0 ? '#ef4444' : '#10b981' }}>
                    {item.shortfall > 0 ? item.shortfall : '-'}
                  </td>
                  <td>
                    <span className={`badge ${item.isAvailable ? 'badge-success' : 'badge-danger'}`}>
                      {item.isAvailable ? '충분' : '부족'}
                    </span>
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
