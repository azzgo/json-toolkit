import { SidebarProvider } from "@/components/ui/sidebar";
import AppSidebar from "@/components/app-sidebar";

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-col h-screen">
      <SidebarProvider
        defaultOpen={false}
        className="my-sidebar"
      >
        <AppSidebar />
        <main className="flex-1 flex flex-col">{children}</main>
      </SidebarProvider>
    </div>
  );
}
