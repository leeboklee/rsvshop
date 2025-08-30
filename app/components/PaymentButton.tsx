'use client';

import { useEffect, useState } from 'react';
import Script from 'next/script';

interface PaymentButtonProps {
  amount: number;
  orderId: string;
  orderName: string;
  customerName: string;
  customerEmail?: string;
  successUrl: string;
  failUrl: string;
  buttonText?: string;
  className?: string;
}

export default function PaymentButton({
  amount,
  orderId,
  orderName,
  customerName,
  customerEmail,
  successUrl,
  failUrl,
  buttonText = '결제하기',
  className = 'bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded',
}: PaymentButtonProps) {
  const [loading, setLoading] = useState(false);

  // 결제 요청 처리
  const handlePayment = () => {
    try {
      setLoading(true);
      console.log(`결제 요청 시작: ${orderId}, ${amount}원`);

      // @ts-ignore - 전역 window에 tossPayments가 추가됨
      const tossPayments = window.TossPayments;
      
      if (!tossPayments) {
        alert('결제 모듈이 로드되지 않았습니다. 페이지를 새로고침 후 다시 시도해주세요.');
        setLoading(false);
        return;
      }

      // 토스페이먼츠로 결제 요청
      tossPayments.requestPayment('카드', {
        amount,
        orderId,
        orderName,
        customerName,
        customerEmail,
        successUrl: `${window.location.origin}${successUrl}`,
        failUrl: `${window.location.origin}${failUrl}`,
      }).catch(error => {
        console.error('결제 요청 중 오류:', error);
        alert(`결제 중 오류가 발생했습니다: ${error.message || '알 수 없는 오류'}`);
        setLoading(false);
      });
    } catch (error) {
      console.error(`결제 요청 중 오류: ${error instanceof Error ? error.message : String(error)}`);
      alert(`결제 중 오류가 발생했습니다: ${error instanceof Error ? error.message : '알 수 없는 오류'}`);
      setLoading(false);
    }
  };

  return (
    <>
      <Script
        src="https://js.tosspayments.com/v1"
        strategy="afterInteractive"
        onLoad={() => {
          // @ts-ignore - TossPayments 초기화
          window.TossPayments = new window.TossPayments(process.env.NEXT_PUBLIC_TOSS_PAYMENTS_CLIENT_KEY || '');
          console.log('토스페이먼츠 스크립트가 로드되었습니다.');
        }}
        onError={() => {
          console.error('토스페이먼츠 스크립트 로드 실패');
        }}
      />
      <button
        onClick={handlePayment}
        disabled={loading}
        className={`${className} ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
      >
        {loading ? '처리 중...' : buttonText}
      </button>
    </>
  );
} 