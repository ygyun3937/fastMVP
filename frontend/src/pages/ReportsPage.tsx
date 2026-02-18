import { useEffect, useState } from 'react';
import { reportApi, emailApi } from '../services/api';
import type { InventoryStatusReport, ProjectSummaryReport, TransactionHistoryReport } from '../types';
import { PROJECT_STATUS_LABELS, TRANSACTION_TYPE_LABELS } from '../types';

type TabType = 'inventory' | 'project' | 'transaction';

export default function ReportsPage() {
  const [activeTab, setActiveTab] = useState<TabType>('inventory');
  const [inventoryReport, setInventoryReport] = useState<InventoryStatusReport | null>(null);
  const [projectReport, setProjectReport] = useState<ProjectSummaryReport | null>(null);
  const [transactionReport, setTransactionReport] = useState<TransactionHistoryReport | null>(null);
  const [loading, setLoading] = useState(true);
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [emailTo, setEmailTo] = useState('');
  const [sending, setSending] = useState(false);

  useEffect(() => {
    loadReport(activeTab);
  }, [activeTab]);

  const loadReport = async (tab: TabType) => {
    try {
      setLoading(true);
      if (tab === 'inventory' && !inventoryReport) {
        const res = await reportApi.getInventoryStatus();
        setInventoryReport(res.data);
      } else if (tab === 'project' && !projectReport) {
        const res = await reportApi.getProjectSummary();
        setProjectReport(res.data);
      } else if (tab === 'transaction' && !transactionReport) {
        const res = await reportApi.getTransactionHistory();
        setTransactionReport(res.data);
      }
    } catch (error) {
      console.error('보고서 로드 실패:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const handleSendEmail = async () => {
    if (!emailTo.trim()) {
      alert('이메일 주소를 입력해주세요.');
      return;
    }
    try {
      setSending(true);
      await emailApi.sendReport(emailTo, activeTab);
      alert('메일이 발송되었습니다.');
      setShowEmailModal(false);
      setEmailTo('');
    } catch (error) {
      console.error('메일 발송 실패:', error);
      alert('메일 발송에 실패했습니다. SMTP 설정을 확인해주세요.');
    } finally {
      setSending(false);
    }
  };

  const tabLabels: Record<TabType, string> = {
    inventory: '재고 현황',
    project: '프로젝트 요약',
    transaction: '입출고 이력',
  };

  const tabs: { key: TabType; label: string }[] = [
    { key: 'inventory', label: '재고 현황' },
    { key: 'project', label: '프로젝트 요약' },
    { key: 'transaction', label: '입출고 이력' },
  ];

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">보고서</h1>
        <p className="page-description">재고, 프로젝트, 입출고 현황을 한눈에 확인하세요</p>
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          {tabs.map(tab => (
            <button
              key={tab.key}
              className={`btn ${activeTab === tab.key ? 'btn-primary' : 'btn-secondary'}`}
              onClick={() => setActiveTab(tab.key)}
            >
              {tab.label}
            </button>
          ))}
        </div>
        <div style={{ display: 'flex', gap: '0.5rem' }} className="no-print">
          <button className="btn btn-secondary" onClick={handlePrint}>
            PDF / 인쇄
          </button>
          <button className="btn btn-primary" onClick={() => setShowEmailModal(true)}>
            메일 발송
          </button>
        </div>
      </div>

      {loading ? (
        <div className="loading">로딩 중...</div>
      ) : (
        <>
          {activeTab === 'inventory' && inventoryReport && (
            <InventoryReportView report={inventoryReport} />
          )}
          {activeTab === 'project' && projectReport && (
            <ProjectReportView report={projectReport} />
          )}
          {activeTab === 'transaction' && transactionReport && (
            <TransactionReportView report={transactionReport} />
          )}
        </>
      )}

      {showEmailModal && (
        <div className="modal-overlay" onClick={() => setShowEmailModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '450px' }}>
            <div className="modal-header">
              <h2 className="modal-title">보고서 메일 발송</h2>
            </div>
            <div className="modal-body">
              <p style={{ color: '#6b7280', marginBottom: '1rem' }}>
                현재 보고서 ({tabLabels[activeTab]})를 메일로 발송합니다.
              </p>
              <div className="form-group">
                <label className="form-label">받는 사람 이메일 *</label>
                <input
                  type="email"
                  className="form-input"
                  value={emailTo}
                  onChange={(e) => setEmailTo(e.target.value)}
                  placeholder="example@company.com"
                  onKeyDown={(e) => e.key === 'Enter' && handleSendEmail()}
                />
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={() => setShowEmailModal(false)}>
                취소
              </button>
              <button className="btn btn-primary" onClick={handleSendEmail} disabled={sending}>
                {sending ? '발송 중...' : '발송'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function InventoryReportView({ report }: { report: InventoryStatusReport }) {
  return (
    <>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem', marginBottom: '1.5rem' }}>
        <div className="card" style={{ padding: '1.5rem', textAlign: 'center' }}>
          <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#1e40af' }}>{report.totalItems}</div>
          <div style={{ color: '#6b7280', marginTop: '0.25rem' }}>총 품목 수</div>
        </div>
        <div className="card" style={{ padding: '1.5rem', textAlign: 'center' }}>
          <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#ef4444' }}>{report.lowStockItems}</div>
          <div style={{ color: '#6b7280', marginTop: '0.25rem' }}>재고 부족 품목</div>
        </div>
        <div className="card" style={{ padding: '1.5rem', textAlign: 'center' }}>
          <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#10b981' }}>{report.totalStock}</div>
          <div style={{ color: '#6b7280', marginTop: '0.25rem' }}>총 재고 수량</div>
        </div>
      </div>

      {report.lowStockList && report.lowStockList.length > 0 && (
        <div className="card">
          <div className="card-header">
            <h2 className="card-title" style={{ color: '#ef4444' }}>재고 부족 품목</h2>
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
              {report.lowStockList.map(item => (
                <tr key={item.id}>
                  <td>{item.itemCode}</td>
                  <td>{item.itemName}</td>
                  <td style={{ color: '#ef4444', fontWeight: 'bold' }}>{item.currentStock}</td>
                  <td>{item.minStock}</td>
                  <td style={{ color: '#ef4444', fontWeight: 'bold' }}>{item.minStock - item.currentStock}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <div className="card" style={{ marginTop: '1rem' }}>
        <div className="card-header">
          <h2 className="card-title">전체 재고 목록</h2>
        </div>
        <table className="table">
          <thead>
            <tr>
              <th>품목코드</th>
              <th>품목명</th>
              <th>카테고리</th>
              <th>현재재고</th>
              <th>최소재고</th>
              <th>단위</th>
              <th>상태</th>
            </tr>
          </thead>
          <tbody>
            {report.inventoryList.map(item => (
              <tr key={item.id}>
                <td>{item.itemCode}</td>
                <td>{item.itemName}</td>
                <td>{item.category || '-'}</td>
                <td style={{
                  color: item.currentStock < item.minStock ? '#ef4444' : '#10b981',
                  fontWeight: 'bold'
                }}>
                  {item.currentStock}
                </td>
                <td>{item.minStock}</td>
                <td>{item.unit}</td>
                <td>
                  <span className={`badge ${item.currentStock < item.minStock ? 'badge-danger' : 'badge-success'}`}>
                    {item.currentStock < item.minStock ? '부족' : '정상'}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}

function ProjectReportView({ report }: { report: ProjectSummaryReport }) {
  const statusColors: Record<string, string> = {
    PENDING: '#6b7280',
    IN_PROGRESS: '#3b82f6',
    COMPLETED: '#10b981',
    CANCELLED: '#ef4444',
  };

  return (
    <>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '1rem', marginBottom: '1.5rem' }}>
        <div className="card" style={{ padding: '1.5rem', textAlign: 'center' }}>
          <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#1e40af' }}>{report.totalProjects}</div>
          <div style={{ color: '#6b7280', marginTop: '0.25rem' }}>전체 프로젝트</div>
        </div>
        {Object.entries(report.statusCounts).map(([status, count]) => (
          <div key={status} className="card" style={{ padding: '1.5rem', textAlign: 'center' }}>
            <div style={{ fontSize: '2rem', fontWeight: 'bold', color: statusColors[status] || '#6b7280' }}>
              {count}
            </div>
            <div style={{ color: '#6b7280', marginTop: '0.25rem' }}>
              {PROJECT_STATUS_LABELS[status as keyof typeof PROJECT_STATUS_LABELS] || status}
            </div>
          </div>
        ))}
      </div>

      <div className="card">
        <div className="card-header">
          <h2 className="card-title">프로젝트 목록</h2>
        </div>
        <table className="table">
          <thead>
            <tr>
              <th>프로젝트코드</th>
              <th>프로젝트명</th>
              <th>고객사</th>
              <th>상태</th>
              <th>시작일</th>
              <th>종료일</th>
            </tr>
          </thead>
          <tbody>
            {report.projects.map(project => (
              <tr key={project.id}>
                <td>{project.projectCode}</td>
                <td>{project.projectName}</td>
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
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}

function TransactionReportView({ report }: { report: TransactionHistoryReport }) {
  return (
    <>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '1rem', marginBottom: '1.5rem' }}>
        <div className="card" style={{ padding: '1.5rem', textAlign: 'center' }}>
          <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#1e40af' }}>{report.totalTransactions}</div>
          <div style={{ color: '#6b7280', marginTop: '0.25rem' }}>총 거래</div>
        </div>
        <div className="card" style={{ padding: '1.5rem', textAlign: 'center' }}>
          <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#10b981' }}>{report.inTransactions}</div>
          <div style={{ color: '#6b7280', marginTop: '0.25rem' }}>입고 건수</div>
        </div>
        <div className="card" style={{ padding: '1.5rem', textAlign: 'center' }}>
          <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#ef4444' }}>{report.outTransactions}</div>
          <div style={{ color: '#6b7280', marginTop: '0.25rem' }}>출고 건수</div>
        </div>
        <div className="card" style={{ padding: '1.5rem', textAlign: 'center' }}>
          <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#10b981' }}>+{report.totalInQuantity}</div>
          <div style={{ color: '#6b7280', marginTop: '0.25rem' }}>총 입고 수량</div>
        </div>
        <div className="card" style={{ padding: '1.5rem', textAlign: 'center' }}>
          <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#ef4444' }}>-{report.totalOutQuantity}</div>
          <div style={{ color: '#6b7280', marginTop: '0.25rem' }}>총 출고 수량</div>
        </div>
      </div>

      <div className="card">
        <div className="card-header">
          <h2 className="card-title">거래 이력</h2>
        </div>
        {report.transactions.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">📦</div>
            <p>거래 이력이 없습니다.</p>
          </div>
        ) : (
          <table className="table">
            <thead>
              <tr>
                <th>일시</th>
                <th>유형</th>
                <th>품목</th>
                <th>수량</th>
                <th>프로젝트</th>
                <th>참조번호</th>
                <th>처리자</th>
              </tr>
            </thead>
            <tbody>
              {report.transactions.map(tx => (
                <tr key={tx.id}>
                  <td>{tx.transactionDate ? new Date(tx.transactionDate).toLocaleString('ko-KR') : '-'}</td>
                  <td>
                    <span className={`badge ${tx.transactionType === 'IN' ? 'badge-success' : 'badge-danger'}`}>
                      {TRANSACTION_TYPE_LABELS[tx.transactionType]}
                    </span>
                  </td>
                  <td>{tx.inventory?.itemName || '-'}</td>
                  <td style={{
                    fontWeight: 'bold',
                    color: tx.transactionType === 'IN' ? '#10b981' : '#ef4444'
                  }}>
                    {tx.transactionType === 'IN' ? '+' : '-'}{tx.quantity}
                  </td>
                  <td>{tx.project?.projectName || '-'}</td>
                  <td>{tx.referenceNo || '-'}</td>
                  <td>{tx.createdBy || '-'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </>
  );
}
