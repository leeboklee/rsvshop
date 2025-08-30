'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

interface Package {
  id: string;
  name: string;
  description: string;
  price: number;
  roomId: string;
  createdAt: string;
  room: {
    id: string;
    name: string;
  };
}

export default function PackagesManagement() {
  const [packages, setPackages] = useState<Package[]>([]);
  const [rooms, setRooms] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [showEditForm, setShowEditForm] = useState(false);
  const [editingPackage, setEditingPackage] = useState<Package | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [newPackage, setNewPackage] = useState({
    name: '',
    description: '',
    price: 0,
    roomId: ''
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [packagesRes, roomsRes] = await Promise.all([
        fetch('/api/packages'),
        fetch('/api/rooms')
      ]);
      
      if (!packagesRes.ok) {
        throw new Error(`패키지 데이터 로딩 실패: ${packagesRes.status}`);
      }
      if (!roomsRes.ok) {
        throw new Error(`객실 데이터 로딩 실패: ${roomsRes.status}`);
      }
      
      const packagesData = await packagesRes.json();
      const roomsData = await roomsRes.json();
      
      // API 응답 형식에 맞게 데이터 추출
      if (packagesData.success && Array.isArray(packagesData.packages)) {
        setPackages(packagesData.packages);
      } else {
        console.error('패키지 API 응답 형식 오류:', packagesData);
        setPackages([]);
      }
      
      if (roomsData.success && Array.isArray(roomsData.rooms)) {
        setRooms(roomsData.rooms);
      } else {
        console.error('객실 API 응답 형식 오류:', roomsData);
        setRooms([]);
      }
    } catch (error) {
      console.error('데이터 로딩 실패:', error);
      setError(error instanceof Error ? error.message : '데이터 로딩에 실패했습니다.');
      setPackages([]);
      setRooms([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    setSuccess(null);

    // 유효성 검사
    if (!newPackage.name.trim()) {
      setError('패키지명을 입력해주세요.');
      setSubmitting(false);
      return;
    }
    if (!newPackage.description.trim()) {
      setError('패키지 설명을 입력해주세요.');
      setSubmitting(false);
      return;
    }
    if (newPackage.price <= 0) {
      setError('가격을 올바르게 입력해주세요.');
      setSubmitting(false);
      return;
    }
    if (!newPackage.roomId) {
      setError('객실을 선택해주세요.');
      setSubmitting(false);
      return;
    }

    try {
      let response;
      let data;

      if (showEditForm && editingPackage) {
        // 수정 모드
        response = await fetch(`/api/packages/${editingPackage.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(newPackage),
        });
        data = await response.json();

        if (response.ok && data.success) {
          setSuccess('패키지가 성공적으로 수정되었습니다!');
          resetForm();
          fetchData();
          setTimeout(() => setSuccess(null), 3000);
        } else {
          throw new Error(data.error || `패키지 수정 실패: ${response.status}`);
        }
      } else {
        // 등록 모드
        response = await fetch('/api/packages', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(newPackage),
        });
        data = await response.json();

        if (response.ok && data.success) {
          setSuccess('패키지가 성공적으로 등록되었습니다!');
          setNewPackage({ name: '', description: '', price: 0, roomId: '' });
          setShowAddForm(false);
          fetchData();
          setTimeout(() => setSuccess(null), 3000);
        } else {
          throw new Error(data.error || `패키지 등록 실패: ${response.status}`);
        }
      }
    } catch (error) {
      console.error('패키지 처리 실패:', error);
      setError(error instanceof Error ? error.message : '패키지 처리에 실패했습니다.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (pkg: Package) => {
    setEditingPackage(pkg);
    setNewPackage({
      name: pkg.name,
      description: pkg.description,
      price: pkg.price,
      roomId: pkg.roomId
    });
    setShowEditForm(true);
  };

  const handleDelete = async (packageId: string) => {
    if (!confirm('정말 삭제하시겠습니까?')) return;
    
    try {
      const response = await fetch(`/api/packages/${packageId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setSuccess('패키지가 삭제되었습니다.');
        fetchData();
        setTimeout(() => setSuccess(null), 3000);
      } else {
        throw new Error(`삭제 실패: ${response.status}`);
      }
    } catch (error) {
      console.error('패키지 삭제 실패:', error);
      setError(error instanceof Error ? error.message : '패키지 삭제에 실패했습니다.');
    }
  };

  const resetForm = () => {
    setNewPackage({ name: '', description: '', price: 0, roomId: '' });
    setEditingPackage(null);
    setError(null);
    setSuccess(null);
    setShowAddForm(false);
    setShowEditForm(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-purple-50 to-indigo-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* 헤더 */}
        <div className="mb-8">
          <div className="flex justify-between items-start mb-4">
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-purple-700 bg-clip-text text-transparent mb-2">
                패키지 관리
              </h1>
              <p className="text-gray-600 text-lg">패키지를 등록하고 관리하세요</p>
            </div>
            <div className="flex gap-3">
              <Link href="/admin/reservations" className="px-6 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl hover:from-blue-600 hover:to-blue-700 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1">
                예약 관리
              </Link>
              <Link href="/admin/rooms" className="px-6 py-3 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-xl hover:from-green-600 hover:to-green-700 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1">
                객실 관리
              </Link>
              <Link href="/admin/rooms/1/packages" className="px-6 py-3 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-xl hover:from-orange-600 hover:to-orange-700 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1">
                객실별 패키지
              </Link>
              <button
                onClick={() => setShowAddForm(true)}
                className="px-6 py-3 bg-gradient-to-r from-purple-500 to-purple-600 text-white rounded-xl hover:from-purple-600 hover:to-purple-700 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1"
              >
                신규 패키지 등록
              </button>
            </div>
          </div>
        </div>

        {/* 알림 메시지 */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl">
            <div className="flex items-center">
              <svg className="w-5 h-5 text-red-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span className="text-red-700 font-medium">{error}</span>
            </div>
          </div>
        )}

        {success && (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-xl">
            <div className="flex items-center">
              <svg className="w-5 h-5 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span className="text-green-700 font-medium">{success}</span>
            </div>
          </div>
        )}

        {/* 패키지 목록 */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.isArray(packages) && packages.length > 0 ? (
            packages.map((pkg) => (
              <div key={pkg.id} className="bg-white/80 backdrop-blur-sm p-6 rounded-2xl shadow-xl border border-white/20 hover:shadow-2xl transition-all duration-300">
                <div className="flex justify-between items-start mb-4">
                  <h3 className="text-xl font-bold text-gray-800">{pkg.name}</h3>
                  <span className="text-2xl font-bold text-purple-600">
                    {pkg.price?.toLocaleString() || '0'}원
                  </span>
                </div>
                <p className="text-gray-600 mb-4">{pkg.description}</p>
                <div className="flex justify-between items-center mb-4">
                  <span className="text-sm text-gray-500">객실: {pkg.room?.name || 'N/A'}</span>
                  <span className="text-sm text-gray-500">
                    {pkg.createdAt ? new Date(pkg.createdAt).toLocaleDateString() : 'N/A'}
                  </span>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleEdit(pkg)}
                    className="flex-1 px-4 py-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg hover:from-blue-600 hover:to-blue-700 transition-all duration-300"
                  >
                    수정
                  </button>
                  <button
                    onClick={() => handleDelete(pkg.id)}
                    className="flex-1 px-4 py-2 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-lg hover:from-red-600 hover:to-red-700 transition-all duration-300"
                  >
                    삭제
                  </button>
                </div>
              </div>
            ))
          ) : loading ? (
            // 로딩 상태
            Array.from({ length: 3 }).map((_, index) => (
              <div key={index} className="bg-white/80 backdrop-blur-sm p-6 rounded-2xl shadow-xl border border-white/20">
                <div className="animate-pulse">
                  <div className="h-6 bg-gray-200 rounded mb-4"></div>
                  <div className="h-4 bg-gray-200 rounded mb-2"></div>
                  <div className="h-4 bg-gray-200 rounded mb-4"></div>
                  <div className="h-4 bg-gray-200 rounded mb-4"></div>
                  <div className="h-10 bg-gray-200 rounded"></div>
                </div>
              </div>
            ))
          ) : (
            // 빈 상태
            <div className="col-span-full text-center py-12">
              <div className="text-gray-500">
                <svg className="mx-auto h-12 w-12 text-gray-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                </svg>
                <p className="text-lg font-medium">등록된 패키지가 없습니다</p>
                <p className="text-sm">새로운 패키지를 추가해보세요</p>
              </div>
            </div>
          )}
        </div>

        {/* 패키지 추가 폼 */}
        {showAddForm && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-2xl p-8 max-w-md w-full max-h-[90vh] overflow-y-auto">
              <h2 className="text-2xl font-bold text-gray-800 mb-6">신규 패키지 등록</h2>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">패키지명 <span className="text-red-500">*</span></label>
                  <input
                    type="text"
                    value={newPackage.name}
                    onChange={(e) => setNewPackage({ ...newPackage, name: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    placeholder="패키지 이름을 입력하세요"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">설명 <span className="text-red-500">*</span></label>
                  <textarea
                    value={newPackage.description}
                    onChange={(e) => setNewPackage({ ...newPackage, description: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    rows={3}
                    placeholder="패키지에 대한 설명을 입력하세요"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">가격 (원) <span className="text-red-500">*</span></label>
                  <input
                    type="number"
                    value={newPackage.price}
                    onChange={(e) => setNewPackage({ ...newPackage, price: parseInt(e.target.value) || 0 })}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    min="0"
                    placeholder="0"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">객실 선택 <span className="text-red-500">*</span></label>
                  <select
                    value={newPackage.roomId}
                    onChange={(e) => setNewPackage({ ...newPackage, roomId: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    required
                  >
                    <option value="">객실을 선택하세요</option>
                    {Array.isArray(rooms) && rooms.map((room) => (
                      <option key={room.id} value={room.id}>
                        {room.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="flex gap-3 pt-4">
                  <button
                    type="submit"
                    disabled={submitting}
                    className="flex-1 px-6 py-3 bg-gradient-to-r from-purple-500 to-purple-600 text-white rounded-xl hover:from-purple-600 hover:to-purple-700 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {submitting ? '등록 중...' : '등록'}
                  </button>
                  <button
                    type="button"
                    onClick={resetForm}
                    className="flex-1 px-6 py-3 bg-gray-500 text-white rounded-xl hover:bg-gray-600 transition-all duration-300"
                  >
                    취소
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* 패키지 수정 폼 */}
        {showEditForm && editingPackage && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-2xl p-8 max-w-md w-full max-h-[90vh] overflow-y-auto">
              <h2 className="text-2xl font-bold text-gray-800 mb-6">패키지 수정</h2>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">패키지명 <span className="text-red-500">*</span></label>
                  <input
                    type="text"
                    value={newPackage.name}
                    onChange={(e) => setNewPackage({ ...newPackage, name: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    placeholder="패키지 이름을 입력하세요"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">설명 <span className="text-red-500">*</span></label>
                  <textarea
                    value={newPackage.description}
                    onChange={(e) => setNewPackage({ ...newPackage, description: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    rows={3}
                    placeholder="패키지에 대한 설명을 입력하세요"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">가격 (원) <span className="text-red-500">*</span></label>
                  <input
                    type="number"
                    value={newPackage.price}
                    onChange={(e) => setNewPackage({ ...newPackage, price: parseInt(e.target.value) || 0 })}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    min="0"
                    placeholder="0"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">객실 선택 <span className="text-red-500">*</span></label>
                  <select
                    value={newPackage.roomId}
                    onChange={(e) => setNewPackage({ ...newPackage, roomId: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    required
                  >
                    <option value="">객실을 선택하세요</option>
                    {Array.isArray(rooms) && rooms.map((room) => (
                      <option key={room.id} value={room.id}>
                        {room.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="flex gap-3 pt-4">
                  <button
                    type="submit"
                    disabled={submitting}
                    className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl hover:from-blue-600 hover:to-blue-700 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {submitting ? '수정 중...' : '수정'}
                  </button>
                  <button
                    type="button"
                    onClick={resetForm}
                    className="flex-1 px-6 py-3 bg-gray-500 text-white rounded-xl hover:bg-gray-600 transition-all duration-300"
                  >
                    취소
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 