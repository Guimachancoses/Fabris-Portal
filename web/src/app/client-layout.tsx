'use client'

import '@fontsource/roboto/300.css'
import '@fontsource/roboto/400.css'
import '@fontsource/roboto/500.css'
import '@fontsource/roboto/700.css'

import { ClerkProvider } from '@clerk/nextjs'
import { ptBR } from '@clerk/localizations'
import { Theme as RadixTheme } from '@radix-ui/themes'
import { Toaster } from 'sonner'

// 👉 MUI
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider'
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs'
import { ThemeProvider as MuiThemeProvider, createTheme } from '@mui/material/styles'
import CssBaseline from '@mui/material/CssBaseline'

// 👉 Dayjs locale
import 'dayjs/locale/pt-br'

import Providers from './providers'
import ClientLayoutWrapper from '../components/pages/splashPage/client-layout-wrapper'

const muiTheme = createTheme({
  typography: {
    fontFamily: 'Roboto, Arial, sans-serif',
  },
})

export default function ClientLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <ClerkProvider localization={ptBR}>
      <MuiThemeProvider theme={muiTheme}>
        <CssBaseline />

        {/* 🔑 Provider GLOBAL do DatePicker */}
        <LocalizationProvider
          dateAdapter={AdapterDayjs}
          adapterLocale="pt-br"
        >
          <Providers>
            <ClientLayoutWrapper>
              <RadixTheme>
                {children}
              </RadixTheme>
            </ClientLayoutWrapper>
          </Providers>
        </LocalizationProvider>

        <Toaster
          richColors
          position="top-right"
          toastOptions={{
            style: {
              zIndex: 9999,
            },
          }}
        />
      </MuiThemeProvider>
    </ClerkProvider>
  )
}
