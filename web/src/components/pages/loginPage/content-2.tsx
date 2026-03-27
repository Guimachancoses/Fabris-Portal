'use client'

import Image from 'next/image'
import Login from './login'
import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import ForgotPasswordPage from './forgot-password'
import CreatePage from './sign-up'
import { GridPattern } from '../../ui/grid-pattern'

export default function ContentSection() {


    const [screen, setScreen] = useState<'login' | 'forgot' | 'create'>('login')

    return (
        <section id="scroll-container" className="h-screen overflow-y-auto pt-32 sm:pt-8 lg:pt-0 pb-34">
            {/* Background grid */}
            <GridPattern
                squares={[
                    [4, 4],
                    [5, 1],
                    [8, 2],
                    [5, 3],
                    [5, 5],
                ]}
                className="absolute inset-0 h-full w-full text-black/40"
            />
            <div className="grid min-h-[85vh] grid-cols-1 lg:grid-cols-2 items-center px-4 md:px-16 lg:px-32 w-full">

                <div className="mx-auto max-w-5xl space-y-8 px-6 md:space-y-16">
                    <h2 className="relative z-10 max-w-xl text-4xl font-medium lg:text-1xl">Acesso exclusivo para acompanhar, analisar e evoluir os resultados da sua loja</h2>
                    <div className="relative">
                        <div className="relative z-10 space-y-4 md:w-1/2">
                            <p>
                                Tenha uma visão completa do desempenho da sua loja, com controle diário do faturamento e acompanhamento claro das metas.
                            </p>
                            <p>
                                Entenda o alcance de cada vendedor para incentivar a performance, apoiar decisões comerciais e conduzir negociações com mais segurança.
                            </p>
                        </div>
                        <div className="md:mask-l-from-35% md:mask-l-to-55% h-fit md:absolute md:-inset-y-55 md:inset-x-0 md:mt-0">
                            <div className="border-border/50 relative rounded-2xl border border-dotted p-2">
                                <Image
                                    src="/Fabrispuma_25_anos.jpg"
                                    className="hidden rounded-[12px] dark:block"
                                    alt="payments illustration dark"
                                    width={1207}
                                    height={929}
                                />
                                <Image
                                    src="/Fabrispuma_25_anos.jpg"
                                    className="rounded-[12px] shadow dark:hidden"
                                    alt="payments illustration light"
                                    width={787}
                                    height={929}
                                />
                            </div>
                        </div>

                    </div>
                </div>

                {/* FAIXA AZUL ESFUMAÇADA NO MEIO */}
                <div
                    className="
                            pointer-events-none
                            absolute
                            inset-y-0
                            right-[35%]
                            w-[40px]
                            bg-[linear-gradient(1deg,rgba(11,59,118,0)_0%,rgba(11,59,118,0.6)_50%,rgba(11,59,118,0)_100%)]
                            blur-2xl
                        "
                />

                {/* LOGIN À DIREITA */}
                <div
                    className="
                                static
                                flex
                                w-full
                                justify-center

                                lg:absolute
                                lg:right-[5%]

                                lg:z-30
                                lg:max-w-sm
                                xl:max-w-md

                                lg:scale-95
                                xl:scale-100
                            "
                >

                    <AnimatePresence mode="wait">
                        {screen === 'login' && (
                            <motion.div
                                key="login"
                                className="w-full max-w-md"
                                initial={{ opacity: 0, y: 20, filter: 'blur(10px)' }}
                                animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                                exit={{ opacity: 0, y: -20, filter: 'blur(10px)' }}
                                transition={{ duration: 0.5, ease: 'easeInOut' }}
                            >
                                <Login onForgot={() => setScreen('forgot')}
                                    onCreate={() => setScreen('create')} />
                            </motion.div>
                        )}

                        {screen === 'forgot' && (
                            <motion.div
                                key="forgot"
                                className="w-full max-w-md"
                                initial={{ opacity: 0, y: 20, filter: 'blur(10px)' }}
                                animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                                exit={{ opacity: 0, y: -20, filter: 'blur(10px)' }}
                                transition={{ duration: 0.5, ease: 'easeInOut' }}
                            >
                                <ForgotPasswordPage onForgot={() => setScreen('login')} />
                            </motion.div>
                        )}

                        {screen === 'create' && (
                            <motion.div
                                key="create"
                                className="w-full max-w-md"
                                initial={{ opacity: 0, y: 20, filter: 'blur(10px)' }}
                                animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                                exit={{ opacity: 0, y: -20, filter: 'blur(10px)' }}
                                transition={{ duration: 0.5, ease: 'easeInOut' }}
                            >
                                <CreatePage onForgot={() => setScreen('login')} />
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>
        </section>
    )
}
