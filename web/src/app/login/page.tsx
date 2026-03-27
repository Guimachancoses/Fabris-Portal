'use client'

import { useEffect, useRef, useState } from 'react'
import { useAuth, useClerk } from '@clerk/nextjs'
import { useRouter } from 'next/navigation'
import { useDispatch, useSelector } from 'react-redux'

import Header from '@/src/components/header'
import FooterSection from '@/src/components/footer'
import { DockComponent } from '@/src/components/dock-component'
import ContentSection from '@/src/components/pages/loginPage/content-2'
import SplashScreen from '@/src/components/pages/splashPage/splash-screen'

import { checkUser, setAlerta, updateUser } from '@/src/store/modules/colaborador/actions'
import { toast } from 'sonner'
import { getLoja } from '@/src/store/modules/loja/actions'

const SPLASH_MIN_TIME = 1000 // 👈 1 segundo (ajuste como quiser)

export default function LoginPage() {
  const { isSignedIn, isLoaded } = useAuth()
  const { user } = useClerk()
  const dispatch = useDispatch()
  const router = useRouter()

  const { userAccount } = useSelector((state: any) => state.colaborador)

  const hasInitialized = useRef(false)
  const [canNavigate, setCanNavigate] = useState(false)

  const alerta = useSelector((state: any) => state.colaborador.alerta);

  // tempo mínimo da splash
  useEffect(() => {
    const timer = setTimeout(() => {
      setCanNavigate(true)
    }, SPLASH_MIN_TIME)

    return () => clearTimeout(timer)
  }, [])

  // inicialização do usuário
  useEffect(() => {
    if (!isLoaded || !isSignedIn || !user) return
    if (hasInitialized.current) return

    hasInitialized.current = true

    dispatch(updateUser({
      email: user.primaryEmailAddress?.emailAddress ?? '',
      firstName: user?.firstName ?? '',
      lastName: user?.lastName ?? '',
      imageUrl: user?.imageUrl ?? '',
      userIdClerk: user?.id ?? '',
    }))

    dispatch(checkUser())
    dispatch(getLoja())
  }, [isLoaded, isSignedIn, user, dispatch])

  // navegação só depois do tempo mínimo
  useEffect(() => {
    if (userAccount?.checked && canNavigate) {
      router.replace('/dashboard')
    }
  }, [userAccount?.checked, canNavigate, router])

  useEffect(() => {
      if (!alerta?.open) return;

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

      // IMPORTANTE: fechar o alerta para não repetir
      dispatch(
          setAlerta({
              ...alerta,
              open: false,
          })
      );
  }, [alerta]);

  /**
   * Splash aparece enquanto:
   * - Clerk não carregou
   * - usuário está autenticado
   * - validação não terminou
   * - tempo mínimo não acabou
   */
  if (
    !isLoaded ||
    isSignedIn ||
    !canNavigate ||
    (isSignedIn && !userAccount?.checked)
  ) {
    return <SplashScreen />
  }

  return (
    <>
      <Header />
      <ContentSection />
      <DockComponent />
      <FooterSection />
    </>
  )
}
