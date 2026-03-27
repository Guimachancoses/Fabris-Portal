'use client'

import { LogoIcon } from '@/src/components/logo'
import { Button } from '@/src/components/ui/button'
import { Input } from '@/src/components/ui/input'
import { Label } from '@/src/components/ui/label'
import { useSignUp } from '@clerk/nextjs'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { useState } from 'react'
import { useDispatch } from 'react-redux'
import { checkUser, allUpdateColaborador, updateColaborador } from '@/src/store/modules/colaborador/actions'

type LoginProps = {
    onForgot: () => void
}

export default function CreatePage({ onForgot }: LoginProps) {
    const dispatch = useDispatch()
    const { signUp, isLoaded, setActive } = useSignUp()
    const searchParams = useSearchParams()

    const status = searchParams.get('__clerk_status')
    const ticket = searchParams.get('__clerk_ticket')

    const [form, setForm] = useState({
        firstname: '',
        lastname: '',
        password: '',
    })

    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    // Bloqueia se não tiver convite
    if (status !== 'sign_up' || !ticket) {
        return (
            <p className="text-center text-sm text-red-500">
                Acesso inválido. Você precisa de um convite para criar uma conta.
            </p>
        )
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!isLoaded) return

        try {
            setLoading(true)
            setError(null)

            const result = await signUp.create({
                strategy: 'ticket',
                ticket: ticket,
                password: form.password,
                firstName: form.firstname,
                lastName: form.lastname,
            })

            // Finaliza o fluxo
            if (result.status === "complete") {
                await setActive({
                    session: result.createdSessionId,
                });

                dispatch(
                    updateColaborador({
                        colaborador: { 
                            email: result.emailAddress, 
                            recipientId: '',
                        },
                    })
                );

                dispatch(allUpdateColaborador());
                dispatch(checkUser());
            } else {
                setError("Não foi possível concluir o login");
            }
        } catch (err: any) {
            setError(err?.errors?.[0]?.message || 'Erro ao criar conta')
        } finally {
            setLoading(false)
        }
    }

    return (
        <section>
            <form
                onSubmit={handleSubmit}
                className="bg-card m-auto h-fit w-full max-w-sm rounded-[calc(var(--radius)+.125rem)] border p-0.5 shadow-md"
            >
                <div className="p-8 pb-6">
                    <div className="flex gap-2 items-center pb-5">
                        <Link href="/" aria-label="go home">
                            <LogoIcon />
                        </Link>
                        <h1 className="text-xl font-semibold">
                            Criar acesso no Fabris Meta
                        </h1>
                    </div>

                    <p className="text-sm">Convite válido. Complete seu cadastro.</p>

                    <div className="space-y-5 mt-6">
                        <div className="grid grid-cols-2 gap-3">
                            <div>
                                <Label>Nome</Label>
                                <Input
                                    type='text'
                                    required
                                    value={form.firstname}
                                    onChange={(e) =>
                                        setForm({ ...form, firstname: e.target.value })
                                    }
                                />
                            </div>
                            <div>
                                <Label>Sobrenome</Label>
                                <Input
                                    type='text'
                                    required
                                    value={form.lastname}
                                    onChange={(e) =>
                                        setForm({ ...form, lastname: e.target.value })
                                    }
                                />
                            </div>
                        </div>

                        <div>
                            <Label>Senha</Label>
                            <Input
                                type="password"
                                required
                                value={form.password}
                                onChange={(e) =>
                                    setForm({ ...form, password: e.target.value })
                                }
                            />
                        </div>

                        {error && (
                            <p className="text-sm text-red-500">{error}</p>
                        )}

                        <Button className="w-full" disabled={loading}>
                            {loading ? 'Criando conta...' : 'Criar conta'}
                        </Button>
                    </div>
                </div>

                <div className="bg-muted border p-3 text-center text-sm">
                    Já possui uma conta?
                    <Button
                        variant="link"
                        className="px-2"
                        onClick={onForgot}
                    >
                        Entrar
                    </Button>
                </div>
            </form>
        </section>
    )
}
