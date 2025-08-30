'use client';

import { useState, useEffect } from 'react';
// xlsx는 필요한 시점에만 동적 import (서버 번들에서 제외)

interface VATSettings {
  id: string;
  companyName: string;
  businessNumber: string;
  representativeName: string;
  address: string;
  phone: string;
  email: string;
  vatRate: number;
  isActive: boolean;
}

interface VATTransaction {
  id: string;
  transactionType: string;
  transactionDate: string;
  description: string;
  supplyAmount: number;
  vatAmount: number;
  totalAmount: number;
  documentNumber?: string;
  partnerName?: string;
  partnerNumber?: string;
  booking?: {
    id: string;
    guestName: string;
    totalAmount: number;
  };
}

interface VATReport {
  id: string;
  reportType: string;
  reportPeriod: string;
  startDate: string;
  endDate: string;
  totalSupply: number;
  totalVAT: number;
  totalPurchase: number;
  totalPurchaseVAT: number;
  netVAT: number;
  status: string;
  createdAt: string;
}

export default function VATManagementPage() {
  const [activeTab, setActiveTab] = useState('settings');
  const [vatSettings, setVatSettings] = useState<VATSettings | null>(null);
  const [transactions, setTransactions] = useState<VATTransaction[]>([]);
  const [reports, setReports] = useState<VATReport[]>([]);
  const [loading, setLoading] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [showTransactionModal, setShowTransactionModal] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);

  // 설정 폼 상태
  const [settingsForm, setSettingsForm] = useState({
    companyName: '',
    businessNumber: '',
    representativeName: '',
    address: '',
    phone: '',
    email: '',
    vatRate: 10.0
  });

  // 거래 폼 상태
  const [transactionForm, setTransactionForm] = useState({
    transactionType: 'SALES',
    transactionDate: new Date().toISOString().split('T')[0],
    description: '',
    supplyAmount: 0,
    vatAmount: 0,
    totalAmount: 0,
    documentNumber: '',
    partnerName: '',
    partnerNumber: ''
  });

  // 신고서 폼 상태
  const [reportForm, setReportForm] = useState({
    reportType: 'MONTHLY',
    reportPeriod: '',
    startDate: new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0]
  });

  // 부가세 설정 조회
  const fetchVATSettings = async () => {
    try {
      const response = await fetch('/api/admin/vat-settings');
      const data = await response.json();
      if (data.id) {
        setVatSettings(data);
        setSettingsForm({
          companyName: data.companyName,
          businessNumber: data.businessNumber,
          representativeName: data.representativeName,
          address: data.address,
          phone: data.phone,
          email: data.email,
          vatRate: data.vatRate
        });
      }
    } catch (error) {
      console.error('부가세 설정 조회 실패:', error);
    }
  };

  // 부가세 거래 목록 조회
  const fetchTransactions = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/admin/vat-transactions');
      const data = await response.json();
      setTransactions(data.transactions || []);
    } catch (error) {
      console.error('부가세 거래 조회 실패:', error);
    } finally {
      setLoading(false);
    }
  };

  // 부가세 신고서 목록 조회
  const fetchReports = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/admin/vat-reports');
      const data = await response.json();
      setReports(data.reports || []);
    } catch (error) {
      console.error('부가세 신고서 조회 실패:', error);
    } finally {
      setLoading(false);
    }
  };

  // 부가세 설정 저장
  const handleSettingsSubmit = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/admin/vat-settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settingsForm)
      });

      if (response.ok) {
        await fetchVATSettings();
        setShowSettingsModal(false);
        alert('부가세 설정이 저장되었습니다.');
      } else {
        const error = await response.json();
        alert(error.error || '저장에 실패했습니다.');
      }
    } catch (error) {
      console.error('부가세 설정 저장 실패:', error);
      alert('저장에 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  // 부가세 거래 생성
  const handleTransactionSubmit = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/admin/vat-transactions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(transactionForm)
      });

      if (response.ok) {
        await fetchTransactions();
        setShowTransactionModal(false);
        setTransactionForm({
          transactionType: 'SALES',
          transactionDate: new Date().toISOString().split('T')[0],
          description: '',
          supplyAmount: 0,
          vatAmount: 0,
          totalAmount: 0,
          documentNumber: '',
          partnerName: '',
          partnerNumber: ''
        });
        alert('부가세 거래가 생성되었습니다.');
      } else {
        const error = await response.json();
        alert(error.error || '생성에 실패했습니다.');
      }
    } catch (error) {
      console.error('부가세 거래 생성 실패:', error);
      alert('생성에 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  // 부가세 신고서 생성
  const handleReportSubmit = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/admin/vat-reports', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(reportForm)
      });

      if (response.ok) {
        await fetchReports();
        setShowReportModal(false);
        alert('부가세 신고서가 생성되었습니다.');
      } else {
        const error = await response.json();
        alert(error.error || '생성에 실패했습니다.');
      }
    } catch (error) {
      console.error('부가세 신고서 생성 실패:', error);
      alert('생성에 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  // 부가세 계산
  const calculateVAT = (supplyAmount: number) => {
    const vatRate = vatSettings?.vatRate || 10.0;
    return Math.round(supplyAmount * (vatRate / 100));
  };

  // 금액 포맷팅
  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('ko-KR').format(num);
  };

  // 날짜 포맷팅
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ko-KR');
  };

  useEffect(() => {
    fetchVATSettings();
    fetchTransactions();
    fetchReports();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">부가세 관리</h1>
          <p className="text-gray-600">여행사 부가세 설정, 거래 관리, 신고서 생성</p>
        </div>

        {/* 탭 네비게이션 */}
        <div className="bg-white rounded-xl shadow-sm mb-6">
          <div className="flex border-b">
            <button
              onClick={() => setActiveTab('settings')}
              className={`px-6 py-4 font-medium transition-colors ${
                activeTab === 'settings'
                  ? 'text-blue-600 border-b-2 border-blue-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              부가세 설정
            </button>
            <button
              onClick={() => setActiveTab('transactions')}
              className={`px-6 py-4 font-medium transition-colors ${
                activeTab === 'transactions'
                  ? 'text-blue-600 border-b-2 border-blue-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              거래 관리
            </button>
            <button
              onClick={() => setActiveTab('reports')}
              className={`px-6 py-4 font-medium transition-colors ${
                activeTab === 'reports'
                  ? 'text-blue-600 border-b-2 border-blue-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              신고서 관리
            </button>
          </div>
        </div>

        {/* 부가세 설정 탭 */}
        {activeTab === 'settings' && (
          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold text-gray-900">부가세 설정</h2>
              <button
                onClick={() => setShowSettingsModal(true)}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                {vatSettings ? '설정 수정' : '설정 등록'}
              </button>
            </div>

            {vatSettings ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="font-medium text-gray-900 mb-2">회사 정보</h3>
                  <p className="text-sm text-gray-600">회사명: {vatSettings.companyName}</p>
                  <p className="text-sm text-gray-600">사업자번호: {vatSettings.businessNumber}</p>
                  <p className="text-sm text-gray-600">대표자: {vatSettings.representativeName}</p>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="font-medium text-gray-900 mb-2">연락처</h3>
                  <p className="text-sm text-gray-600">주소: {vatSettings.address}</p>
                  <p className="text-sm text-gray-600">전화: {vatSettings.phone}</p>
                  <p className="text-sm text-gray-600">이메일: {vatSettings.email}</p>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="font-medium text-gray-900 mb-2">부가세율</h3>
                  <p className="text-2xl font-bold text-blue-600">{vatSettings.vatRate}%</p>
                </div>
              </div>
            ) : (
              <div className="text-center py-12">
                <p className="text-gray-500 mb-4">부가세 설정이 등록되지 않았습니다.</p>
                <button
                  onClick={() => setShowSettingsModal(true)}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  설정 등록
                </button>
              </div>
            )}
          </div>
        )}

        {/* 거래 관리 탭 */}
        {activeTab === 'transactions' && (
          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold text-gray-900">부가세 거래 관리</h2>
              <button
                onClick={() => setShowTransactionModal(true)}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                거래 등록
              </button>
            </div>

            {loading ? (
              <div className="text-center py-8">
                <p className="text-gray-500">로딩 중...</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-3 px-4">거래일</th>
                      <th className="text-left py-3 px-4">구분</th>
                      <th className="text-left py-3 px-4">내용</th>
                      <th className="text-right py-3 px-4">공급가액</th>
                      <th className="text-right py-3 px-4">부가세</th>
                      <th className="text-right py-3 px-4">합계</th>
                      <th className="text-left py-3 px-4">거래처</th>
                    </tr>
                  </thead>
                  <tbody>
                    {transactions.map((transaction) => (
                      <tr key={transaction.id} className="border-b hover:bg-gray-50">
                        <td className="py-3 px-4">{formatDate(transaction.transactionDate)}</td>
                        <td className="py-3 px-4">
                          <span className={`px-2 py-1 rounded text-xs ${
                            transaction.transactionType === 'SALES' 
                              ? 'bg-blue-100 text-blue-800' 
                              : 'bg-green-100 text-green-800'
                          }`}>
                            {transaction.transactionType === 'SALES' ? '매출' : '매입'}
                          </span>
                        </td>
                        <td className="py-3 px-4">{transaction.description}</td>
                        <td className="py-3 px-4 text-right">{formatNumber(transaction.supplyAmount)}원</td>
                        <td className="py-3 px-4 text-right">{formatNumber(transaction.vatAmount)}원</td>
                        <td className="py-3 px-4 text-right font-medium">{formatNumber(transaction.totalAmount)}원</td>
                        <td className="py-3 px-4">{transaction.partnerName || '-'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* 신고서 관리 탭 */}
        {activeTab === 'reports' && (
          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold text-gray-900">부가세 신고서 관리</h2>
              <button
                onClick={() => setShowReportModal(true)}
                className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
              >
                신고서 생성
              </button>
            </div>

            {loading ? (
              <div className="text-center py-8">
                <p className="text-gray-500">로딩 중...</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-3 px-4">신고기간</th>
                      <th className="text-left py-3 px-4">구분</th>
                      <th className="text-right py-3 px-4">공급가액</th>
                      <th className="text-right py-3 px-4">공급세액</th>
                      <th className="text-right py-3 px-4">매입가액</th>
                      <th className="text-right py-3 px-4">매입세액</th>
                      <th className="text-right py-3 px-4">납부세액</th>
                      <th className="text-left py-3 px-4">상태</th>
                    </tr>
                  </thead>
                  <tbody>
                    {reports.map((report) => (
                      <tr key={report.id} className="border-b hover:bg-gray-50">
                        <td className="py-3 px-4">{report.reportPeriod}</td>
                        <td className="py-3 px-4">
                          <span className="px-2 py-1 rounded text-xs bg-purple-100 text-purple-800">
                            {report.reportType === 'MONTHLY' ? '월간' : 
                             report.reportType === 'QUARTERLY' ? '분기' : '연간'}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-right">{formatNumber(report.totalSupply)}원</td>
                        <td className="py-3 px-4 text-right">{formatNumber(report.totalVAT)}원</td>
                        <td className="py-3 px-4 text-right">{formatNumber(report.totalPurchase)}원</td>
                        <td className="py-3 px-4 text-right">{formatNumber(report.totalPurchaseVAT)}원</td>
                        <td className="py-3 px-4 text-right font-medium">{formatNumber(report.netVAT)}원</td>
                        <td className="py-3 px-4">
                          <span className={`px-2 py-1 rounded text-xs ${
                            report.status === 'DRAFT' 
                              ? 'bg-gray-100 text-gray-800'
                              : report.status === 'SUBMITTED'
                              ? 'bg-yellow-100 text-yellow-800'
                              : 'bg-green-100 text-green-800'
                          }`}>
                            {report.status === 'DRAFT' ? '작성중' : 
                             report.status === 'SUBMITTED' ? '제출완료' : '승인완료'}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* 부가세 설정 모달 */}
        {showSettingsModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
              <h3 className="text-xl font-semibold mb-4">부가세 설정</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">회사명</label>
                  <input
                    type="text"
                    value={settingsForm.companyName}
                    onChange={(e) => setSettingsForm({...settingsForm, companyName: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">사업자등록번호</label>
                  <input
                    type="text"
                    value={settingsForm.businessNumber}
                    onChange={(e) => setSettingsForm({...settingsForm, businessNumber: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">대표자명</label>
                  <input
                    type="text"
                    value={settingsForm.representativeName}
                    onChange={(e) => setSettingsForm({...settingsForm, representativeName: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">부가세율 (%)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={settingsForm.vatRate}
                    onChange={(e) => setSettingsForm({...settingsForm, vatRate: parseFloat(e.target.value)})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">주소</label>
                  <input
                    type="text"
                    value={settingsForm.address}
                    onChange={(e) => setSettingsForm({...settingsForm, address: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">전화번호</label>
                  <input
                    type="text"
                    value={settingsForm.phone}
                    onChange={(e) => setSettingsForm({...settingsForm, phone: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">이메일</label>
                  <input
                    type="email"
                    value={settingsForm.email}
                    onChange={(e) => setSettingsForm({...settingsForm, email: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
              <div className="flex justify-end gap-2 mt-6">
                <button
                  onClick={() => setShowSettingsModal(false)}
                  className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  취소
                </button>
                <button
                  onClick={handleSettingsSubmit}
                  disabled={loading}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                >
                  {loading ? '저장 중...' : '저장'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* 부가세 거래 모달 */}
        {showTransactionModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
              <h3 className="text-xl font-semibold mb-4">부가세 거래 등록</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">거래구분</label>
                  <select
                    value={transactionForm.transactionType}
                    onChange={(e) => setTransactionForm({...transactionForm, transactionType: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="SALES">매출</option>
                    <option value="PURCHASE">매입</option>
                    <option value="ADJUSTMENT">조정</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">거래일</label>
                  <input
                    type="date"
                    value={transactionForm.transactionDate}
                    onChange={(e) => setTransactionForm({...transactionForm, transactionDate: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">거래내용</label>
                  <input
                    type="text"
                    value={transactionForm.description}
                    onChange={(e) => setTransactionForm({...transactionForm, description: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">공급가액</label>
                  <input
                    type="number"
                    value={transactionForm.supplyAmount}
                    onChange={(e) => {
                      const supplyAmount = parseFloat(e.target.value) || 0;
                      const vatAmount = calculateVAT(supplyAmount);
                      setTransactionForm({
                        ...transactionForm,
                        supplyAmount,
                        vatAmount,
                        totalAmount: supplyAmount + vatAmount
                      });
                    }}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">부가세</label>
                  <input
                    type="number"
                    value={transactionForm.vatAmount}
                    onChange={(e) => {
                      const vatAmount = parseFloat(e.target.value) || 0;
                      setTransactionForm({
                        ...transactionForm,
                        vatAmount,
                        totalAmount: transactionForm.supplyAmount + vatAmount
                      });
                    }}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">합계금액</label>
                  <input
                    type="number"
                    value={transactionForm.totalAmount}
                    readOnly
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">세금계산서번호</label>
                  <input
                    type="text"
                    value={transactionForm.documentNumber}
                    onChange={(e) => setTransactionForm({...transactionForm, documentNumber: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">거래처명</label>
                  <input
                    type="text"
                    value={transactionForm.partnerName}
                    onChange={(e) => setTransactionForm({...transactionForm, partnerName: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">거래처 사업자번호</label>
                  <input
                    type="text"
                    value={transactionForm.partnerNumber}
                    onChange={(e) => setTransactionForm({...transactionForm, partnerNumber: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
              <div className="flex justify-end gap-2 mt-6">
                <button
                  onClick={() => setShowTransactionModal(false)}
                  className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  취소
                </button>
                <button
                  onClick={handleTransactionSubmit}
                  disabled={loading}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
                >
                  {loading ? '등록 중...' : '등록'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* 부가세 신고서 모달 */}
        {showReportModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl p-6 w-full max-w-md">
              <h3 className="text-xl font-semibold mb-4">부가세 신고서 생성</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">신고구분</label>
                  <select
                    value={reportForm.reportType}
                    onChange={(e) => setReportForm({...reportForm, reportType: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="MONTHLY">월간</option>
                    <option value="QUARTERLY">분기</option>
                    <option value="YEARLY">연간</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">신고기간</label>
                  <input
                    type="text"
                    value={reportForm.reportPeriod}
                    onChange={(e) => setReportForm({...reportForm, reportPeriod: e.target.value})}
                    placeholder="예: 2024-01, 2024-Q1, 2024"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">시작일</label>
                  <input
                    type="date"
                    value={reportForm.startDate}
                    onChange={(e) => setReportForm({...reportForm, startDate: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">종료일</label>
                  <input
                    type="date"
                    value={reportForm.endDate}
                    onChange={(e) => setReportForm({...reportForm, endDate: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
              <div className="flex justify-end gap-2 mt-6">
                <button
                  onClick={() => setShowReportModal(false)}
                  className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  취소
                </button>
                <button
                  onClick={handleReportSubmit}
                  disabled={loading}
                  className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50"
                >
                  {loading ? '생성 중...' : '생성'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 