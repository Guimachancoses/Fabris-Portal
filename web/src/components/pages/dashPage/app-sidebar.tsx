"use client"

import * as React from "react"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
  SidebarSeparator,
} from "@/src/components/ui/sidebar"

import { NavUser } from "@/src/components/pages/dashPage/nav-user"
import { Logo } from "../../logo"
import { sidebarItems } from "./sidebar-menu-items"
import { DatePicker } from "./date-picker"
import Link from "next/link"
import { useClerk } from "@clerk/nextjs"
import { useSelector } from "react-redux"

type AppSidebarProps = {
  activeView: string
  onChangeView: (id: string) => void
}

export function AppSidebar({
  activeView,
  onChangeView,
  ...props
}: AppSidebarProps & React.ComponentProps<typeof Sidebar>) {
  const { user } = useClerk();
  const { userAccount } = useSelector((state: any) => state.colaborador)

  //console.log("userAccount: ", userAccount)

  const sidebarItemsFiltered = sidebarItems.filter((item) => {
    // Esconde "Colaboradores" se função do usuário for "V"
    if (item.id === "colaboradores" && user?.primaryEmailAddress?.emailAddress === userAccount.email && (userAccount?.funcao === "V" || userAccount?.funcao === "Aux")) {
      return false;
    }
    // Esconde "Lojas" se a função do usuário for diferente de "Admin"
    if (item.id === "lojas" && user?.primaryEmailAddress?.emailAddress === userAccount.email && (userAccount?.funcao !== "Admin")) {
      return false;
    }

    return true;
  });

  return (
    <Sidebar
      collapsible="icon"
      {...props}
      className="group"
    >

      <SidebarHeader
        data-tour="user-profile"
        className="
            border-sidebar-border
            h-14
            border-b
            mt-10
            flex
            items-center

            group-data-[state=collapsed]:justify-center
            group-data-[state=collapsed]:px-0
          "
      >
        <div
          className="
            flex
            w-full
            items-center

            group-data-[state=collapsed]:w-auto
            group-data-[state=collapsed]:justify-center
          "
        >
          <NavUser
            userNav={{
              name: `${user?.firstName ?? ""} ${user?.lastName ?? ""}`.trim(),
              email: user?.primaryEmailAddress?.emailAddress ?? "",
              avatar: user?.imageUrl ?? "",
            }}
          />
        </div>
      </SidebarHeader>


      <SidebarContent>
        <div className="group-data-[state=collapsed]:hidden transition-all">
          <DatePicker />
        </div>
        <SidebarSeparator className="mx-0" />
        <SidebarMenu className="px-2">
          {sidebarItemsFiltered.map((item) => {
            const Icon = item.icon
            const isActive = activeView === item.id

            return (
              <SidebarMenuItem key={item.id}>
                <SidebarMenuButton
                  isActive={isActive}
                  onClick={() => onChangeView(item.id)}
                  title={item.label}
                  {...(item.id === "colaboradores" && { "data-tour": "colab-register" })}
                  className="
                    group
                    flex items-center gap-3
                    rounded-lg
                    px-3 py-2
                    text-sm font-medium
                    transition-all

                    hover:text-primary
                    data-[active=true]:bg-primary
                    data-[active=true]:text-white

                    group-data-[state=collapsed]:justify-center
                    group-data-[state=collapsed]:px-2
                  "
                >

                  <Icon
                    className="
                      size-5
                      text-muted-foreground
                      transition-colors
                      group-data-[active=true]:text-white
                    "
                  />

                  <span
                    className="
                      transition-all
                      duration-200
                      group-data-[state=collapsed]:hidden
                    "
                  >
                    {item.label}
                  </span>

                </SidebarMenuButton>

              </SidebarMenuItem>
            )
          })}
        </SidebarMenu>

        <SidebarSeparator className="mx-0" />
      </SidebarContent>
      <div className="group-data-[state=collapsed]:hidden transition-all">
        <SidebarFooter>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton className="flex justify-center items-center align-center h-16">

                <Link className="flex gap-4" href="/">
                  <Logo className="scale-205" />
                </Link>

              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarFooter>
      </div>
      <SidebarRail />
    </Sidebar>
  )
}
