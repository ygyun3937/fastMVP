import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { reportApi } from '../services/api';
import type { InventoryStatusReport, ProjectSummaryReport, TransactionHistoryReport } from '../types';

export default function Dashboard() {
  const [inventoryReport, setInventoryReport] = useState<InventoryStatusReport | null>(null);
  const [projectReport, setProjectReport] = useState<ProjectSummaryReport | null>(null);
  const [transactionReport, setTransactionReport] = useState<TransactionHistoryReport | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadReports();
  }, []);

  const loadReports = async () => {
    try {
      setLoading(true);
      const [inventory, project, transaction] = await Promise.all([
        reportApi.getInventoryStatus(),
        reportApi.getProjectSummary(),
        reportApi.getTransactionHistory(),
      ]);
      setInventoryReport(inventory.data);
      setProjectReport(project.data);
      setTransactionReport(transaction.data);
    } catch (error) {
      console.error('리포트 로드 실패:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="loading">로딩 중...</div>;
  }

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">대시보드</h1>
        <p className="page-description">재고 및 프로젝트 현황을 한눈에 확인하세요</p>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-label">전체 재고 품목</div>
          <div className="stat-value">{inventoryReport?.totalItems || 0}</div>
          <div className="stat-change">
            <Link to="/inventory" style={{ color: '#1e40af', textDecoration: 'none' }}>
              재고 관리 →
            </Link>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-label">재고 부족 품목</div>
          <div className="stat-value" style={{ color: inventoryReport && inventoryReport.lowStockItems > 0 ? '#ef4444' : '#10b981' }}>
            {inventoryReport?.lowStockItems || 0}
          </div>
          <div className="stat-change">
            {inventoryReport && inventoryReport.lowStockItems > 0 ? (
              <Link to="/inventory" style={{ color: '#ef4444', textDecoration: 'none' }}>
                확인 필요 →
              </Link>
            ) : (
              <span style={{ color: '#10b981' }}>정상</span>
            )}
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-label">전체 프로젝트</div>
          <div className="stat-value">{projectReport?.totalProjects || 0}</div>
          <div className="stat-change">
            <Link to="/projects" style={{ color: '#1e40af', textDecoration: 'none' }}>
              프로젝트 관리 →
            </Link>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-label">진행중 프로젝트</div>
          <div className="stat-value" style={{ color: '#1e40af' }}>
            {projectReport?.statusCounts?.IN_PROGRESS || 0}
          </div>
          <div className="stat-change">
            <span>대기: {projectReport?.statusCounts?.PENDING || 0}</span>
          </div>
        </div>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-label">총 입고 수량</div>
          <div className="stat-value" style={{ color: '#10b981' }}>
            {transactionReport?.totalInQuantity || 0}
          </div>
          <div className="stat-change">입고 건수: {transactionReport?.inTransactions || 0}</div>
        </div>

        <div className="stat-card">
          <div className="stat-label">총 출고 수량</div>
          <div className="stat-value" style={{ color: '#ef4444' }}>
            {transactionReport?.totalOutQuantity || 0}
          </div>
          <div className="stat-change">출고 건수: {transactionReport?.outTransactions || 0}</div>
        </div>
      </div>

      {inventoryReport && inventoryReport.lowStockList.length > 0 && (
        <div className="card">
          <div className="card-header">
            <h2 className="card-title">⚠️ 재고 부족 알림</h2>
            <Link to="/inventory" className="btn btn-primary">
              전체 보기
            </Link>
          </div>
          <table className="table">
            <thead>
              <tr>
                <th>품목코드</th>
                <th>품목명</th>
                <th>현재재고</th>
                <th>최소재고</th>
                <th>부족수량</th>
              </tr>
            </thead>
            <tbody>
              {inventoryReport.lowStockList.slice(0, 5).map((item) => (
                <tr key={item.id}>
                  <td>{item.itemCode}</td>
                  <td>{item.itemName}</td>
                  <td style={{ color: '#ef4444', fontWeight: 'bold' }}>
                    {item.currentStock} {item.unit}
                  </td>
                  <td>{item.minStock} {item.unit}</td>
                  <td style={{ color: '#ef4444' }}>
                    {item.minStock - item.currentStock} {item.unit}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {projectReport && projectReport.projects.length > 0 && (
        <div className="card">
          <div className="card-header">
            <h2 className="card-title">최근 프로젝트</h2>
            <Link to="/projects" className="btn btn-primary">
              전체 보기
            </Link>
          </div>
          <table className="table">
            <thead>
              <tr>
                <th>프로젝트코드</th>
                <th>프로젝트명</th>
                <th>고객사</th>
                <th>상태</th>
                <th>시작일</th>
              </tr>
            </thead>
            <tbody>
              {projectReport.projects.slice(0, 5).map((project) => (
                <tr key={project.id}>
                  <td>{project.projectCode}</td>
                  <td>
                    <Link to={`/projects/${project.id}`} style={{ color: '#1e40af', textDecoration: 'none' }}>
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
                      {project.status === 'PENDING' ? '대기' :
                       project.status === 'IN_PROGRESS' ? '진행중' :
                       project.status === 'COMPLETED' ? '완료' : '취소'}
                    </span>
                  </td>
                  <td>{project.startDate || '-'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
