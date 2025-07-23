// 트레이딩 관련 유틸리티 함수들

export const formatCurrency = (amount) => {
  return new Intl.NumberFormat('ko-KR', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2
  }).format(amount);
};

export const getSchedulerStatusColor = (status) => {
  switch (status) {
    case 'ENABLED':
      return 'text-green-400 bg-green-500/20';
    case 'DISABLED':
      return 'text-red-400 bg-red-500/20';
    default:
      return 'text-slate-400 bg-slate-500/20';
  }
};

export const getSchedulerStatusText = (status) => {
  switch (status) {
    case 'ENABLED':
      return '실행 중';
    case 'DISABLED':
      return '중지됨';
    default:
      return '확인 중...';
  }
};

export const formatKoreanCurrency = (amount) => {
  if (amount >= 100000000) {
    return `${(amount / 100000000).toFixed(1)}억원`;
  } else if (amount >= 10000) {
    return `${Math.floor(amount / 10000)}만원`;
  } else {
    return `${amount.toLocaleString('ko-KR')}원`;
  }
};

export const getBuyStrategies = () => [
  '• 시가총액 기반 종목 선별',
  '• 하락 시 추가 매수',
  '• 패닉 상황 특별 대응'
];

export const getSellStrategies = () => [
  '• 전략 외 종목 전량 매도',
  '• 목표 비중 초과 시 매도',
  '• 회복 조건 충족 시 리밸런싱'
];