<script setup lang="ts">
import type { Component } from "vue"

import { ChevronsUpDown, Plus } from "lucide-vue-next"
import { ref, computed } from "vue"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar"

const props = defineProps<{
  teams: {
    name: string
    logo: Component
    plan: string
  }[]
}>()

const { isMobile } = useSidebar()

// 修复：使用 computed 或确保初始值安全。这里改用 computed 更响应式且安全
// 或者简单地在 ref 初始化时加判断
const activeTeam = ref(props.teams[0] || null)

// 如果希望切换后保持响应式且安全，可以保留 ref，但模板需判空
// 另一种更优解是使用 computed 获取当前选中的 team，但原逻辑是点击设置 ref
// 为了最小改动，我们确保 activeTeam 不为 undefined，并在使用处加 v-if 或可选链
</script>

<template>
  <SidebarMenu>
    <SidebarMenuItem>
      <DropdownMenu>
        <DropdownMenuTrigger as-child>
          <SidebarMenuButton size="lg"
            class="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
            :disabled="!activeTeam">
            <!-- 修复：增加 v-if 判断，确保 activeTeam 存在才渲染 -->
            <div v-if="activeTeam"
              class="flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
              <component :is="activeTeam.logo" class="size-4" />
            </div>
            <div v-if="activeTeam" class="grid flex-1 text-left text-sm leading-tight">
              <span class="truncate font-medium">
                {{ activeTeam.name }}
              </span>
              <span class="truncate text-xs">{{ activeTeam.plan }}</span>
            </div>
            <!-- 如果无团队，可显示占位符或隐藏按钮内容 -->
            <div v-else class="grid flex-1 text-left text-sm leading-tight">
              <span class="truncate font-medium text-muted-foreground">No Team</span>
            </div>
            <ChevronsUpDown class="ml-auto" />
          </SidebarMenuButton>
        </DropdownMenuTrigger>
        <DropdownMenuContent class="w-[--reka-dropdown-menu-trigger-width] min-w-56 rounded-lg" align="start"
          :side="isMobile ? 'bottom' : 'right'" :side-offset="4">
          <DropdownMenuLabel class="text-xs text-muted-foreground">
            Teams
          </DropdownMenuLabel>
          <DropdownMenuItem v-for="(team, index) in teams" :key="team.name" class="gap-2 p-2"
            @click="activeTeam = team">
            <div class="flex size-6 items-center justify-center rounded-sm border">
              <component :is="team.logo" class="size-3.5 shrink-0" />
            </div>
            {{ team.name }}
            <DropdownMenuShortcut>⌘{{ index + 1 }}</DropdownMenuShortcut>
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem class="gap-2 p-2">
            <div class="flex size-6 items-center justify-center rounded-md border bg-transparent">
              <Plus class="size-4" />
            </div>
            <div class="font-medium text-muted-foreground">
              Add team
            </div>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </SidebarMenuItem>
  </SidebarMenu>
</template>