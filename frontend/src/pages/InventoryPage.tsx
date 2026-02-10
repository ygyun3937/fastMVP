import { useEffect, useState } from 'react';
import { inventoryApi } from '../services/api';
import type { Inventory } from '../types';

interface InventoryForm {
  itemCode: string;
  itemName: string;
  category: string;
  unit: string;
  currentStock: number;
  minStock: number;
  unitPrice: number;
  location: string;
}

const emptyForm: InventoryForm = {
  itemCode: '',
  itemName: '',
  category: '',
  unit: 'EA',
  currentStock: 0,
  minStock: 0,
  unitPrice: 0,
  location: '',
};

export default function InventoryPage() {
  const [inventoryList, setInventoryList] = useState<Inventory[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchKeyword, setSearchKeyword] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState<InventoryForm>(emptyForm);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadInventory();
  }, []);

  const loadInventory = async () => {
    try {
      setLoading(true);
      const response = await inventoryApi.getAll();
      setInventoryList(response.data);
    } catch (error) {
      console.error('재고 로드 실패:', error);
      alert('재고 목록을 불러오는데 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async () => {
    if (!searchKeyword.trim()) {
      loadInventory();
      return;
    }
    try {
      const response = await inventoryApi.search(searchKeyword);
      setInventoryList(response.data);
    } catch (error) {
      console.error('검색 실패:', error);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('정말 삭제하시겠습니까?')) return;
    try {
      await inventoryApi.delete(id);
      alert('삭제되었습니다.');
      loadInventory();
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

  const openEditModal = (item: Inventory) => {
    setEditingId(item.id);
    setForm({
      itemCode: item.itemCode,
      itemName: item.itemName,
      category: item.category || '',
      unit: item.unit,
      currentStock: item.currentStock,
      minStock: item.minStock,
      unitPrice: item.unitPrice || 0,
      location: item.location || '',
    });
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingId(null);
    setForm(emptyForm);
  };

  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setForm(prev => ({
      ...prev,
      [name]: ['currentStock', 'minStock', 'unitPrice'].includes(name)
        ? Number(value)
        : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!form.itemCode.trim() || !form.itemName.trim()) {
      alert('품목코드와 품목명은 필수입니다.');
      return;
    }

    try {
      setSaving(true);
      if (editingId) {
        await inventoryApi.update(editingId, form);
        alert('수정되었습니다.');
      } else {
        await inventoryApi.create(form);
        alert('등록되었습니다.');
      }
      closeModal();
      loadInventory();
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
        <h1 className="page-title">재고 관리</h1>
        <p className="page-description">구매 재고를 관리하고 재고 현황을 확인하세요</p>
      </div>

      <div className="card">
        <div className="card-header">
          <div style={{ display: 'flex', gap: '0.5rem', flex: 1 }}>
            <input
              type="text"
              className="form-input"
              placeholder="품목코드 또는 품목명으로 검색..."
              value={searchKeyword}
              onChange={(e) => setSearchKeyword(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              style={{ maxWidth: '400px' }}
            />
            <button onClick={handleSearch} className="btn btn-secondary">
              검색
            </button>
            <button onClick={loadInventory} className="btn btn-secondary">
              전체보기
            </button>
          </div>
          <button className="btn btn-primary" onClick={openCreateModal}>
            + 재고 등록
          </button>
        </div>

        {inventoryList.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">📦</div>
            <p>등록된 재고가 없습니다.</p>
          </div>
        ) : (
          <table className="table">
            <thead>
              <tr>
                <th>품목코드</th>
                <th>품목명</th>
                <th>카테고리</th>
                <th>현재재고</th>
                <th>최소재고</th>
                <th>단위</th>
                <th>단가</th>
                <th>보관위치</th>
                <th>상태</th>
                <th>관리</th>
              </tr>
            </thead>
            <tbody>
              {inventoryList.map((item) => (
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
                  <td>{item.unitPrice ? `₩${item.unitPrice.toLocaleString()}` : '-'}</td>
                  <td>{item.location || '-'}</td>
                  <td>
                    <span className={`badge ${
                      item.currentStock < item.minStock ? 'badge-danger' : 'badge-success'
                    }`}>
                      {item.currentStock < item.minStock ? '부족' : '정상'}
                    </span>
                  </td>
                  <td>
                    <button
                      className="btn btn-secondary"
                      style={{ marginRight: '0.5rem', padding: '0.25rem 0.75rem' }}
                      onClick={() => openEditModal(item)}
                    >
                      수정
                    </button>
                    <button
                      className="btn btn-danger"
                      style={{ padding: '0.25rem 0.75rem' }}
                      onClick={() => handleDelete(item.id)}
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
                {editingId ? '재고 수정' : '재고 등록'}
              </h2>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="modal-body">
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div className="form-group">
                    <label className="form-label">품목코드 *</label>
                    <input
                      type="text"
                      name="itemCode"
                      className="form-input"
                      value={form.itemCode}
                      onChange={handleFormChange}
                      placeholder="예: ITM-001"
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">품목명 *</label>
                    <input
                      type="text"
                      name="itemName"
                      className="form-input"
                      value={form.itemName}
                      onChange={handleFormChange}
                      placeholder="예: 볼트 M10"
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">카테고리</label>
                    <input
                      type="text"
                      name="category"
                      className="form-input"
                      value={form.category}
                      onChange={handleFormChange}
                      placeholder="예: 전자부품"
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">단위</label>
                    <select
                      name="unit"
                      className="form-select"
                      value={form.unit}
                      onChange={handleFormChange}
                    >
                      <option value="EA">EA (개)</option>
                      <option value="SET">SET (세트)</option>
                      <option value="BOX">BOX (박스)</option>
                      <option value="KG">KG (킬로그램)</option>
                      <option value="M">M (미터)</option>
                      <option value="L">L (리터)</option>
                      <option value="ROLL">ROLL (롤)</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="form-label">현재 재고</label>
                    <input
                      type="number"
                      name="currentStock"
                      className="form-input"
                      value={form.currentStock}
                      onChange={handleFormChange}
                      min="0"
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">최소 재고</label>
                    <input
                      type="number"
                      name="minStock"
                      className="form-input"
                      value={form.minStock}
                      onChange={handleFormChange}
                      min="0"
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">단가 (원)</label>
                    <input
                      type="number"
                      name="unitPrice"
                      className="form-input"
                      value={form.unitPrice}
                      onChange={handleFormChange}
                      min="0"
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">보관위치</label>
                    <input
                      type="text"
                      name="location"
                      className="form-input"
                      value={form.location}
                      onChange={handleFormChange}
                      placeholder="예: A동 2층 선반3"
                    />
                  </div>
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
