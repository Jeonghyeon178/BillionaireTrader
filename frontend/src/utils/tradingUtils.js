// 트레이딩 관련 유틸리티 함수들

// 스케줄러 상태 관련 함수들 (트레이딩 특화)
export const getSchedulerStatusColor = (status) => {
  if (!status) return 'text-slate-400 bg-slate-500/20';
  
  switch (status.toUpperCase()) {
    case 'ENABLED':
      return 'text-green-400 bg-green-500/20';
    case 'DISABLED':
      return 'text-red-400 bg-red-500/20';
    default:
      return 'text-slate-400 bg-slate-500/20';
  }
};

export const getSchedulerStatusText = (status) => {
  if (!status) return '확인 중...';
  
  switch (status.toUpperCase()) {
    case 'ENABLED':
      return '실행 중';
    case 'DISABLED':
      return '중지됨';
    default:
      return '확인 중...';
  }
};

// 한국 통화 포맷 (트레이딩 특화)
export const formatKoreanCurrency = (amount) => {
  if (amount === null || amount === undefined || isNaN(amount)) return '-';
  
  const numAmount = Number(amount);
  
  if (numAmount >= 100000000) {
    return `${(numAmount / 100000000).toFixed(1)}억원`;
  } else if (numAmount >= 10000) {
    return `${Math.floor(numAmount / 10000)}만원`;
  } else {
    return `${numAmount.toLocaleString('ko-KR')}원`;
  }
};

// 매수 전략 데이터 (설정 데이터)
export const getBuyStrategies = () => [
  '• 시가총액 기반 종목 선별',
  '• 하락 시 추가 매수',
  '• 패닉 상황 특별 대응'
];

// 매도 전략 데이터 (설정 데이터)
export const getSellStrategies = () => [
  '• 전략 외 종목 전량 매도',
  '• 목표 비중 초과 시 매도',
  '• 회복 조건 충족 시 리밸런싱'
];