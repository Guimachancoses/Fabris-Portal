"use client"

import {
  BadgeCheck,
  Bell,
  ChevronsUpDown,
  LogOut,
  Home,
  Settings,
  User,
} from "lucide-react"
import Link from "next/link"

import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/src/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/src/components/ui/dropdown-menu"
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/src/components/ui/sidebar"
import { useClerk } from "@clerk/nextjs"
import { useDispatch } from "react-redux"
import { resetColaborador, resetUser, updateUser } from "@/src/store/modules/colaborador/actions"
import { resetLoja, resetLojaAccount } from "@/src/store/modules/loja/actions"

export function NavUser({
  userNav,
}: {
  userNav: {
    name: string
    email: string
    avatar: string
  }
}) {
  const { isMobile } = useSidebar()
  const dispatch = useDispatch()
  const { signOut, openUserProfile } = useClerk()

  function handleSignOut() {
    dispatch(updateUser({
      email: '',
      firstName: '',
      lastName: '',
      imageUrl: '',
      checked: false,
    }))
    dispatch(resetColaborador())
    dispatch(resetLoja())
    dispatch(resetLojaAccount())
    dispatch(resetUser())
    signOut({ redirectUrl: "/login" })
  }

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton
              size="lg"
              className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
            >

              <Avatar className="h-8 w-8 rounded-lg">
                <AvatarImage src={userNav.avatar} alt={userNav.name} />
                <AvatarFallback className="rounded-lg">CN</AvatarFallback>
              </Avatar>
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-medium">{userNav.name}</span>
                <span className="truncate text-xs">{userNav.email}</span>
              </div>
              <ChevronsUpDown className="ml-auto size-4" />
            </SidebarMenuButton>
          </DropdownMenuTrigger>

          <DropdownMenuContent
            className="w-(--radix-dropdown-menu-trigger-width) min-w-56 rounded-lg"
            side={isMobile ? "bottom" : "right"}
            align="start"
            sideOffset={4}
          >
            <DropdownMenuLabel className="p-0 font-normal">
              <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
                <Avatar className="h-8 w-8 rounded-lg">
                  <AvatarImage src={userNav.avatar} alt={userNav.name} />
                  <AvatarFallback className="rounded-lg">CN</AvatarFallback>
                </Avatar>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-medium">{userNav.name}</span>
                  <span className="truncate text-xs">{userNav.email}</span>
                </div>
              </div>
            </DropdownMenuLabel>

            <DropdownMenuSeparator />

            <DropdownMenuGroup>
              <DropdownMenuItem asChild>
                <Link href="/" className="flex gap-2">
                  <Home />
                  Página Inicial
                </Link>
              </DropdownMenuItem>
            </DropdownMenuGroup>

            <DropdownMenuSeparator />

            <DropdownMenuGroup>
              <DropdownMenuItem onClick={() => openUserProfile()}>
                <User />
                Conta
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Settings />
                Configurar
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Bell />
                Notifications
              </DropdownMenuItem>
            </DropdownMenuGroup>

            <DropdownMenuSeparator />

            <DropdownMenuItem
              onClick={handleSignOut}
              className="text-red-500 focus:text-red-500"
            >
              <LogOut />
              Sair
            </DropdownMenuItem>

          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  )
}
