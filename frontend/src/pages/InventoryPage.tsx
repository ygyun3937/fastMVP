import { useEffect, useState } from 'react';
import { inventoryApi } from '../services/api';
import type { Inventory } from '../types';

export default function InventoryPage() {
  const [inventoryList, setInventoryList] = useState<Inventory[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchKeyword, setSearchKeyword] = useState('');

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
              onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
              style={{ maxWidth: '400px' }}
            />
            <button onClick={handleSearch} className="btn btn-secondary">
              검색
            </button>
            <button onClick={loadInventory} className="btn btn-secondary">
              전체보기
            </button>
          </div>
          <button className="btn btn-primary" onClick={() => alert('재고 등록 모달 (구현 예정)')}>
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
                      onClick={() => alert(`수정 기능 (ID: ${item.id})`)}
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
    </div>
  );
}
