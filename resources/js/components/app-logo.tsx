export default function AppLogo() {
    return (
        <div className="flex items-center gap-2 group-data-[collapsible=icon]:w-full group-data-[collapsible=icon]:justify-center">
            <span className="truncate text-base font-bold tracking-wider text-sidebar-foreground group-data-[collapsible=icon]:hidden">
                CEIBA
            </span>
            <span className="hidden text-base font-bold tracking-wider text-sidebar-foreground group-data-[collapsible=icon]:inline-block">
                C
            </span>
        </div>
    );
}
