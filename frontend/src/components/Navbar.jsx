const Navbar = () => {
  return (
    <div className="bg-gradient-to-r from-slate-800 to-slate-900 shadow-lg">
      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* 로고 */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-lg">💎</span>
              </div>
              <span className="text-white text-xl font-bold">BillionaireTrader</span>
            </div>
          </div>

          {/* 네비게이션 링크 */}
          <nav className="hidden md:flex items-center gap-6">
            <a href="#" className="text-gray-300 hover:text-white px-3 py-2 rounded-md text-sm font-medium transition-colors">
              대시보드
            </a>
            <a href="#" className="text-gray-300 hover:text-white px-3 py-2 rounded-md text-sm font-medium transition-colors">
              포트폴리오
            </a>
            <a href="#" className="text-gray-300 hover:text-white px-3 py-2 rounded-md text-sm font-medium transition-colors">
              자동매매
            </a>
            <a href="#" className="text-gray-300 hover:text-white px-3 py-2 rounded-md text-sm font-medium transition-colors">
              분석
            </a>
            <a href="#" className="text-gray-300 hover:text-white px-3 py-2 rounded-md text-sm font-medium transition-colors">
              설정
            </a>
          </nav>

          {/* 우측 섹션 */}
          <div className="flex items-center gap-4">
            {/* 검색 */}
            <div className="hidden lg:block">
              <div className="relative">
                <input
                  type="text"
                  placeholder="종목 검색..."
                  className="bg-slate-700 text-white placeholder-slate-400 rounded-lg pl-10 pr-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-slate-600 transition-colors w-64"
                />
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg className="h-4 w-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
              </div>
            </div>

            {/* 알림 */}
            <button className="relative p-2 text-gray-300 hover:text-white transition-colors">
              <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-5 5l5 5M7 7v10l5-5-5-5z" />
              </svg>
              <span className="absolute top-0 right-0 block h-2 w-2 rounded-full bg-red-500 ring-2 ring-slate-800"></span>
            </button>

            {/* 사용자 메뉴 */}
            <div className="relative">
              <button className="flex items-center gap-2 text-gray-300 hover:text-white transition-colors">
                <div className="w-8 h-8 bg-slate-600 rounded-full flex items-center justify-center">
                  <span className="text-sm font-medium">U</span>
                </div>
                <span className="hidden sm:block text-sm font-medium">사용자</span>
              </button>
            </div>

            {/* 모바일 메뉴 버튼 */}
            <button className="md:hidden p-2 text-gray-300 hover:text-white transition-colors">
              <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
export default Navbar;
