import React from 'react';
import PropTypes from 'prop-types';
import CountingNumber from '../common/CountingNumber';
import ErrorState from '../common/ErrorState';


const PortfolioOverview = ({ portfolioData, loading = false, error = null }) => {

  const calculatePortfolioSummary = () => {
    if (!portfolioData) return null;

    const stockValue = parseFloat(portfolioData.stock_balance_res?.output2?.tot_evlu_pfls_amt || 0);
    const cashValue = parseFloat(portfolioData.cash_balance_res?.output?.[0]?.frcr_dncl_amt1 || 0);
    const totalValue = stockValue + cashValue;

    return {
      totalValue,
      stockValue,
      cashValue,
      stockPercentage: totalValue > 0 ? (stockValue / totalValue) * 100 : 0,
      cashPercentage: totalValue > 0 ? (cashValue / totalValue) * 100 : 0
    };
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2
    }).format(amount);
  };

  if (loading) {
    return (
      <div className="bg-slate-800 border border-slate-600 rounded-xl p-6 h-64 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
          <p className="text-slate-400">포트폴리오 로딩 중...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return <ErrorState message={error} showRetryInfo={true} />;
  }

  const summary = calculatePortfolioSummary();
  const holdings = portfolioData?.stock_balance_res?.output1 || [];

  return (
    <div className="bg-slate-800 border border-slate-600 rounded-xl p-6">
      <div className="mb-6">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <div className="bg-slate-700 rounded-lg p-4">
            <p className="text-slate-400 text-xs mb-1">총 자산</p>
            <p className="text-white text-lg font-bold">
              <CountingNumber
                value={Number(summary?.totalValue) || 0}
                formatFunction={formatCurrency}
                highlightColor="bg-white/10"
                duration={1000}
              />
            </p>
          </div>
          <div className="bg-slate-700 rounded-lg p-4">
            <p className="text-slate-400 text-xs mb-1">주식 평가액</p>
            <p className="text-blue-400 text-lg font-bold">
              <CountingNumber
                value={Number(summary?.stockValue) || 0}
                formatFunction={formatCurrency}
                highlightColor="bg-blue-500/15"
                duration={900}
              />
            </p>
            <p className="text-slate-500 text-xs">
              <CountingNumber
                value={Number(summary?.stockPercentage) || 0}
                formatFunction={(val) => `${val.toFixed(1)}%`}
                highlightColor="bg-blue-500/10"
                duration={600}
              />
            </p>
          </div>
          <div className="bg-slate-700 rounded-lg p-4">
            <p className="text-slate-400 text-xs mb-1">현금 잔고</p>
            <p className="text-green-400 text-lg font-bold">
              <CountingNumber
                value={Number(summary?.cashValue) || 0}
                formatFunction={formatCurrency}
                highlightColor="bg-green-500/15"
                duration={900}
              />
            </p>
            <p className="text-slate-500 text-xs">
              <CountingNumber
                value={Number(summary?.cashPercentage) || 0}
                formatFunction={(val) => `${val.toFixed(1)}%`}
                highlightColor="bg-green-500/10"
                duration={600}
              />
            </p>
          </div>
          <div className="bg-slate-700 rounded-lg p-4">
            <p className="text-slate-400 text-xs mb-1">보유 종목</p>
            <p className="text-purple-400 text-lg font-bold">
              <CountingNumber
                value={Number(holdings.length) || 0}
                formatFunction={(val) => `${Math.floor(val)}개`}
                highlightColor="bg-purple-500/15"
                duration={500}
              />
            </p>
          </div>
        </div>

        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-slate-300 text-sm">자산 구성</span>
            <span className="text-slate-500 text-xs">
              주식 {(summary?.stockPercentage || 0).toFixed(1)}% • 현금 {(summary?.cashPercentage || 0).toFixed(1)}%
            </span>
          </div>
          <div className="w-full bg-slate-700 rounded-full h-2">
            <div className="flex h-2 rounded-full overflow-hidden">
              <div 
                className="bg-blue-500"
                style={{ width: `${summary?.stockPercentage || 0}%` }}
              ></div>
              <div 
                className="bg-green-500"
                style={{ width: `${summary?.cashPercentage || 0}%` }}
              ></div>
            </div>
          </div>
        </div>
      </div>

      <div>
        <h4 className="text-md font-semibold text-white mb-3">보유 종목</h4>
        {holdings.length === 0 ? (
          <div className="text-center py-8 text-slate-400">
            <p className="text-2xl mb-2">📈</p>
            <p>보유 종목이 없습니다</p>
          </div>
        ) : (
          <div className="space-y-3">
            {holdings.map((holding, index) => {
              const currentValue = parseFloat(holding?.ovrs_stck_evlu_amt || '0');
              const quantity = parseInt(holding?.ord_psbl_qty || '0');
              const currentPrice = parseFloat(holding?.now_pric2 || '0');
              const stockCode = holding?.ovrs_pdno || 'N/A';
              const stockName = holding?.ovrs_item_name || 'Unknown Stock';
              const percentage = summary?.totalValue > 0 ? (currentValue / summary.totalValue) * 100 : 0;
              
              // 구매 원금과 현재 평가금액으로 수익률 계산
              const purchaseAmount = parseFloat(holding?.frcr_pchs_amt1 || '0');
              const currentAmount = parseFloat(holding?.ovrs_stck_evlu_amt || '0');
              const returnRate = purchaseAmount > 0 ? ((currentAmount - purchaseAmount) / purchaseAmount) * 100 : 0;

              return (
                <div key={`${stockCode}-${index}`} className="bg-slate-700 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-blue-500/20 rounded-lg flex items-center justify-center">
                          <span className="text-blue-400 font-bold text-sm">
                            {stockCode.length >= 2 ? stockCode.substring(0, 2) : stockCode}
                          </span>
                        </div>
                        <div>
                          <h5 className="text-white font-semibold">
                            {stockName}
                          </h5>
                          <p className="text-slate-400 text-sm">
                            {stockCode}
                          </p>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-white font-bold">
                        {formatCurrency(currentValue)}
                      </p>
                      <p className="text-slate-400 text-sm">
                        {quantity}주 • {formatCurrency(currentPrice)}/주
                      </p>
                      <div className="flex items-center justify-end gap-2 text-xs">
                        <span className="text-slate-500">
                          {percentage.toFixed(1)}%
                        </span>
                        <span className={`font-semibold ${returnRate >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                          <CountingNumber
                            value={Number(returnRate) || 0}
                            formatFunction={(val) => `${val >= 0 ? '+' : ''}${val.toFixed(2)}%`}
                            highlightColor={returnRate >= 0 ? "bg-green-500/20" : "bg-red-500/20"}
                            duration={600}
                          />
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

PortfolioOverview.propTypes = {
  portfolioData: PropTypes.object,
  loading: PropTypes.bool,
  error: PropTypes.string
};

export default PortfolioOverview;