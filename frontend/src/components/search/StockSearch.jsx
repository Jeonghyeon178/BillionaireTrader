import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import PropTypes from 'prop-types';
import axios from 'axios';
import { APP_CONSTANTS, API_ENDPOINTS } from '../../constants/appConstants';
import { logger } from '../../utils/logger';
import ErrorState from '../common/ErrorState';

const StockSearch = ({ onStockSelect, className = '' }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const [searchError, setSearchError] = useState(null);
  const searchRef = useRef(null);
  const resultsRef = useRef(null);

  const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8080/api';

  const dummyStocks = useMemo(() => [
    { symbol: 'AAPL', name: 'Apple Inc.', exchange: 'NASDAQ' },
    { symbol: 'GOOGL', name: 'Alphabet Inc.', exchange: 'NASDAQ' },
    { symbol: 'MSFT', name: 'Microsoft Corporation', exchange: 'NASDAQ' },
    { symbol: 'TSLA', name: 'Tesla, Inc.', exchange: 'NASDAQ' },
    { symbol: 'AMZN', name: 'Amazon.com, Inc.', exchange: 'NASDAQ' },
    { symbol: 'META', name: 'Meta Platforms, Inc.', exchange: 'NASDAQ' },
    { symbol: 'NVDA', name: 'NVIDIA Corporation', exchange: 'NASDAQ' },
    { symbol: 'NFLX', name: 'Netflix, Inc.', exchange: 'NASDAQ' }
  ], []);

  const searchStocks = useCallback(async (query) => {
    if (query.length < APP_CONSTANTS.MIN_SEARCH_LENGTH) {
      setSearchResults([]);
      setSearchError(null);
      return;
    }

    setIsLoading(true);
    setSearchError(null);
    try {
      const response = await axios.get(
        `${API_BASE_URL}${API_ENDPOINTS.STOCKS.SEARCH}?q=${encodeURIComponent(query)}`
      );
      const results = response.data.slice(0, APP_CONSTANTS.MAX_SEARCH_RESULTS);
      setSearchResults(results);
      setSearchError(null);
    } catch (error) {
      logger.error('주식 검색 실패:', error);
      setSearchError('주식 검색 API에 연결할 수 없습니다. 오프라인 데이터를 표시합니다.');
      const filteredDummyResults = dummyStocks.filter(stock => 
        stock.symbol.toLowerCase().includes(query.toLowerCase()) ||
        stock.name.toLowerCase().includes(query.toLowerCase())
      );
      setSearchResults(filteredDummyResults);
    } finally {
      setIsLoading(false);
    }
  }, [dummyStocks, API_BASE_URL]);

  const handleSearchErrorRetry = useCallback(() => {
    const trimmedQuery = searchQuery.trim();
    if (trimmedQuery) {
      searchStocks(trimmedQuery);
    }
  }, [searchQuery, searchStocks]);

  useEffect(() => {
    if (searchError && searchQuery.trim()) {
      const retryTimeout = setTimeout(() => {
        logger.info('자동으로 주식 검색 재시도 중...');
        handleSearchErrorRetry();
      }, 5000);

      return () => clearTimeout(retryTimeout);
    }
  }, [searchError, searchQuery, handleSearchErrorRetry]);

  const handleClearSearch = useCallback(() => {
    setSearchQuery('');
    setSearchResults([]);
    setSearchError(null);
    setIsOpen(false);
  }, []);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      const trimmedQuery = searchQuery.trim();
      if (trimmedQuery) {
        searchStocks(trimmedQuery);
        setIsOpen(true);
      } else {
        setSearchResults([]);
        setIsOpen(false);
      }
    }, APP_CONSTANTS.DEBOUNCE_DELAY);

    return () => clearTimeout(timeoutId);
  }, [searchQuery, searchStocks]);

  const handleStockSelect = useCallback((stock) => {
    setSearchQuery(`${stock.symbol} - ${stock.name}`);
    setIsOpen(false);
    setSelectedIndex(-1);
    onStockSelect(stock);
  }, [onStockSelect]);

  const handleKeyDown = useCallback((e) => {
    if (!isOpen) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex(prev => 
          prev < searchResults.length - 1 ? prev + 1 : prev
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex(prev => prev > 0 ? prev - 1 : -1);
        break;
      case 'Enter':
        e.preventDefault();
        if (selectedIndex >= 0 && searchResults[selectedIndex]) {
          handleStockSelect(searchResults[selectedIndex]);
        }
        break;
      case 'Escape':
        setIsOpen(false);
        setSelectedIndex(-1);
        break;
      default:
        break;
    }
  }, [isOpen, searchResults, selectedIndex, handleStockSelect]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setIsOpen(false);
        setSelectedIndex(-1);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div ref={searchRef} className={`relative ${className}`}>
      {searchError && (
        <div className="mb-4 rounded-lg bg-slate-800/50 border border-slate-600 p-4">
          <ErrorState message={searchError} showRetryInfo={true} />
        </div>
      )}
      <div className="relative">
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="종목 검색 (예: AAPL, Apple, 애플)"
          className="w-full px-4 py-2 pl-10 pr-4 text-white bg-slate-700/50 border border-slate-600 rounded-lg 
                   focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
                   placeholder-slate-400"
        />
        
        <div className="absolute inset-y-0 left-0 flex items-center pl-3">
          {isLoading ? (
            <div className="w-4 h-4 border-2 border-gray-400 border-t-transparent rounded-full animate-spin"></div>
          ) : (
            <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          )}
        </div>
        {searchQuery && (
          <button
            onClick={handleClearSearch}
            className="absolute inset-y-0 right-0 flex items-center pr-3 text-slate-400 hover:text-white"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
      </div>

      {isOpen && searchResults.length > 0 && (
        <div 
          ref={resultsRef}
          className="absolute z-50 w-full mt-1 bg-slate-800 border border-slate-600 rounded-lg shadow-xl max-h-64 overflow-y-auto"
        >
          {searchResults.map((stock, index) => (
            <button
              key={`${stock.symbol}-${index}`}
              onClick={() => handleStockSelect(stock)}
              className={`w-full px-4 py-3 text-left hover:bg-slate-700 transition-colors ${
                index === selectedIndex ? 'bg-slate-700' : ''
              } ${index === 0 ? 'rounded-t-lg' : ''} ${
                index === searchResults.length - 1 ? 'rounded-b-lg' : 'border-b border-slate-600'
              }`}
            >
              <div className="flex justify-between items-center">
                <div>
                  <div className="font-semibold text-white">{stock.symbol}</div>
                  <div className="text-sm text-slate-300 truncate">{stock.name}</div>
                </div>
                <div className="text-xs text-slate-400 bg-slate-700 px-2 py-1 rounded">
                  {stock.exchange}
                </div>
              </div>
            </button>
          ))}
        </div>
      )}

      {isOpen && searchQuery.length >= APP_CONSTANTS.MIN_SEARCH_LENGTH && searchResults.length === 0 && !isLoading && (
        <div className="absolute z-50 w-full mt-1 bg-slate-800 border border-slate-600 rounded-lg shadow-xl">
          <div className="px-4 py-3 text-center text-slate-400">
            검색 결과가 없습니다
          </div>
        </div>
      )}
    </div>
  );
};

StockSearch.propTypes = {
  onStockSelect: PropTypes.func.isRequired,
  className: PropTypes.string
};

export default StockSearch;