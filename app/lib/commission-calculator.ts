/**
 * 쇼핑몰 수수료 계산 유틸리티
 */

export interface CommissionCalculation {
  customerPrice: number;      // 고객 결제금액
  commissionRate: number;     // 수수료율 (%)
  commissionAmount: number;   // 수수료 금액
  supplyPrice: number;        // 공급가 (수수료 제외)
  profitMargin: number;       // 마진
}

/**
 * 수수료율을 기반으로 공급가와 수수료를 계산
 * @param customerPrice 고객 결제금액
 * @param commissionRate 수수료율 (%)
 * @returns 계산된 수수료 정보
 */
export function calculateCommission(
  customerPrice: number, 
  commissionRate: number
): CommissionCalculation {
  // 수수료율을 소수점으로 변환 (예: 3.5% → 0.035)
  const rateDecimal = commissionRate / 100;
  
  // 공급가 계산: 고객 결제금액 ÷ (1 + 수수료율)
  const supplyPrice = customerPrice / (1 + rateDecimal);
  
  // 수수료 금액 계산
  const commissionAmount = customerPrice - supplyPrice;
  
  // 마진 계산 (공급가 대비 수수료 비율)
  const profitMargin = (commissionAmount / supplyPrice) * 100;
  
  return {
    customerPrice,
    commissionRate,
    commissionAmount: Math.round(commissionAmount),
    supplyPrice: Math.round(supplyPrice),
    profitMargin: Math.round(profitMargin * 100) / 100
  };
}

/**
 * 공급가를 기반으로 고객 결제금액을 계산 (역산)
 * @param supplyPrice 공급가
 * @param commissionRate 수수료율 (%)
 * @returns 계산된 고객 결제금액
 */
export function calculateCustomerPrice(
  supplyPrice: number, 
  commissionRate: number
): number {
  const rateDecimal = commissionRate / 100;
  return Math.round(supplyPrice * (1 + rateDecimal));
}

/**
 * 쇼핑몰별 수수료율에 따른 가격 계산 예시
 */
export function getPriceExamples(commissionRate: number): {
  examples: Array<{ supplyPrice: number; customerPrice: number; commission: number }>;
  summary: string;
} {
  const examples = [
    { supplyPrice: 10000, customerPrice: 0, commission: 0 },
    { supplyPrice: 50000, customerPrice: 0, commission: 0 },
    { supplyPrice: 100000, customerPrice: 0, commission: 0 },
    { supplyPrice: 200000, customerPrice: 0, commission: 0 }
  ];
  
  examples.forEach(example => {
    example.customerPrice = calculateCustomerPrice(example.supplyPrice, commissionRate);
    example.commission = example.customerPrice - example.supplyPrice;
  });
  
  const summary = `수수료율 ${commissionRate}% 기준으로 공급가에 ${(1 + commissionRate / 100).toFixed(2)}배를 곱한 금액이 고객 결제금액입니다.`;
  
  return { examples, summary };
}
