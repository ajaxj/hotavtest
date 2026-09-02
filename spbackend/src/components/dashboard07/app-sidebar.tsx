"use client"

import * as React from "react"
import {
  AudioWaveform,
  BookOpen,
  Bot,
  Command,
  Frame,
  GalleryVerticalEnd,
  Map,
  PieChart,
  Settings2,
  SquareTerminal,
} from "lucide-react"

import { NavMain } from "@/components/dashboard07/nav-main"
import { NavProjects } from "@/components/dashboard07/nav-projects"
import { NavUser } from "@/components/dashboard07/nav-user"
import { TeamSwitcher } from "@/components/dashboard07/team-switcher"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from "@/components/ui/sidebar"

// This is sample data.
const data = {
  user: {
    name: "shadcn",
    email: "m@example.com",
    avatar: "/avatars/shadcn.jpg",
  },
  teams: [
    {
      name: "Acme Inc",
      logo: GalleryVerticalEnd,
      plan: "Enterprise",
    },
    {
      name: "Acme Corp.",
      logo: AudioWaveform,
      plan: "Startup",
    },
    {
      name: "Evil Corp.",
      logo: Command,
      plan: "Free",
    },
  ],
  navMain: [
    {
      title: "Playground",
      url: "#",
      icon: SquareTerminal,
      isActive: true,
      items: [
        {
          title: "Dashboard",
          url: "/",
        },
        {
          title: "about",
          url: "/about",
        },
        {
          title: "Settings",
          url: "#",
        },
      ],
    },
    {
      title: "系统",
      url: "#",
      icon: Bot,
      items: [
        {
          title: "任务列表",
          url: "/sys/task-list",
        },
        {
          title:"日志",
          url: "/sys/log-info-list",
        },
        {
          title: "FetchSite列表",
          url: "/sys/fetch-site-list",
        },

      ],
    },
    {
      title: "Temp",
      url: "#",
      icon: Bot,
      items: [
        {
          title: "分类列表",
          url: "/temp/temp-category-list",
        },
          {
          title: "电影列表",
          url: "/temp/temp-movie-list",
        },
        {
          title: "标签列表",
          url: "/temp/temp-tag-list",
        },

      ],
    },
    {
      title: "Demo",
      url: "#",
      icon: Bot,
      items: [
        {
          title: "Store",
          url: "/demo/store",
        },
        {
          title: "Table",
          url: "/demo/table",
        },
        {
          title: "Quantum",
          url: "#",
        },
      ],
    },
    {
      title: "Documentation",
      url: "#",
      icon: BookOpen,
      items: [
        {
          title: "Introduction",
          url: "#",
        },
        {
          title: "Get Started",
          url: "#",
        },
        {
          title: "Tutorials",
          url: "#",
        },
        {
          title: "Changelog",
          url: "#",
        },
      ],
    },
    {
      title: "Settings",
      url: "#",
      icon: Settings2,
      items: [
        {
          title: "General",
          url: "#",
        },
        {
          title: "Team",
          url: "#",
        },
        {
          title: "Billing",
          url: "#",
        },
        {
          title: "Limits",
          url: "#",
        },
      ],
    },
  ],
  projects: [
    {
      name: "Design Engineering",
      url: "#",
      icon: Frame,
    },
    {
      name: "Sales & Marketing",
      url: "#",
      icon: PieChart,
    },
    {
      name: "Travel",
      url: "#",
      icon: Map,
    },
  ],
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <TeamSwitcher teams={data.teams} />
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data.navMain} />
        <NavProjects projects={data.projects} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={data.user} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}
