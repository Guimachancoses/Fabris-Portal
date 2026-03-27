'use client'

import { useEffect, useRef } from 'react'
import { useClerk, useAuth } from '@clerk/nextjs'
import { useRouter } from 'next/navigation'
import SplashScreen from '@/src/components/pages/splashPage/splash-screen'

export default function SSOCallbackPage() {
  const { handleRedirectCallback } = useClerk()
  const { isSignedIn, isLoaded } = useAuth()
  const hasRun = useRef(false)
  const router = useRouter()

  useEffect(() => {
    if (hasRun.current) return
    hasRun.current = true
    handleRedirectCallback({
      signInForceRedirectUrl: '/login',
      signUpForceRedirectUrl: '/login',
    })
      .then(() => {
        if (!isSignedIn && !isLoaded) {
          router.replace('/login')
        }
      })
      .catch(() => {
        router.replace('/login')
      })
  }, [isSignedIn, router])

  return <SplashScreen />
}
