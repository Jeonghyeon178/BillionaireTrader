import React, { useState, useEffect } from 'react';
import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8080/api';

const PortfolioOverview = () => {
  const [portfolioData, setPortfolioData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchPortfolioData();
  }, []);

  const fetchPortfolioData = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_BASE_URL}/account`);
      setPortfolioData(response.data);
      setError(null);
    } catch (error) {
      console.error('포트폴리오 데이터 가져오기 실패:', error);
      setError('포트폴리오 데이터를 불러올 수 없습니다.');
    } finally {
      setLoading(false);
    }
  };

  const calculatePortfolioSummary = () => {
    if (!portfolioData) return null;

    const stockValue = parseFloat(portfolioData.stock_balance_res.output2.tot_evlu_pfls_amt || 0);
    const cashValue = parseFloat(portfolioData.cash_balance_res.output[0]?.frcr_dncl_amt1 || 0);
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
    return (
      <div className="bg-slate-800 border border-slate-600 rounded-xl p-6 h-64 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-400 mb-2">⚠️</p>
          <p className="text-red-400 text-sm">{error}</p>
          <button 
            onClick={fetchPortfolioData}
            className="mt-3 px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-xs rounded-lg transition-colors"
          >
            다시 시도
          </button>
        </div>
      </div>
    );
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
            {holdings.map((holding, index) => {
              const currentValue = parseFloat(holding.ovrs_stck_evlu_amt || 0);
              const quantity = parseInt(holding.ord_psbl_qty || 0);
              const currentPrice = parseFloat(holding.now_pric2 || 0);
              const percentage = summary?.totalValue > 0 ? (currentValue / summary.totalValue) * 100 : 0;

              return (
                <div key={index} className="bg-slate-700 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-blue-500/20 rounded-lg flex items-center justify-center">
                          <span className="text-blue-400 font-bold text-sm">
                            {holding.ovrs_pdno.substring(0, 2)}
                          </span>
                        </div>
                        <div>
                          <h5 className="text-white font-semibold">
                            {holding.ovrs_item_name}
                          </h5>
                          <p className="text-slate-400 text-sm">
                            {holding.ovrs_pdno}
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

export default PortfolioOverview;