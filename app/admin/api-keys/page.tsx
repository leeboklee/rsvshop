'use client';

import { useState, useEffect } from 'react';
import Card from '@/app/components/common/Card';

interface ApiKey {
  id: string;
  name: string;
  permissions: string[];
  isActive: boolean;
  createdAt: string;
  lastUsed?: string;
}

export default function ApiKeysPage() {
  const [apiKeys, setApiKeys] = useState<ApiKey[]>([]);
  const [loading, setLoading] = useState(true);
  const [newKeyName, setNewKeyName] = useState('');
  const [newKeyPermissions, setNewKeyPermissions] = useState<string[]>(['reservations.read']);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newlyCreatedKey, setNewlyCreatedKey] = useState<string>('');

  const availablePermissions = [
    'reservations.read',
    'reservations.write',
    'rooms.read',
    'packages.read',
  ];

  useEffect(() => {
    fetchApiKeys();
  }, []);

  const fetchApiKeys = async () => {
    try {
      const response = await fetch('/api/admin/api-keys');
      const data = await response.json();
      if (data.success) {
        setApiKeys(data.data);
      }
    } catch (error) {
      console.error('API 키 목록 조회 실패:', error);
    } finally {
      setLoading(false);
    }
  };

  const createApiKey = async () => {
    if (!newKeyName.trim()) {
      alert('API 키 이름을 입력해주세요.');
      return;
    }

    try {
      const response = await fetch('/api/admin/api-keys', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: newKeyName,
          permissions: newKeyPermissions,
        }),
      });

      const data = await response.json();
      if (data.success) {
        setNewlyCreatedKey(data.data.key);
        setNewKeyName('');
        setNewKeyPermissions(['reservations.read']);
        setShowCreateForm(false);
        fetchApiKeys();
      } else {
        alert(data.error || 'API 키 생성에 실패했습니다.');
      }
    } catch (error) {
      console.error('API 키 생성 실패:', error);
      alert('API 키 생성에 실패했습니다.');
    }
  };

  const deleteApiKey = async (key: string) => {
    if (!confirm('정말로 이 API 키를 삭제하시겠습니까?')) {
      return;
    }

    try {
      const response = await fetch(`/api/admin/api-keys?key=${key}`, {
        method: 'DELETE',
      });

      const data = await response.json();
      if (data.success) {
        fetchApiKeys();
      } else {
        alert(data.error || 'API 키 삭제에 실패했습니다.');
      }
    } catch (error) {
      console.error('API 키 삭제 실패:', error);
      alert('API 키 삭제에 실패했습니다.');
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    alert('클립보드에 복사되었습니다.');
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="text-center">로딩 중...</div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold mb-2">API 키 관리</h1>
        <p className="text-gray-600">외부 페이지에서 예약 시스템을 사용할 수 있는 API 키를 관리합니다.</p>
      </div>

      {/* 새로 생성된 API 키 표시 */}
      {newlyCreatedKey && (
        <Card className="mb-6 bg-green-50 border-green-200">
          <div className="p-4">
            <h3 className="text-lg font-semibold text-green-800 mb-2">새 API 키가 생성되었습니다!</h3>
            <div className="bg-white p-3 rounded border font-mono text-sm break-all">
              {newlyCreatedKey}
            </div>
            <div className="mt-3 flex gap-2">
              <button
                onClick={() => copyToClipboard(newlyCreatedKey)}
                className="px-3 py-1 bg-green-600 text-white rounded text-sm hover:bg-green-700"
              >
                복사
              </button>
              <button
                onClick={() => setNewlyCreatedKey('')}
                className="px-3 py-1 bg-gray-600 text-white rounded text-sm hover:bg-gray-700"
              >
                닫기
              </button>
            </div>
            <p className="text-sm text-green-700 mt-2">
              ⚠️ 이 키는 한 번만 표시됩니다. 안전한 곳에 저장해주세요.
            </p>
          </div>
        </Card>
      )}

      {/* 새 API 키 생성 */}
      <Card className="mb-6">
        <div className="p-4">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold">새 API 키 생성</h2>
            <button
              onClick={() => setShowCreateForm(!showCreateForm)}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              {showCreateForm ? '취소' : '새 키 생성'}
            </button>
          </div>

          {showCreateForm && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">API 키 이름</label>
                <input
                  type="text"
                  value={newKeyName}
                  onChange={(e) => setNewKeyName(e.target.value)}
                  className="w-full p-2 border rounded"
                  placeholder="예: 웹사이트 A, 모바일 앱 등"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">권한</label>
                <div className="space-y-2">
                  {availablePermissions.map((permission) => (
                    <label key={permission} className="flex items-center">
                      <input
                        type="checkbox"
                        checked={newKeyPermissions.includes(permission)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setNewKeyPermissions([...newKeyPermissions, permission]);
                          } else {
                            setNewKeyPermissions(newKeyPermissions.filter(p => p !== permission));
                          }
                        }}
                        className="mr-2"
                      />
                      <span className="text-sm">{permission}</span>
                    </label>
                  ))}
                </div>
              </div>

              <button
                onClick={createApiKey}
                className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
              >
                API 키 생성
              </button>
            </div>
          )}
        </div>
      </Card>

      {/* API 키 목록 */}
      <Card>
        <div className="p-4">
          <h2 className="text-lg font-semibold mb-4">API 키 목록</h2>
          
          {apiKeys.length === 0 ? (
            <p className="text-gray-500 text-center py-8">생성된 API 키가 없습니다.</p>
          ) : (
            <div className="space-y-4">
              {apiKeys.map((apiKey) => (
                <div key={apiKey.id} className="border rounded p-4">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <h3 className="font-semibold">{apiKey.name}</h3>
                      <p className="text-sm text-gray-600 mt-1">
                        생성일: {new Date(apiKey.createdAt).toLocaleDateString()}
                      </p>
                      {apiKey.lastUsed && (
                        <p className="text-sm text-gray-600">
                          마지막 사용: {new Date(apiKey.lastUsed).toLocaleDateString()}
                        </p>
                      )}
                      <div className="mt-2">
                        <span className="text-sm font-medium">권한:</span>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {apiKey.permissions.map((permission) => (
                            <span
                              key={permission}
                              className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded"
                            >
                              {permission}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <span className={`px-2 py-1 text-xs rounded ${
                        apiKey.isActive 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {apiKey.isActive ? '활성' : '비활성'}
                      </span>
                      <button
                        onClick={() => deleteApiKey(apiKey.id)}
                        className="px-3 py-1 bg-red-600 text-white rounded text-sm hover:bg-red-700"
                      >
                        삭제
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </Card>

      {/* 사용법 안내 */}
      <Card className="mt-6">
        <div className="p-4">
          <h2 className="text-lg font-semibold mb-4">API 사용법</h2>
          <div className="space-y-4 text-sm">
            <div>
              <h3 className="font-medium mb-2">예약 목록 조회</h3>
              <code className="bg-gray-100 p-2 rounded block">
                GET /api/external/reservations?apiKey=YOUR_API_KEY
              </code>
            </div>
            <div>
              <h3 className="font-medium mb-2">예약 생성</h3>
              <code className="bg-gray-100 p-2 rounded block">
                POST /api/external/reservations<br/>
                Authorization: Bearer YOUR_API_KEY
              </code>
            </div>
            <div>
              <h3 className="font-medium mb-2">객실 목록 조회</h3>
              <code className="bg-gray-100 p-2 rounded block">
                GET /api/external/rooms?apiKey=YOUR_API_KEY
              </code>
            </div>
            <div>
              <h3 className="font-medium mb-2">패키지 목록 조회</h3>
              <code className="bg-gray-100 p-2 rounded block">
                GET /api/external/packages?apiKey=YOUR_API_KEY
              </code>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
} 