import React from 'react';
import PropTypes from 'prop-types';
import StockSearch from './search/StockSearch';

const Navbar = ({ onStockSelect }) => {
  return (
    <div className="bg-gradient-to-r from-slate-800 to-slate-900 shadow-lg">
      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-lg">💎</span>
              </div>
              <span className="text-white text-xl font-bold">BillionaireTrader</span>
            </div>
          </div>
          
          <div className="flex-1 flex justify-center mx-8">
            <div className="w-full max-w-lg">
              <StockSearch 
                onStockSelect={onStockSelect}
                className=""
              />
            </div>
          </div>
          
          <div className="w-48">
          </div>
        </div>
      </div>
    </div>
  );
};

Navbar.propTypes = {
  onStockSelect: PropTypes.func.isRequired
};

export default Navbar;
