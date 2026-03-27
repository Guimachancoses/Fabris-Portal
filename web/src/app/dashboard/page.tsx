"use client"

import { useEffect, useRef, useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth, useClerk } from "@clerk/nextjs"

import Header from "@/src/components/header"
import { AppSidebar } from "@/src/components/pages/dashPage/app-sidebar"

import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/src/components/ui/sidebar"

import { Separator } from "@/src/components/ui/separator"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbList,
  BreadcrumbPage,
} from "@/src/components/ui/breadcrumb"

import { AnimatedThemeToggler } from "@/src/components/ui/animated-theme-toggler"
import { SheetComponent } from "@/src/components/sheetComponent"
import { SheetComponentUser } from "@/src/components/sheetComponetUser"
import DashboardView from "@/src/components/pages/dashPage/views/dashboard-view"
import ColaboradoresView from "@/src/components/pages/dashPage/views/colaboradores"
import LojasView from "@/src/components/pages/dashPage/views/lojas"
import { MetasView } from "@/src/components/pages/dashPage/views/metas"
import { useDispatch, useSelector } from "react-redux"
import { allColaboradores, allMetas, setAlerta, updateUser, filterAllColaboradores } from "@/src/store/modules/colaborador/actions"
import { toast } from "sonner"
import { OnboardingModal } from "@/src/components/pages/steps/OnboardingModal"
import { filterLojas, getLoja, setAlerta as setAlertaLoja } from "@/src/store/modules/loja/actions"
import { AuroraText } from "@/src/components/ui/aurora-text"



export default function Page() {
  const { user } = useClerk()
  const { isSignedIn, isLoaded } = useAuth()
  const dispatch = useDispatch()
  const router = useRouter()
  const [activeView, setActiveView] = useState("dashboard")
  const alerta = useSelector((state: any) => state.colaborador.alerta);
  const { alerta: alertaLoja } = useSelector((state: any) => state.loja);
  const { userAccount } = useSelector((state: any) => state.colaborador);
  const { lojaAccount } = useSelector((state: any) => state.loja);
  const hasInitialized = useRef(false)
  const [open, setOpen] = useState(false);
  const lojaLoaded = useRef(false)
  const [sidebarOpen, setSidebarOpen] = useState<boolean>(() => {
    if (typeof window === "undefined") return true
    const stored = localStorage.getItem(`sidebar-open-${userAccount?.nome}`)
    return stored ? JSON.parse(stored) : true
  })
  // inicialização do usuário
  useEffect(() => {
    if (!isLoaded || !isSignedIn || !user) return
    if (hasInitialized.current) return

    hasInitialized.current = true

    dispatch(updateUser({
      email: user.primaryEmailAddress?.emailAddress ?? '',
      firstName: user.firstName ?? '',
      lastName: user.lastName ?? '',
      imageUrl: user.imageUrl ?? '',
      userIdClerk: user.id ?? '',
    }))
  }, [isLoaded, isSignedIn, user, dispatch])

  useEffect(() => {
    if (!userAccount.checked) return
    //console.log("userAccount atualizado:", userAccount)

    if (userAccount.first === true) {
      setOpen(true)
    } else {
      setOpen(false)
    }
  }, [userAccount])

  useEffect(() => {
    if (!userAccount.checked) return
    if (!userAccount.lojaId && userAccount?.funcao !== "Admin") return
    if (lojaLoaded.current) return
    if (!userAccount.colaboradorId) return

    lojaLoaded.current = true

    if (userAccount?.funcao !== "Admin") {
      dispatch(allColaboradores());
      dispatch(getLoja())
      dispatch(allMetas());
    } else {
      dispatch(filterAllColaboradores({}));
      dispatch(filterLojas({}))
    }

  }, [userAccount.checked, userAccount.lojaId, userAccount.colaboradorId, dispatch])

  // Captura os alertas e exibe na tela
  useEffect(() => {
    // alerta do colaborador
    if (alerta?.open) {
      const message = alerta.title
        ? `${alerta.title}: ${alerta.message}`
        : alerta.message;

      switch (alerta.severity) {
        case "success":
          toast.success(message);
          break;
        case "error":
          toast.error(message);
          break;
        case "warning":
          toast.warning(message);
          break;
        case "info":
          toast.info(message);
          break;
        default:
          toast(message);
      }

      dispatch(
        setAlerta({
          ...alerta,
          open: false,
        })
      );
    }

    // alerta da loja
    if (alertaLoja?.open) {
      const message = alertaLoja.title
        ? `${alertaLoja.title}: ${alertaLoja.message}`
        : alertaLoja.message;

      switch (alertaLoja.severity) {
        case "success":
          toast.success(message);
          break;
        case "error":
          toast.error(message);
          break;
        case "warning":
          toast.warning(message);
          break;
        case "info":
          toast.info(message);
          break;
        default:
          toast(message);
      }

      dispatch(
        setAlertaLoja({
          ...alertaLoja,
          open: false,
        })
      );
    }
  }, [alerta, alertaLoja, dispatch]);

  // Redirect se não estiver logado
  useEffect(() => {
    if (isLoaded && !isSignedIn) {
      dispatch(updateUser({
        colaboradorId: '',
        email: '',
        firstName: '',
        lastName: '',
        imageUrl: '',
        userIdClerk: '',
        checked: false,
      }))
      router.replace("/login")
    }
  }, [isLoaded, isSignedIn, router])

  // Redireciona quando for "home"
  useEffect(() => {
    if (activeView === "home") {
      router.push("/")
    }
  }, [activeView, router])

  // salva as preferencias de sidebar
  useEffect(() => {
    if (!isLoaded || !isSignedIn) return
    localStorage.setItem(`sidebar-open-${userAccount?.nome}`, JSON.stringify(sidebarOpen))
  }, [sidebarOpen, isLoaded, isSignedIn])

  // Enquanto carrega OU redireciona, não renderiza nada
  if (!isLoaded || !isSignedIn) {
    return null
  }

  const renderView = () => {
    switch (activeView) {
      case "colaboradores":
        return <ColaboradoresView />
      case "lojas":
        return <LojasView />
      case "metas":
        return <MetasView />
      default:
        return <DashboardView />
    }
  }

  return (
    <>
      <Header />

      <SidebarProvider open={sidebarOpen} onOpenChange={setSidebarOpen}>
        <AppSidebar
          activeView={activeView}
          onChangeView={setActiveView}
        />

        <SidebarInset>
          <div className="bg-background sticky top-0 flex h-16 items-center gap-2 border-b px-4 mt-10">
            <SidebarTrigger className="-ml-1" />
            <Separator orientation="vertical" className="h-4" />

            <Breadcrumb>
              <BreadcrumbList>
                <BreadcrumbItem>
                  <BreadcrumbPage className="capitalize font-medium">
                    <AuroraText>Fabrispuma - Loja: {lojaAccount.nome}</AuroraText>
                  </BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>

            <div className="ml-auto flex items-center gap-4">
              <SheetComponentUser />
              <SheetComponent />
              <AnimatedThemeToggler />
            </div>
          </div>

          <div className="flex flex-1 flex-col gap-4 p-4">
            {renderView()}
          </div>
        </SidebarInset>
      </SidebarProvider>
      <OnboardingModal
        open={open}
        onFinish={() => setOpen(false)}
      />
    </>
  )
}
