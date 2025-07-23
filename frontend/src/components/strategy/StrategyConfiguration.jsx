import React from 'react';

const StrategyConfiguration = () => {
  const configItems = [
    {
      title: '리밸런싱 기준',
      description: '하락률 기반 (5% 단위)'
    },
    {
      title: '패닉 매매',
      description: '2.5% 단위 대응'
    },
    {
      title: '기준 지수',
      description: '시가총액 기반 필터링'
    },
    {
      title: '매매 타이밍',
      description: '장 시작 전 자동 실행'
    }
  ];

  return (
    <div className="bg-slate-700 rounded-lg p-4 mb-4">
      <h4 className="text-white font-semibold mb-3">전략 설정</h4>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {configItems.map((item, index) => (
          <div key={index}>
            <p className="text-slate-400 text-sm">{item.title}</p>
            <p className="text-white">{item.description}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default StrategyConfiguration;