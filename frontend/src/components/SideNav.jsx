import SideNavButton from "./SideNavButton";

const SideNav = () => {
  return (
    <div
      className="fixed inset-y-0 flex-wrap items-center justify-between block w-full p-0 my-4 overflow-y-auto antialiased transition-transform duration-200 -translate-x-full bg-white border-0 shadow-xl max-w-64 z-50 xl:ml-6 rounded-2xl xl:left-0 xl:translate-x-0"
      aria-expanded="false"
    >
      <div className="h-20">
        {/* <i class="absolute top-0 right-0 p-4 opacity-50 cursor-pointer fas fa-times dark:text-white text-slate-400 xl:hidden" sidenav-close></i> */}
        <a
          className="block px-8 py-6 m-0 text-sm whitespace-nowrap text-slate-700"
          href="https://demos.creative-tim.com/argon-dashboard-tailwind/pages/dashboard.html"
          target="_blank"
        >
          <span class="ml-1 font-semibold transition-all duration-200 ease-nav-brand">
            SideNavBar
          </span>
        </a>
      </div>

      <hr class="h-px mt-0 bg-transparent bg-gradient-to-r from-transparent via-black/40 to-transparent " />

      <div class="items-center block w-auto max-h-screen overflow-auto h-sidenav grow basis-full">
        <ul class="flex flex-col pl-0 mb-0">
          <SideNavButton content="dashboard" />
          <SideNavButton content="dashboard" />
          <SideNavButton content="dashboard" />
          <SideNavButton content="dashboard" />
          <SideNavButton content="dashboard" />
        </ul>
      </div>
    </div>
  );
};
export default SideNav;
