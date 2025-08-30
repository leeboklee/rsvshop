'use client';

import { useState, useEffect } from 'react';

interface ShoppingMall {
  id: string;
  name: string;
  platform: string;
  commissionRate: number; // 수수료율 (%)
  isActive: boolean;
  createdAt: string;
}

export default function ShoppingMallsPage() {
  const [shoppingMalls, setShoppingMalls] = useState<ShoppingMall[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingMall, setEditingMall] = useState<ShoppingMall | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    platform: '',
    commissionRate: 0
  });

  // 샘플 데이터 로드
  useEffect(() => {
    const sampleData: ShoppingMall[] = [
      {
        id: '1',
        name: '스마트스토어',
        platform: '네이버',
        commissionRate: 3.5,
        isActive: true,
        createdAt: '2024-01-01'
      },
      {
        id: '2',
        name: 'G마켓',
        platform: '이베이',
        commissionRate: 5.0,
        isActive: true,
        createdAt: '2024-01-01'
      },
      {
        id: '3',
        name: '11번가',
        platform: 'SK',
        commissionRate: 4.2,
        isActive: true,
        createdAt: '2024-01-01'
      }
    ];
    setShoppingMalls(sampleData);
    setLoading(false);
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (editingMall) {
      // 수정
      setShoppingMalls(malls => 
        malls.map(mall => 
          mall.id === editingMall.id 
            ? { ...mall, ...formData, commissionRate: Number(formData.commissionRate) }
            : mall
        )
      );
      setEditingMall(null);
    } else {
      // 추가
      const newMall: ShoppingMall = {
        id: Date.now().toString(),
        name: formData.name,
        platform: formData.platform,
        commissionRate: Number(formData.commissionRate),
        isActive: true,
        createdAt: new Date().toISOString().split('T')[0]
      };
      setShoppingMalls(malls => [...malls, newMall]);
    }
    
    setFormData({ name: '', platform: '', commissionRate: 0 });
    setShowAddForm(false);
  };

  const handleEdit = (mall: ShoppingMall) => {
    setEditingMall(mall);
    setFormData({
      name: mall.name,
      platform: mall.platform,
      commissionRate: mall.commissionRate
    });
    setShowAddForm(true);
  };

  const handleDelete = (id: string) => {
    if (confirm('정말 삭제하시겠습니까?')) {
      setShoppingMalls(malls => malls.filter(mall => mall.id !== id));
    }
  };

  const toggleActive = (id: string) => {
    setShoppingMalls(malls =>
      malls.map(mall =>
        mall.id === id ? { ...mall, isActive: !mall.isActive } : mall
      )
    );
  };

  const resetForm = () => {
    setFormData({ name: '', platform: '', commissionRate: 0 });
    setEditingMall(null);
    setShowAddForm(false);
  };

  if (loading) {
    return (
      <div className="min-h-[50vh] bg-white rounded-2xl border p-4 md:p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded mb-4"></div>
          <div className="h-4 bg-gray-200 rounded mb-6"></div>
          <div className="space-y-3">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-16 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[50vh] bg-white rounded-2xl border p-4 md:p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold mb-2">쇼핑몰 관리</h1>
          <p className="text-gray-600">
            쇼핑몰별 수수료율을 설정하면 예약 관리에서 자동으로 공급가가 계산됩니다.
          </p>
        </div>
        <button
          onClick={() => setShowAddForm(true)}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          쇼핑몰 추가
        </button>
      </div>

      {/* 쇼핑몰 목록 */}
      <div className="space-y-4">
        {shoppingMalls.map(mall => (
          <div key={mall.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h3 className="text-lg font-semibold">{mall.name}</h3>
                  <span className="px-2 py-1 bg-gray-100 text-gray-700 text-sm rounded">
                    {mall.platform}
                  </span>
                  <span className={`px-2 py-1 text-sm rounded ${
                    mall.isActive 
                      ? 'bg-green-100 text-green-700' 
                      : 'bg-red-100 text-red-700'
                  }`}>
                    {mall.isActive ? '활성' : '비활성'}
                  </span>
                </div>
                <div className="text-sm text-gray-600">
                  <span className="font-medium">수수료율: {mall.commissionRate}%</span>
                  <span className="mx-2">•</span>
                  <span>등록일: {mall.createdAt}</span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => toggleActive(mall.id)}
                  className={`px-3 py-1 text-sm rounded ${
                    mall.isActive
                      ? 'bg-red-100 text-red-700 hover:bg-red-200'
                      : 'bg-green-100 text-green-700 hover:bg-green-200'
                  }`}
                >
                  {mall.isActive ? '비활성화' : '활성화'}
                </button>
                <button
                  onClick={() => handleEdit(mall)}
                  className="px-3 py-1 bg-blue-100 text-blue-700 text-sm rounded hover:bg-blue-200"
                >
                  수정
                </button>
                <button
                  onClick={() => handleDelete(mall.id)}
                  className="px-3 py-1 bg-red-100 text-red-700 text-sm rounded hover:bg-red-200"
                >
                  삭제
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* 추가/수정 폼 */}
      {showAddForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl p-8 max-w-md w-full max-h-[90vh] overflow-y-auto">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">
              {editingMall ? '쇼핑몰 수정' : '신규 쇼핑몰 등록'}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  쇼핑몰명 <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="예: 스마트스토어"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  플랫폼 <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.platform}
                  onChange={(e) => setFormData({ ...formData, platform: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="예: 네이버"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  수수료율 (%) <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  step="0.1"
                  min="0"
                  max="100"
                  value={formData.commissionRate}
                  onChange={(e) => setFormData({ ...formData, commissionRate: Number(e.target.value) })}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="3.5"
                  required
                />
                <p className="text-xs text-gray-500 mt-1">
                  예: 3.5% 입력 시 고객 결제금액의 3.5%가 수수료로 차감됩니다
                </p>
              </div>
              <div className="flex gap-3 pt-4">
                <button
                  type="submit"
                  className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors"
                >
                  {editingMall ? '수정' : '등록'}
                </button>
                <button
                  type="button"
                  onClick={resetForm}
                  className="flex-1 px-6 py-3 bg-gray-500 text-white rounded-xl hover:bg-gray-600 transition-colors"
                >
                  취소
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 안내 메시지 */}
      <div className="mt-8 p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <h3 className="font-semibold text-blue-900 mb-2">💡 자동 수수료 계산 기능</h3>
        <ul className="text-sm text-blue-800 space-y-1">
          <li>• 쇼핑몰별 수수료율을 설정하면 예약 관리에서 자동으로 적용됩니다</li>
          <li>• 공급가 = 고객 결제금액 ÷ (1 + 수수료율/100)</li>
          <li>• 예: 수수료율 3.5%일 때, 100,000원 결제 → 공급가 96,618원</li>
        </ul>
      </div>
    </div>
  );
}


