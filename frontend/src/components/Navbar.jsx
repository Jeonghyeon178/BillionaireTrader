const Navbar = () => {
  return (
    <div
      class="relative flex flex-wrap items-center justify-between px-0 py-2 mx-6 transition-all ease-in shadow-none duration-250 rounded-2xl lg:flex-nowrap lg:justify-start"
      navbar-main
      navbar-scroll="false"
    >
      <div class="flex items-center justify-between w-full px-4 py-1 mx-auto flex-wrap-inherit">
        <div class="flex items-center mt-2 grow sm:mt-0 sm:mr-6 md:mr-0 lg:flex lg:basis-auto">
          <div class="flex items-center md:ml-auto md:pr-4">
            <div class="relative flex flex-wrap items-stretch w-full transition-all rounded-lg ease">
              <span class="text-sm ease leading-5.6 absolute z-50 -ml-px flex h-full items-center whitespace-nowrap rounded-lg rounded-tr-none rounded-br-none border border-r-0 border-transparent bg-transparent py-2 px-2.5 text-center font-normal text-slate-500 transition-all">
                <i class="fas fa-search"></i>
              </span>
              <input
                type="text"
                class="pl-9 text-sm focus:shadow-primary-outline ease w-1/100 leading-5.6 relative -ml-px block min-w-0 flex-auto rounded-lg border border-solid border-gray-300 bg-white bg-clip-padding py-2 pr-3 text-gray-700 transition-all placeholder:text-gray-500 focus:border-blue-500 focus:outline-none focus:transition-shadow"
                placeholder="Type here..."
                src="#"
              />
            </div>
          </div>
          <ul class="flex flex-row justify-end pl-0 mb-0 list-none md-max:w-full">
            <li class="flex items-center">
              <a
                href="./pages/sign-in.html"
                class="block px-0 py-2 text-sm font-semibold text-white transition-all ease-nav-brand"
              >
                <i class="fa fa-user sm:mr-1"></i>
                <span class="hidden sm:inline">Sign In</span>
              </a>
            </li>
            <li class="flex items-center pl-4 xl:hidden">
              <a
                href="javascript:;"
                class="block p-0 text-sm text-white transition-all ease-nav-brand"
                sidenav-trigger
              >
                <div class="w-4.5 overflow-hidden">
                  <i class="ease mb-0.75 relative block h-0.5 rounded-sm bg-white transition-all"></i>
                  <i class="ease mb-0.75 relative block h-0.5 rounded-sm bg-white transition-all"></i>
                  <i class="ease relative block h-0.5 rounded-sm bg-white transition-all"></i>
                </div>
              </a>
            </li>
            <li class="flex items-center px-4">
              <a
                href="javascript:;"
                class="p-0 text-sm text-white transition-all ease-nav-brand"
              >
                <i fixed-plugin-button-nav class="cursor-pointer fa fa-cog"></i>
              </a>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
};
export default Navbar;
