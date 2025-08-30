import logger from './logger';

// 토스페이먼츠 결제 URL 상수
export const TOSS_PAYMENTS_API_URL = 'https://api.tosspayments.com/v1/payments';

// 결제 상태 타입
export enum PaymentStatus {
  READY = 'READY',
  IN_PROGRESS = 'IN_PROGRESS',
  WAITING_FOR_DEPOSIT = 'WAITING_FOR_DEPOSIT',
  DONE = 'DONE',
  CANCELED = 'CANCELED',
  PARTIAL_CANCELED = 'PARTIAL_CANCELED',
  ABORTED = 'ABORTED',
  EXPIRED = 'EXPIRED',
}

// 결제 요청 데이터 타입
export interface PaymentRequestData {
  amount: number;
  orderId: string;
  orderName: string;
  customerName: string;
  customerEmail?: string;
  successUrl: string;
  failUrl: string;
}

// 결제 응답 데이터 타입
export interface PaymentResponseData {
  mId: string;
  lastTransactionKey: string;
  paymentKey: string;
  orderId: string;
  orderName: string;
  status: PaymentStatus;
  requestedAt: string;
  approvedAt: string;
  useEscrow: boolean;
  cultureExpense: boolean;
  card?: {
    company: string;
    number: string;
    installmentPlanMonths: number;
    isInterestFree: boolean;
    approveNo: string;
    useCardPoint: boolean;
    cardType: string;
    ownerType: string;
    acquireStatus: string;
    receiptUrl: string;
  };
  virtualAccount?: any;
  transfer?: any;
  mobilePhone?: any;
  giftCertificate?: any;
  cashReceipt?: any;
  receipt: {
    url: string;
  };
  discount?: any;
  cancels?: any[];
  secret?: string;
  type: string;
  easyPay?: any;
  country: string;
  failure?: any;
  isPartialCancelable: boolean;
  currency: string;
  totalAmount: number;
  balanceAmount: number;
  suppliedAmount: number;
  vat: number;
  taxFreeAmount: number;
  method: string;
}

/**
 * 결제 승인 요청을 보냅니다.
 * @param paymentKey 결제 키
 * @param orderId 주문 ID
 * @param amount 결제 금액
 * @returns 결제 응답 데이터
 */
export const confirmPayment = async (
  paymentKey: string,
  orderId: string,
  amount: number
): Promise<PaymentResponseData> => {
  try {
    logger.info(`결제 승인 요청: ${paymentKey}, ${orderId}, ${amount}`);
    
    const secretKey = process.env.TOSS_PAYMENTS_SECRET_KEY;
    if (!secretKey) {
      throw new Error('토스페이먼츠 시크릿 키가 설정되지 않았습니다.');
    }
    
    // Authorization 헤더에 시크릿 키를 Base64로 인코딩하여 전송
    const auth = Buffer.from(`${secretKey}:`).toString('base64');
    
    const response = await fetch(`${TOSS_PAYMENTS_API_URL}/${paymentKey}`, {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${auth}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        orderId,
        amount,
      }),
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      logger.error(`결제 승인 실패: ${JSON.stringify(errorData)}`);
      throw new Error(`결제 승인 요청 실패: ${errorData.message || '알 수 없는 오류'}`);
    }
    
    const data = await response.json();
    logger.info(`결제 승인 성공: ${data.paymentKey}`);
    
    return data;
  } catch (error) {
    logger.error(`결제 승인 중 오류 발생: ${error instanceof Error ? error.message : String(error)}`);
    throw error;
  }
};

/**
 * 결제 취소 요청을 보냅니다.
 * @param paymentKey 결제 키
 * @param cancelReason 취소 사유
 * @returns 취소 응답 데이터
 */
export const cancelPayment = async (
  paymentKey: string,
  cancelReason: string
): Promise<PaymentResponseData> => {
  try {
    logger.info(`결제 취소 요청: ${paymentKey}, ${cancelReason}`);
    
    const secretKey = process.env.TOSS_PAYMENTS_SECRET_KEY;
    if (!secretKey) {
      throw new Error('토스페이먼츠 시크릿 키가 설정되지 않았습니다.');
    }
    
    // Authorization 헤더에 시크릿 키를 Base64로 인코딩하여 전송
    const auth = Buffer.from(`${secretKey}:`).toString('base64');
    
    const response = await fetch(`${TOSS_PAYMENTS_API_URL}/${paymentKey}/cancel`, {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${auth}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        cancelReason,
      }),
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      logger.error(`결제 취소 실패: ${JSON.stringify(errorData)}`);
      throw new Error(`결제 취소 요청 실패: ${errorData.message || '알 수 없는 오류'}`);
    }
    
    const data = await response.json();
    logger.info(`결제 취소 성공: ${data.paymentKey}`);
    
    return data;
  } catch (error) {
    logger.error(`결제 취소 중 오류 발생: ${error instanceof Error ? error.message : String(error)}`);
    throw error;
  }
}; 