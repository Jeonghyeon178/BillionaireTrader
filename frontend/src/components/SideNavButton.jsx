const SideNavButton = (props) => {
  return (
    <div className="mt-1 w-full">
      <a
        class="py-2.7 bg-blue-500/13 text-sm ease-nav-brand my-0 mx-2 flex items-center whitespace-nowrap rounded-lg px-4 font-semibold text-slate-700 transition-colors"
        href="./pages/dashboard.html"
      >
        <div class="mr-2 flex h-8 w-8 items-center justify-center rounded-lg bg-center stroke-0 text-center xl:p-2.5">
          <i class="relative top-0 text-sm leading-normal text-blue-500 ni ni-tv-2"></i>
        </div>
        <span class="ml-1 duration-300 opacity-100 pointer-events-none ease">
          {props.content}
        </span>
      </a>
    </div>
  );
};
export default SideNavButton;
