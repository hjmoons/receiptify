/**
 * 숫자를 통화 형식으로 포맷팅
 * @param amount 금액
 * @returns 포맷된 통화 문자열 (예: ₩1,000,000)
 */
export const formatCurrency = (amount: number): string => {
  return `₩${amount.toLocaleString()}`;
};
