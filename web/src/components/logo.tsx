import { cn } from '@/src/lib/utils'

export const Logo = ({ className, uniColor }: { className?: string; uniColor?: boolean }) => {
    return (
        <div className={cn('relative h-5 w-auto', className)}>
            {/* Logo para tema claro */}
            <img
                src="/logo-fabrispuma.svg"
                alt="Fabrispuma Logo"
                className="h-full w-auto dark:hidden"
            />

            {/* Logo para tema escuro */}
            <img
                src="/logo-fabrispuma.svg"
                alt="Fabrispuma Logo Dark"
                className="hidden h-full w-auto dark:block"
            />

            {/* Gradiente por cima */}
            {/* <svg
                viewBox="0 0 78 18"
                fill="none"
                className={cn('text-foreground h-5 w-auto', className)}>

                <defs>
                    <linearGradient
                        id="logo-gradient"
                        x1="10"
                        y1="0"
                        x2="10"
                        y2="20"
                        gradientUnits="userSpaceOnUse">
                        <stop stopColor="#9B99FE" />
                        <stop
                            offset="1"
                            stopColor="#2BC8B7"
                        />
                    </linearGradient>
                </defs>
            </svg> */}
        </div>
    )
}

export const LogoIcon = ({ className, uniColor }: { className?: string; uniColor?: boolean }) => {
    return (
        <div className={cn('relative size-5', className)}>
            {/* Imagem real do ícone */}
            <img
                src="/fiv-icon-2025.jpg"
                alt="Logo Title"
                className="h-full w-full object-contain"
            />

            {/* Gradiente por cima */}
            <svg
                viewBox="0 0 18 18"
                className="absolute inset-0 h-full w-full"
            >
                <defs> <linearGradient id="logo-gradient" x1="10" y1="0" x2="10" y2="20" gradientUnits="userSpaceOnUse"> <stop stopColor="#9B99FE" /> <stop offset="1" stopColor="#2BC8B7" /> </linearGradient> </defs>
            </svg>
        </div>
    )
}

export const LogoStroke = ({ className }: { className?: string }) => {
    return (
        <div className={cn('relative size-7 w-7', className)}>
            {/* Imagem do logo */}
            <img
                src="/fiv-icon-2025.jpg"
                alt="Logo Title"
                className="h-full w-full object-contain"
            />

            {/* Opcional: gradiente por cima */}
            <svg
                viewBox="0 0 71 25"
                className="absolute inset-0 h-full w-full"
            >
            </svg>
        </div>
    )
}
