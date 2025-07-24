import React from 'react';
import PropTypes from 'prop-types';
import ErrorState from '../common/ErrorState';

/**
 * @typedef {Object} HoldingData
 * @property {string} ovrs_stck_evlu_amt - 해외주식 평가금액
 * @property {string} ord_psbl_qty - 주문 가능 수량
 * @property {string} now_pric2 - 현재가격
 * @property {string} ovrs_pdno - 해외상품번호 (종목코드)
 * @property {string} ovrs_item_name - 해외종목명
 */

/**
 * @typedef {Object} PortfolioApiResponse
 * @property {Object} stock_balance_res
 * @property {Object} stock_balance_res.output2
 * @property {string} stock_balance_res.output2.tot_evlu_pfls_amt
 * @property {HoldingData[]} stock_balance_res.output1
 * @property {Object} cash_balance_res
 * @property {Array} cash_balance_res.output
 * @property {string} cash_balance_res.output[].frcr_dncl_amt1
 */

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
      {/* 포트폴리오 요약 */}
      <div className="mb-6">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <div className="bg-slate-700 rounded-lg p-4">
            <p className="text-slate-400 text-xs mb-1">총 자산</p>
            <p className="text-white text-lg font-bold">
              {formatCurrency(summary?.totalValue || 0)}
            </p>
          </div>
          <div className="bg-slate-700 rounded-lg p-4">
            <p className="text-slate-400 text-xs mb-1">주식 평가액</p>
            <p className="text-blue-400 text-lg font-bold">
              {formatCurrency(summary?.stockValue || 0)}
            </p>
            <p className="text-slate-500 text-xs">
              {(summary?.stockPercentage || 0).toFixed(1)}%
            </p>
          </div>
          <div className="bg-slate-700 rounded-lg p-4">
            <p className="text-slate-400 text-xs mb-1">현금 잔고</p>
            <p className="text-green-400 text-lg font-bold">
              {formatCurrency(summary?.cashValue || 0)}
            </p>
            <p className="text-slate-500 text-xs">
              {(summary?.cashPercentage || 0).toFixed(1)}%
            </p>
          </div>
          <div className="bg-slate-700 rounded-lg p-4">
            <p className="text-slate-400 text-xs mb-1">보유 종목</p>
            <p className="text-purple-400 text-lg font-bold">
              {holdings.length}개
            </p>
          </div>
        </div>

        {/* 자산 구성 비율 바 */}
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

      {/* 보유 종목 목록 */}
      <div>
        <h4 className="text-md font-semibold text-white mb-3">보유 종목</h4>
        {holdings.length === 0 ? (
          <div className="text-center py-8 text-slate-400">
            <p className="text-2xl mb-2">📈</p>
            <p>보유 종목이 없습니다</p>
          </div>
        ) : (
          <div className="space-y-3">
            {holdings.map((/** @type {HoldingData} */ holding, index) => {
              // Provide fallback values for potentially undefined properties
              const currentValue = parseFloat(holding?.ovrs_stck_evlu_amt || '0');
              const quantity = parseInt(holding?.ord_psbl_qty || '0');
              const currentPrice = parseFloat(holding?.now_pric2 || '0');
              const stockCode = holding?.ovrs_pdno || 'N/A';
              const stockName = holding?.ovrs_item_name || 'Unknown Stock';
              const percentage = summary?.totalValue > 0 ? (currentValue / summary.totalValue) * 100 : 0;

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
                      <p className="text-slate-500 text-xs">
                        {percentage.toFixed(1)}%
                      </p>
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