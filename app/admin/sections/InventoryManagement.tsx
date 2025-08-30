'use client';

import React, { useState, useEffect } from 'react';

interface InventoryItem {
  id: string;
  name: string;
  type: 'ROOM' | 'PACKAGE';
  hotelName: string;
  currentStock: number;
  maxStock: number;
  reservedStock: number;
  availableStock: number;
  status: 'AVAILABLE' | 'LOW_STOCK' | 'OUT_OF_STOCK';
  lastUpdated: string;
}

export default function InventoryManagement() {
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingItem, setEditingItem] = useState<InventoryItem | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    type: 'ROOM' as const,
    hotelName: '',
    currentStock: 0,
    maxStock: 0
  });

  useEffect(() => {
    loadInventory();
  }, []);

  const loadInventory = async () => {
    try {
      setLoading(true);
      // 실제 API 호출로 대체
      const mockInventory: InventoryItem[] = [
        {
          id: '1',
          name: '디럭스 룸',
          type: 'ROOM',
          hotelName: 'A-HOTEL',
          currentStock: 15,
          maxStock: 20,
          reservedStock: 5,
          availableStock: 10,
          status: 'AVAILABLE',
          lastUpdated: '2024-01-01'
        },
        {
          id: '2',
          name: '스위트 룸',
          type: 'ROOM',
          hotelName: 'A-HOTEL',
          currentStock: 8,
          maxStock: 10,
          reservedStock: 2,
          availableStock: 6,
          status: 'LOW_STOCK',
          lastUpdated: '2024-01-01'
        },
        {
          id: '3',
          name: '기본 패키지',
          type: 'PACKAGE',
          hotelName: 'A-HOTEL',
          currentStock: 50,
          maxStock: 100,
          reservedStock: 20,
          availableStock: 30,
          status: 'AVAILABLE',
          lastUpdated: '2024-01-01'
        }
      ];
      setInventory(mockInventory);
    } catch (error) {
      console.error('재고 로딩 실패:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingItem) {
        // 수정 로직
        const updatedInventory = inventory.map(item =>
          item.id === editingItem.id ? { 
            ...item, 
            ...formData,
            availableStock: formData.currentStock - item.reservedStock,
            status: getStatus(formData.currentStock, formData.maxStock),
            lastUpdated: new Date().toISOString()
          } : item
        );
        setInventory(updatedInventory);
      } else {
        // 새 재고 항목 추가 로직
        const newItem: InventoryItem = {
          id: Date.now().toString(),
          ...formData,
          reservedStock: 0,
          availableStock: formData.currentStock,
          status: getStatus(formData.currentStock, formData.maxStock),
          lastUpdated: new Date().toISOString()
        };
        setInventory([...inventory, newItem]);
      }
      setShowModal(false);
      setEditingItem(null);
      setFormData({
        name: '',
        type: 'ROOM',
        hotelName: '',
        currentStock: 0,
        maxStock: 0
      });
    } catch (error) {
      console.error('재고 저장 실패:', error);
    }
  };

  const getStatus = (current: number, max: number): 'AVAILABLE' | 'LOW_STOCK' | 'OUT_OF_STOCK' => {
    if (current === 0) return 'OUT_OF_STOCK';
    if (current <= max * 0.2) return 'LOW_STOCK';
    return 'AVAILABLE';
  };

  const handleEdit = (item: InventoryItem) => {
    setEditingItem(item);
    setFormData({
      name: item.name,
      type: item.type,
      hotelName: item.hotelName,
      currentStock: item.currentStock,
      maxStock: item.maxStock
    });
    setShowModal(true);
  };

  const handleDelete = async (id: string) => {
    if (confirm('정말 삭제하시겠습니까?')) {
      try {
        const updatedInventory = inventory.filter(item => item.id !== id);
        setInventory(updatedInventory);
      } catch (error) {
        console.error('재고 삭제 실패:', error);
      }
    }
  };

  const openCreateModal = () => {
    setEditingItem(null);
    setFormData({
      name: '',
      type: 'ROOM',
      hotelName: '',
      currentStock: 0,
      maxStock: 0
    });
    setShowModal(true);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'AVAILABLE':
        return 'bg-green-100 text-green-800';
      case 'LOW_STOCK':
        return 'bg-yellow-100 text-yellow-800';
      case 'OUT_OF_STOCK':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'AVAILABLE':
        return '재고 충분';
      case 'LOW_STOCK':
        return '재고 부족';
      case 'OUT_OF_STOCK':
        return '재고 없음';
      default:
        return '알 수 없음';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-6">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* 헤더 */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">재고 관리</h1>
          <p className="text-gray-600">객실 수량, 패키지 재고, 예약 가능 여부를 관리합니다</p>
        </div>
        <button
          onClick={openCreateModal}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          새 재고 항목 추가
        </button>
      </div>

      {/* 재고 요약 */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="text-sm font-medium text-gray-600">총 재고 항목</div>
          <div className="text-2xl font-bold text-gray-900">{inventory.length}</div>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="text-sm font-medium text-gray-600">재고 충분</div>
          <div className="text-2xl font-bold text-green-600">
            {inventory.filter(item => item.status === 'AVAILABLE').length}
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="text-sm font-medium text-gray-600">재고 부족</div>
          <div className="text-2xl font-bold text-yellow-600">
            {inventory.filter(item => item.status === 'LOW_STOCK').length}
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="text-sm font-medium text-gray-600">재고 없음</div>
          <div className="text-2xl font-bold text-red-600">
            {inventory.filter(item => item.status === 'OUT_OF_STOCK').length}
          </div>
        </div>
      </div>

      {/* 재고 목록 */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">항목명</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">호텔</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">유형</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">현재 재고</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">예약됨</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">사용 가능</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">상태</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">업데이트</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">작업</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {inventory.map((item) => (
                <tr key={item.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{item.name}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {item.hotelName}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      item.type === 'ROOM' 
                        ? 'bg-blue-100 text-blue-800' 
                        : 'bg-purple-100 text-purple-800'
                    }`}>
                      {item.type === 'ROOM' ? '객실' : '패키지'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {item.currentStock} / {item.maxStock}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {item.reservedStock}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {item.availableStock}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(item.status)}`}>
                      {getStatusText(item.status)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(item.lastUpdated).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button
                      onClick={() => handleEdit(item)}
                      className="text-blue-600 hover:text-blue-900 mr-3"
                    >
                      수정
                    </button>
                    <button
                      onClick={() => handleDelete(item.id)}
                      className="text-red-600 hover:text-red-900"
                    >
                      삭제
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* 모달 */}
      {showModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                {editingItem ? '재고 수정' : '새 재고 항목 추가'}
              </h3>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">항목명</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">호텔명</label>
                  <input
                    type="text"
                    value={formData.hotelName}
                    onChange={(e) => setFormData({ ...formData, hotelName: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">유형</label>
                  <select
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value as 'ROOM' | 'PACKAGE' })}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="ROOM">객실</option>
                    <option value="PACKAGE">패키지</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">현재 재고</label>
                  <input
                    type="number"
                    value={formData.currentStock}
                    onChange={(e) => setFormData({ ...formData, currentStock: parseInt(e.target.value) })}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500"
                    min="0"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">최대 재고</label>
                  <input
                    type="number"
                    value={formData.maxStock}
                    onChange={(e) => setFormData({ ...formData, maxStock: parseInt(e.target.value) })}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500"
                    min="0"
                    required
                  />
                </div>
                <div className="flex justify-end space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                  >
                    취소
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                  >
                    {editingItem ? '수정' : '추가'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
