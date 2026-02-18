import { useEffect, useState } from 'react';
import { transactionApi, inventoryApi, projectApi } from '../services/api';
import type { InventoryTransaction, Inventory, Project } from '../types';
import { TRANSACTION_TYPE_LABELS } from '../types';

interface TransactionForm {
  inventoryId: number | '';
  transactionType: 'IN' | 'OUT';
  quantity: number;
  projectId: number | '';
  referenceNo: string;
  notes: string;
  createdBy: string;
}

const emptyForm: TransactionForm = {
  inventoryId: '',
  transactionType: 'IN',
  quantity: 0,
  projectId: '',
  referenceNo: '',
  notes: '',
  createdBy: '',
};

export default function TransactionsPage() {
  const [transactions, setTransactions] = useState<InventoryTransaction[]>([]);
  const [inventoryList, setInventoryList] = useState<Inventory[]>([]);
  const [projectList, setProjectList] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState<TransactionForm>(emptyForm);
  const [saving, setSaving] = useState(false);
  const [filterType, setFilterType] = useState<'ALL' | 'IN' | 'OUT'>('ALL');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [txRes, invRes, projRes] = await Promise.all([
        transactionApi.getAll(),
        inventoryApi.getAll(),
        projectApi.getAll(),
      ]);
      setTransactions(txRes.data);
      setInventoryList(invRes.data);
      setProjectList(projRes.data);
    } catch (error) {
      console.error('데이터 로드 실패:', error);
      alert('데이터를 불러오는데 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const openModal = (type: 'IN' | 'OUT') => {
    setForm({ ...emptyForm, transactionType: type });
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setForm(emptyForm);
  };

  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setForm(prev => ({
      ...prev,
      [name]: ['inventoryId', 'projectId', 'quantity'].includes(name)
        ? (value === '' ? '' : Number(value))
        : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!form.inventoryId || form.quantity <= 0) {
      alert('품목을 선택하고 수량을 1 이상 입력해주세요.');
      return;
    }

    try {
      setSaving(true);
      await transactionApi.create({
        inventoryId: form.inventoryId as number,
        transactionType: form.transactionType,
        quantity: form.quantity,
        projectId: form.projectId ? (form.projectId as number) : undefined,
        referenceNo: form.referenceNo || undefined,
        notes: form.notes || undefined,
        createdBy: form.createdBy || undefined,
      });
      alert(form.transactionType === 'IN' ? '입고 처리되었습니다.' : '출고 처리되었습니다.');
      closeModal();
      loadData();
    } catch (error) {
      console.error('처리 실패:', error);
      alert('처리에 실패했습니다.');
    } finally {
      setSaving(false);
    }
  };

  const filteredTransactions = filterType === 'ALL'
    ? transactions
    : transactions.filter(tx => tx.transactionType === filterType);

  if (loading) {
    return <div className="loading">로딩 중...</div>;
  }

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">입출고 관리</h1>
        <p className="page-description">재고의 입고 및 출고 이력을 관리합니다</p>
      </div>

      <div className="card">
        <div className="card-header">
          <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
            <select
              className="form-select"
              value={filterType}
              onChange={(e) => setFilterType(e.target.value as 'ALL' | 'IN' | 'OUT')}
              style={{ width: '150px' }}
            >
              <option value="ALL">전체</option>
              <option value="IN">입고</option>
              <option value="OUT">출고</option>
            </select>
            <span style={{ color: '#6b7280', fontSize: '0.875rem' }}>
              총 {filteredTransactions.length}건
            </span>
          </div>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button className="btn btn-primary" onClick={() => openModal('IN')}>
              + 입고
            </button>
            <button className="btn btn-danger" onClick={() => openModal('OUT')}>
              - 출고
            </button>
          </div>
        </div>

        {filteredTransactions.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">📦</div>
            <p>입출고 이력이 없습니다.</p>
          </div>
        ) : (
          <table className="table">
            <thead>
              <tr>
                <th>일시</th>
                <th>유형</th>
                <th>품목코드</th>
                <th>품목명</th>
                <th>수량</th>
                <th>프로젝트</th>
                <th>참조번호</th>
                <th>비고</th>
                <th>처리자</th>
              </tr>
            </thead>
            <tbody>
              {filteredTransactions.map((tx) => (
                <tr key={tx.id}>
                  <td>{tx.transactionDate ? new Date(tx.transactionDate).toLocaleString('ko-KR') : '-'}</td>
                  <td>
                    <span className={`badge ${tx.transactionType === 'IN' ? 'badge-success' : 'badge-danger'}`}>
                      {TRANSACTION_TYPE_LABELS[tx.transactionType]}
                    </span>
                  </td>
                  <td>{tx.inventory?.itemCode || '-'}</td>
                  <td>{tx.inventory?.itemName || '-'}</td>
                  <td style={{ fontWeight: 'bold', color: tx.transactionType === 'IN' ? '#10b981' : '#ef4444' }}>
                    {tx.transactionType === 'IN' ? '+' : '-'}{tx.quantity}
                  </td>
                  <td>{tx.project?.projectName || '-'}</td>
                  <td>{tx.referenceNo || '-'}</td>
                  <td>{tx.notes || '-'}</td>
                  <td>{tx.createdBy || '-'}</td>
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
                {form.transactionType === 'IN' ? '입고 처리' : '출고 처리'}
              </h2>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="modal-body">
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div className="form-group">
                    <label className="form-label">품목 *</label>
                    <select
                      name="inventoryId"
                      className="form-select"
                      value={form.inventoryId}
                      onChange={handleFormChange}
                      required
                    >
                      <option value="">품목 선택</option>
                      {inventoryList.map(inv => (
                        <option key={inv.id} value={inv.id}>
                          [{inv.itemCode}] {inv.itemName} (재고: {inv.currentStock})
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="form-label">수량 *</label>
                    <input
                      type="number"
                      name="quantity"
                      className="form-input"
                      value={form.quantity}
                      onChange={handleFormChange}
                      min="1"
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">관련 프로젝트</label>
                    <select
                      name="projectId"
                      className="form-select"
                      value={form.projectId}
                      onChange={handleFormChange}
                    >
                      <option value="">선택 안함</option>
                      {projectList.map(proj => (
                        <option key={proj.id} value={proj.id}>
                          [{proj.projectCode}] {proj.projectName}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="form-label">참조번호</label>
                    <input
                      type="text"
                      name="referenceNo"
                      className="form-input"
                      value={form.referenceNo}
                      onChange={handleFormChange}
                      placeholder="예: PO-2026-001"
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">처리자</label>
                    <input
                      type="text"
                      name="createdBy"
                      className="form-input"
                      value={form.createdBy}
                      onChange={handleFormChange}
                      placeholder="예: 홍길동"
                    />
                  </div>
                </div>
                <div className="form-group" style={{ marginTop: '1rem' }}>
                  <label className="form-label">비고</label>
                  <textarea
                    name="notes"
                    className="form-input"
                    value={form.notes}
                    onChange={handleFormChange}
                    placeholder="메모를 입력하세요"
                    rows={2}
                    style={{ resize: 'vertical' }}
                  />
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={closeModal}>
                  취소
                </button>
                <button
                  type="submit"
                  className={form.transactionType === 'IN' ? 'btn btn-primary' : 'btn btn-danger'}
                  disabled={saving}
                >
                  {saving ? '처리 중...' : (form.transactionType === 'IN' ? '입고' : '출고')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
