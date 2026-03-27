import { LogoIcon } from '@/src/components/logo'
import { Button } from '@/src/components/ui/button'
import { Input } from '@/src/components/ui/input'
import { Label } from '@/src/components/ui/label'
import { useSignIn } from '@clerk/nextjs'
import Link from 'next/link'
import { useState } from 'react'
import z from 'zod'
import { InputOTP, InputOTPGroup, InputOTPSeparator, InputOTPSlot } from '../../ui/input-otp'
import { useDispatch } from "react-redux"
import { setAlerta } from "@/src/store/modules/colaborador/actions"

type LoginProps = {
    onForgot: () => void
}

const loginSchema = z.object({
    email: z
        .string()
        .min(1, "Email é obrigatório")
        .email("Email inválido"),
    password: z
        .string()
        .min(1, "Senha é obrigatória")
        .min(8, "Senha deve ter pelo menos 8 caracteres"),
});

export default function ForgotPasswordPage({ onForgot }: LoginProps) {
    const [email, setEmail] = useState("")
    const [password, setPassword] = useState('')
    const [verifyCode, setVerifyCode] = useState(false)
    const [loading, setLoading] = useState(false)
    const [code, setCode] = useState("")
    const dispatch = useDispatch()


    const { isLoaded, signIn, setActive } = useSignIn()

    if (!isLoaded) return null;

    const [errors, setErrors] = useState<{
        email?: string;
        password?: string;
        root?: string;
    }>({});

    async function handleSendCode(e: React.FormEvent) {
        e.preventDefault()
        if (!isLoaded || !signIn) return

        setErrors({})
        setLoading(true)

        try {
            await signIn.create({
                strategy: "reset_password_email_code",
                identifier: email,
            })

            // ✅ ALERTA DE SUCESSO
            dispatch(setAlerta({
                open: true,
                severity: "success",
                title: "Sucesso",
                message: "Email enviado, verifique sua caixa de entrada!",
            }))

            setVerifyCode(true)
        } catch (err) {
            console.error(err)

            dispatch(setAlerta({
                open: true,
                severity: "error",
                title: "Erro",
                message: "Erro ao enviar email. Verifique o endereço informado.",
            }))

            setErrors({ root: "Erro ao enviar email" })
        } finally {
            setLoading(false)
        }
    }


    const handleResetPassword = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!isLoaded || !signIn) return

        setErrors({})
        setLoading(true)

        try {
            const completeSignUp = await signIn.attemptFirstFactor({
                strategy: "reset_password_email_code",
                code,
                password
            });

            if (completeSignUp.status === 'complete') {
                await setActive({ session: completeSignUp.createdSessionId })
            }
        } catch (err) {
            console.error(err)
            setErrors({ root: "Erro ao enviar email" })
        } finally {
            setLoading(false)
        }
    }

    function Spinner() {
        return (
            <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
        )
    }

    return (
        <section >
            <form onSubmit={!verifyCode ? handleSendCode : undefined}
                className="bg-muted m-auto h-fit w-full max-w-sm overflow-hidden rounded-[calc(var(--radius)+.125rem)] border shadow-md shadow-zinc-950/5 dark:[--color-muted:var(--color-zinc-900)]">
                <div className="bg-card -m-px rounded-[calc(var(--radius)+.125rem)] border p-8 pb-6">
                    <div className={!verifyCode
                        ? "flex flex-row gap-2 justify-start items-center pb-5"
                        : "flex flex-row gap-2 justify-start items-center"}>

                        <Link
                            href="/"
                            aria-label="go home">
                            <LogoIcon />
                        </Link>
                        <h1 className="flex justify-center align-center items-center text-xl font-semibold">Recuperar Senha</h1>
                    </div>
                    <p className="text-sm">
                        {!verifyCode
                            ? "Entre com seu e-mail, irá receber um link"
                            : ""}
                    </p>

                    <div className="mt-6 space-y-6">

                        {!verifyCode ? (
                            <>
                                {/* EMAIL */}
                                <div className="space-y-6">
                                    <div className="space-y-2">
                                        <Label htmlFor="email" className="block text-sm">Email</Label>
                                        <Input
                                            type="email"
                                            id="email"
                                            placeholder="name@example.com"
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                            disabled={loading}
                                        />
                                    </div>
                                </div>
                                <Button
                                    type="submit"
                                    className="w-full flex items-center gap-2"
                                    disabled={loading}
                                >
                                    {loading ? (
                                        <>
                                            <Spinner />
                                            Enviando...
                                        </>
                                    ) : (
                                        "Enviar"
                                    )}
                                </Button>
                                <div className="mt-6 text-center">
                                    <p className="text-muted-foreground text-sm">Nós enviaremos um link em seu e-mail.</p>
                                </div>
                            </>
                        ) : (
                            <>
                                {/* OTP */}
                                <div className="mt-6 space-y-2">
                                    <div className="space-y-2">
                                        <Label
                                            htmlFor="pwd"
                                            className="block text-sm">
                                            Digite o código enviado para seu e-mail
                                        </Label>
                                    </div>
                                    <InputOTP
                                        maxLength={6}
                                        value={code}
                                        onChange={(value) => setCode(value)}
                                    >
                                        <InputOTPGroup>
                                            <InputOTPSlot
                                                index={0}
                                                className="bg-white text-black border border-input"
                                            />
                                            <InputOTPSlot
                                                index={1}
                                                className="bg-white text-black border border-input"
                                            />
                                            <InputOTPSlot
                                                index={2}
                                                className="bg-white text-black border border-input"
                                            />
                                        </InputOTPGroup>

                                        <InputOTPSeparator />

                                        <InputOTPGroup>
                                            <InputOTPSlot
                                                index={3}
                                                className="bg-white text-black border border-input"
                                            />
                                            <InputOTPSlot
                                                index={4}
                                                className="bg-white text-black border border-input"
                                            />
                                            <InputOTPSlot
                                                index={5}
                                                className="bg-white text-black border border-input"
                                            />
                                        </InputOTPGroup>
                                    </InputOTP>
                                    <div className="space-y-2">
                                        <div className="flex items-center justify-between">
                                            <Label
                                                htmlFor="pwd"
                                                className="block text-sm">
                                                Nova Senha
                                            </Label>
                                        </div>
                                        <Input
                                            type="password"
                                            required
                                            name="pwd"
                                            id="pwd"
                                            placeholder="********"
                                            className="input sz-md variant-mixed"
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                        />
                                        {errors.password && (
                                            <p className="text-sm text-red-500">{errors.password}</p>
                                        )}
                                    </div>
                                </div>
                                <Button
                                    type="button"
                                    className="w-full mt-4"
                                    onClick={handleResetPassword} // botão apenas para resetar
                                    disabled={loading}
                                >
                                    {loading ? (
                                        <>
                                            <Spinner />
                                            Resetando...
                                        </>
                                    ) : (
                                        "Resetar Senha"
                                    )}
                                </Button>

                            </>
                        )}

                        {errors.root && (
                            <p className="text-sm text-red-500 text-center">
                                {errors.root}
                            </p>
                        )}
                    </div>
                </div>

                <div className="p-3">
                    <p className="text-accent-foreground text-center text-sm">
                        Lembra da sua senha ?
                        <Button
                            asChild
                            variant="link"
                            className="px-2"
                            onClick={onForgot}
                        >
                            <Link href="">Entrar</Link>
                        </Button>
                    </p>
                </div>
            </form>
        </section>
    )
}
