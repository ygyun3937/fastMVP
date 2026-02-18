import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { projectApi } from '../services/api';
import type { Project, ProjectStatus } from '../types';
import { PROJECT_STATUS_LABELS } from '../types';

interface ProjectForm {
  projectCode: string;
  projectName: string;
  client: string;
  status: ProjectStatus;
  startDate: string;
  endDate: string;
  description: string;
}

const emptyForm: ProjectForm = {
  projectCode: '',
  projectName: '',
  client: '',
  status: 'PENDING',
  startDate: '',
  endDate: '',
  description: '',
};

export default function ProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState<ProjectForm>(emptyForm);
  const [saving, setSaving] = useState(false);

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

  const openCreateModal = () => {
    setEditingId(null);
    setForm(emptyForm);
    setShowModal(true);
  };

  const openEditModal = (project: Project) => {
    setEditingId(project.id);
    setForm({
      projectCode: project.projectCode,
      projectName: project.projectName,
      client: project.client || '',
      status: project.status,
      startDate: project.startDate || '',
      endDate: project.endDate || '',
      description: project.description || '',
    });
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingId(null);
    setForm(emptyForm);
  };

  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!form.projectCode.trim() || !form.projectName.trim()) {
      alert('프로젝트 코드와 프로젝트명은 필수입니다.');
      return;
    }

    try {
      setSaving(true);
      if (editingId) {
        await projectApi.update(editingId, form);
        alert('수정되었습니다.');
      } else {
        await projectApi.create(form);
        alert('등록되었습니다.');
      }
      closeModal();
      loadProjects();
    } catch (error) {
      console.error('저장 실패:', error);
      alert('저장에 실패했습니다.');
    } finally {
      setSaving(false);
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
          <button className="btn btn-primary" onClick={openCreateModal}>
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
                      className="btn btn-secondary"
                      style={{ marginRight: '0.5rem', padding: '0.25rem 0.75rem' }}
                      onClick={() => openEditModal(project)}
                    >
                      수정
                    </button>
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

      {showModal && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2 className="modal-title">
                {editingId ? '프로젝트 수정' : '프로젝트 등록'}
              </h2>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="modal-body">
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div className="form-group">
                    <label className="form-label">프로젝트 코드 *</label>
                    <input
                      type="text"
                      name="projectCode"
                      className="form-input"
                      value={form.projectCode}
                      onChange={handleFormChange}
                      placeholder="예: PRJ-001"
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">프로젝트명 *</label>
                    <input
                      type="text"
                      name="projectName"
                      className="form-input"
                      value={form.projectName}
                      onChange={handleFormChange}
                      placeholder="예: OO빌딩 설비공사"
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">고객사</label>
                    <input
                      type="text"
                      name="client"
                      className="form-input"
                      value={form.client}
                      onChange={handleFormChange}
                      placeholder="예: (주)OO건설"
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">상태</label>
                    <select
                      name="status"
                      className="form-select"
                      value={form.status}
                      onChange={handleFormChange}
                    >
                      <option value="PENDING">대기</option>
                      <option value="IN_PROGRESS">진행중</option>
                      <option value="COMPLETED">완료</option>
                      <option value="CANCELLED">취소</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="form-label">시작일</label>
                    <input
                      type="date"
                      name="startDate"
                      className="form-input"
                      value={form.startDate}
                      onChange={handleFormChange}
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">종료일</label>
                    <input
                      type="date"
                      name="endDate"
                      className="form-input"
                      value={form.endDate}
                      onChange={handleFormChange}
                    />
                  </div>
                </div>
                <div className="form-group" style={{ marginTop: '1rem' }}>
                  <label className="form-label">설명</label>
                  <textarea
                    name="description"
                    className="form-input"
                    value={form.description}
                    onChange={handleFormChange}
                    placeholder="프로젝트 설명을 입력하세요"
                    rows={3}
                    style={{ resize: 'vertical' }}
                  />
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={closeModal}>
                  취소
                </button>
                <button type="submit" className="btn btn-primary" disabled={saving}>
                  {saving ? '저장 중...' : (editingId ? '수정' : '등록')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
