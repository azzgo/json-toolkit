import { ChevronsLeftRight, ChevronsRightLeft, FileText, GitMerge, Key, Link2, Database } from "lucide-react";
import { Link } from "react-router";

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarFooter,
  useSidebar,
} from "@/components/ui/sidebar";

const AppSidebar = () => {
  const items = [
    {
      title: "Editor",
      url: "/",
      icon: FileText,
    },
    {
      title: "Diff",
      url: "/diff",
      icon: GitMerge,
    },
    {
      title: "JWT Decoder",
      url: "/jwt",
      icon: Key,
    },
    {
      title: "URL Params",
      url: "/url-params",
      icon: Link2,
    },
    {
      title: "Mock Data",
      url: "/mock-data",
      icon: Database,
    },
  ];

  const { toggleSidebar, open } = useSidebar();

  return (
    <Sidebar collapsible="icon">
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Json Toolkit</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <Link to={{ pathname: item.url }}>
                      <item.icon />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton onClick={toggleSidebar}>
              {open ? <ChevronsRightLeft /> : <ChevronsLeftRight />}
              <span>Fold</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
};

export default AppSidebar;
