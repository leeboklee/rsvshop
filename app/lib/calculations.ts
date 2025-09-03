/**
 * 수익 및 부가세 계산 유틸리티 함수
 */

export interface PriceCalculationInput {
  sellingPrice?: number;    // 판매가
  supplyPrice?: number;     // 공급가
  commissionRate?: number;  // 수수료율 (%)
  vatRate?: number;         // 부가세율 (%)
}

export interface PriceCalculationResult {
  sellingPrice: number;     // 판매가
  supplyPrice: number;      // 공급가
  profit: number;           // 수익 (판매가 - 공급가)
  commission: number;       // 수수료
  commissionRate: number;   // 수수료율
  vatAmount: number;        // 부가세 금액
  vatRate: number;          // 부가세율
  netAmount: number;        // 순수익 (수익 - 수수료)
}

/**
 * 가격 계산 함수
 * @param input 가격 계산 입력값
 * @returns 계산된 가격 정보
 */
export function calculatePrices(input: PriceCalculationInput): PriceCalculationResult {
  const {
    sellingPrice = 0,
    supplyPrice = 0,
    commissionRate = 4, // 기본 수수료율 4%
    vatRate = 10        // 기본 부가세율 10%
  } = input;

  // 수익 계산 (판매가 - 공급가)
  const profit = Math.max(0, sellingPrice - supplyPrice);
  
  // 수수료 계산 (판매가의 수수료율%)
  const commission = (sellingPrice * commissionRate) / 100;
  
  // 부가세 계산 (공급가의 부가세율%)
  const vatAmount = (supplyPrice * vatRate) / 100;
  
  // 순수익 계산 (수익 - 수수료)
  const netAmount = Math.max(0, profit - commission);

  return {
    sellingPrice,
    supplyPrice,
    profit,
    commission,
    commissionRate,
    vatAmount,
    vatRate,
    netAmount
  };
}

/**
 * 금액을 천 단위 콤마로 포맷팅
 * @param amount 금액
 * @returns 포맷팅된 금액 문자열
 */
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('ko-KR').format(amount);
}

/**
 * 백분율을 포맷팅
 * @param rate 비율
 * @returns 포맷팅된 비율 문자열
 */
export function formatPercentage(rate: number): string {
  return `${rate.toFixed(1)}%`;
}

/**
 * 예약 데이터에서 가격 정보 추출 및 계산
 * @param booking 예약 데이터
 * @returns 계산된 가격 정보
 */
export function calculateBookingPrices(booking: any): PriceCalculationResult {
  return calculatePrices({
    sellingPrice: booking.sellingPrice || booking.totalAmount || 0,
    supplyPrice: booking.supplyPrice || 0,
    commissionRate: booking.commissionRate || 4,
    vatRate: booking.vatRate || 10
  });
}

/**
 * 수익률 계산
 * @param profit 수익
 * @param sellingPrice 판매가
 * @returns 수익률 (%)
 */
export function calculateProfitMargin(profit: number, sellingPrice: number): number {
  if (sellingPrice === 0) return 0;
  return (profit / sellingPrice) * 100;
}

/**
 * ROI (투자수익률) 계산
 * @param profit 수익
 * @param supplyPrice 공급가
 * @returns ROI (%)
 */
export function calculateROI(profit: number, supplyPrice: number): number {
  if (supplyPrice === 0) return 0;
  return (profit / supplyPrice) * 100;
}
