

import { AppSidebar } from "@/components/dashboard07/app-sidebar"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { Separator } from "@/components/ui/separator"
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar"
import { Button } from "@/components/ui/button"
import { Outlet } from "react-router-dom"
import { useAuth } from "@/hooks/use-auth"

export default function Layout() {
  const { logout } = useAuth()

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear">
          <div className="flex items-center gap-2 px-4">
            <SidebarTrigger className="-ml-1" />
            <Separator
              orientation="vertical"
              className="mr-2 data-[orientation=vertical]:h-4"
            />
            <Breadcrumb>
              <BreadcrumbList>
                <BreadcrumbItem className="hidden md:block">
                  <BreadcrumbLink href="/">
                    Sport管理
                  </BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator className="hidden md:block" />
                <BreadcrumbItem>
                  <BreadcrumbPage>Data Fetching</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
            <Button variant="ghost" size="sm" onClick={logout} className="ml-auto">
              Logout
            </Button>
          </div>
        </header>
        <div className="flex flex-1 flex-col gap-4 p-4 pt-0">

          <Outlet />
          {/*<div className="grid auto-rows-min gap-4 md:grid-cols-3">*/}
          {/*  <div className="aspect-video rounded-xl bg-muted/50" />*/}
          {/*  <div className="aspect-video rounded-xl bg-muted/50" />*/}
          {/*  <div className="aspect-video rounded-xl bg-muted/50" />*/}
          {/*</div>*/}
          {/*<div className="min-h-screen flex-1 rounded-xl bg-muted/50 md:min-h-min" />*/}
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
