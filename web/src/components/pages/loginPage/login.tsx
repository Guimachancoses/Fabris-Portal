'use client'

import { useSignIn } from "@clerk/nextjs";
import { useState, useCallback } from "react";
import { LogoIcon } from '@/src/components/logo'
import { Button } from '@/src/components/ui/button'
import { Input } from '@/src/components/ui/input'
import { Label } from '@/src/components/ui/label'
import Link from 'next/link'
import { z } from "zod";
import { useDispatch } from "react-redux";
import { checkUser, updateUser } from "@/src/store/modules/colaborador/actions";
import { useSearchParams } from "next/navigation";
import { useEffect, useMemo } from "react";


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

type LoginProps = {
    onForgot: () => void;
    onCreate: () => void;
}

export default function LoginPage({ onForgot, onCreate }: LoginProps) {
    const dispatch = useDispatch()

    const searchParams = useSearchParams();

    const hasInvitation = useMemo(() => {
        return (
            searchParams.has("__clerk_ticket") &&
            searchParams.get("__clerk_status") === "sign_up"
        );
    }, [searchParams]);

    useEffect(() => {
        if (hasInvitation) {
          onCreate();
        }
      }, [hasInvitation, onCreate]);
      

    const { signIn, isLoaded, setActive } = useSignIn();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    const [errors, setErrors] = useState<{
        email?: string;
        password?: string;
        root?: string;
    }>({});

    const [loadingSocial, setLoadingSocial] = useState({
        google: false,
        facebook: false
    });

    async function handleLogin() {
        if (!isLoaded || !signIn) return;

        setErrors({});

        const validation = loginSchema.safeParse({
            email,
            password,
        });

        if (!validation.success) {
            const fieldErrors: typeof errors = {};

            validation.error.issues.forEach((issue) => {
                const field = issue.path[0];
                if (field === "email" || field === "password") {
                    fieldErrors[field] = issue.message;
                }
            });

            setErrors(fieldErrors);
            return;
        }

        dispatch(updateUser({
            email: email
        }))
        dispatch(checkUser())
        try {
            const result = await signIn.create({
                identifier: email,
                password,
            });

            if (result.status === "complete") {
                await setActive({
                    session: result.createdSessionId
                });
                dispatch(checkUser())
            }
            setErrors({ root: "Não foi possível concluir o login" });

        } catch (err) {
            //console.log(err)
            setErrors({
                root: "Email ou senha inválidos",
            });
        }
    }


    const handleSocialLogin = useCallback(

        async (strategy: "google" | "facebook") => {
            if (!isLoaded || !signIn) return;

            try {

                setLoadingSocial(prev => ({ ...prev, [strategy]: true }));

                const strategyMap = {
                    google: "oauth_google",
                    facebook: "oauth_facebook",
                } as const;

                await signIn.authenticateWithRedirect({
                    strategy: strategyMap[strategy],
                    redirectUrl: "/sign-in/sso-callback",
                    redirectUrlComplete: "/login",
                });


            } catch (err) {
                //console.error(`Erro no login ${strategy}:`, err);
                setLoadingSocial(prev => ({ ...prev, [strategy]: false }));
            }
        },
        [signIn, isLoaded]
    );

    console.log(process.env.NEXT_PUBLIC_CLERK_SIGN_IN_URL)

    return (
        <section>

            <form
                action=""
                className="bg-card m-auto h-fit w-full max-w-sm rounded-[calc(var(--radius)+.125rem)] border p-0.5 shadow-md dark:[--color-muted:var(--color-zinc-900)]">
                <div className="p-8 pb-6">
                    <div className="flex flew-row gap-2 justify-start align-center items-center pb-5">
                        <Link href="/" aria-label="go home">
                            <LogoIcon className='flex justify-center align-center items-center' />
                        </Link>
                        <h1 className="flex justify-center align-center items-center text-xl font-semibold">Acessar a Fabris Meta</h1>
                    </div>

                    <p className="text-sm">Bem vindo de volta! acesse para continuar</p>

                    <div className="mt-6 grid grid-cols-2 gap-3">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => handleSocialLogin('google')}
                            disabled={!isLoaded || loadingSocial.google}
                        >
                            {loadingSocial.google ? 'Carregando...' : <>
                                <svg xmlns="http://www.w3.org/2000/svg" width="0.98em" height="1em" viewBox="0 0 256 262">
                                    <path fill="#4285f4" d="M255.878 133.451c0-10.734-.871-18.567-2.756-26.69H130.55v48.448h71.947c-1.45 12.04-9.283 30.172-26.69 42.356l-.244 1.622l38.755 30.023l2.685.268c24.659-22.774 38.875-56.282 38.875-96.027"></path>
                                    <path fill="#34a853" d="M130.55 261.1c35.248 0 64.839-11.605 86.453-31.622l-41.196-31.913c-11.024 7.688-25.82 13.055-45.257 13.055c-34.523 0-63.824-22.773-74.269-54.25l-1.531.13l-40.298 31.187l-.527 1.465C35.393 231.798 79.49 261.1 130.55 261.1"></path>
                                    <path fill="#fbbc05" d="M56.281 156.37c-2.756-8.123-4.351-16.827-4.351-25.82c0-8.994 1.595-17.697 4.206-25.82l-.073-1.73L15.26 71.312l-1.335.635C5.077 89.644 0 109.517 0 130.55s5.077 40.905 13.925 58.602z"></path>
                                    <path fill="#eb4335" d="M130.55 50.479c24.514 0 41.05 10.589 50.479 19.438l36.844-35.974C195.245 12.91 165.798 0 130.55 0C79.49 0 35.393 29.301 13.925 71.947l42.211 32.783c10.59-31.477 39.891-54.251 74.414-54.251"></path>
                                </svg>
                                <span>Google</span>
                            </>}
                        </Button>

                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => handleSocialLogin('facebook')}
                            disabled={!isLoaded || loadingSocial.facebook}
                        >
                            {loadingSocial.facebook ? 'Carregando...' : <>
                                <svg xmlns="http://www.w3.org/2000/svg" className="size-4" viewBox="0 0 256 256">
                                    <path fill="#1877f2" d="M256 128C256 57.308 198.692 0 128 0S0 57.308 0 128c0 63.888 46.808 116.843 108 126.445V165H75.5v-37H108V99.8c0-32.08 19.11-49.8 48.348-49.8C170.352 50 185 52.5 185 52.5V84h-16.14C152.959 84 148 93.867 148 103.99V128h35.5l-5.675 37H148v89.445c61.192-9.602 108-62.556 108-126.445"></path>
                                    <path fill="#fff" d="m177.825 165l5.675-37H148v-24.01C148 93.866 152.959 84 168.86 84H185V52.5S170.352 50 156.347 50C127.11 50 108 67.72 108 99.8V128H75.5v37H108v89.445A129 129 0 0 0 128 256a129 129 0 0 0 20-1.555V165z"></path>
                                </svg>
                                <span>Facebook</span>
                            </>}
                        </Button>
                    </div>

                    <hr className="my-4 border-dashed" />

                    <div className="space-y-6">
                        <div className="space-y-2">
                            <Label
                                htmlFor="email"
                                className="block text-sm">
                                Email
                            </Label>
                            <Input
                                type="email"
                                required
                                name="email"
                                id="email"
                                placeholder="exemplo@email.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                            />
                            {errors.email && (
                                <p className="text-sm text-red-500">{errors.email}</p>
                            )}

                        </div>

                        <div className="space-y-0.5">
                            <div className="flex items-center justify-between">
                                <Label
                                    htmlFor="pwd"
                                    className="text-sm">
                                    Senha
                                </Label>
                                <Button
                                    type="button"
                                    variant="link"
                                    size="sm"
                                    onClick={onForgot}
                                >
                                    Esqueceu a senha ?
                                </Button>
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
                        {errors.root && (
                            <p className="text-sm text-red-500 text-center">
                                {errors.root}
                            </p>
                        )}

                        <Button
                            type="button"
                            className="w-full"
                            onClick={handleLogin}
                        >
                            Entrar
                        </Button>
                    </div>
                </div>

                {/* <div className="bg-muted rounded-(--radius) border p-3">
                    <p className="text-accent-foreground text-center text-sm">
                        Não possui uma conta ?
                        <Button
                            asChild
                            variant="link"
                            className="px-2"
                            onClick={onCreate}
                        >
                            <Link href=""> Cadastra-se</Link>
                        </Button>
                    </p>
                </div> */}
            </form>

        </section>
    )
}
