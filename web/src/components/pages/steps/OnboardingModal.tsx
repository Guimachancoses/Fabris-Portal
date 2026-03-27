"use client";

import { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogTitle } from "@/src/components/ui/dialog";
import { Button } from "@/src/components/ui/button";
import clsx from "clsx";
import { LogoIcon } from "../../logo";
import {
    allUpdateColaborador,
    checkUser,
    updateColaborador
} from "@/src/store/modules/colaborador/actions";
import { useDispatch, useSelector } from "react-redux";
import { StoreSetupModal } from "./StoreSetupModal";
import { DashboardTour } from "./DashboardTour";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden"

const steps = [
    { id: "welcome", label: "Seja bem-vindo" },
    { id: "profile", label: "Conclua seu cadastro" },
    { id: "finish", label: "Finalizar" },
];

export function OnboardingModal({
    open,
    onFinish,
}: {
    open: boolean;
    onFinish: () => void;
}) {
    const [stepIndex, setStepIndex] = useState(0);
    const [openStoreSetup, setOpenStoreSetup] = useState(false);
    const [showOnboarding, setShowOnboarding] = useState(open)
    const [runTour, setRunTour] = useState(false);
    const step = steps[stepIndex];
    const dispatch = useDispatch()
    const { userAccount, components } = useSelector((state: any) => state.colaborador)

    // Carrega as informações do usuário logado
    useEffect(() => {
        dispatch(checkUser())
    }, [dispatch]);

    const next = () => {
        if (stepIndex < steps.length - 1) {
            setStepIndex((s) => s + 1);
        } else {
            onFinish();
        }
    };

    const back = () => {
        if (stepIndex > 0) setStepIndex((s) => s - 1);
    };

    function handleStartTour() {
        // Fecha todos os dialogs
        setShowOnboarding(false)
        setOpenStoreSetup(false)

        // Espera o DOM limpar overlays
        setTimeout(() => {
            setRunTour(true)
        }, 300)
    }

    return (
        <>
            <Dialog open={open}>
                <DialogContent className="max-w-4xl p-0 overflow-hidden">
                    <VisuallyHidden>
                        <DialogTitle>Onboarding</DialogTitle>
                    </VisuallyHidden>
                    <div className="grid grid-cols-[260px_1fr] h-[420px]">

                        {/* SIDEBAR */}
                        <aside className="bg-muted p-6 flex flex-col gap-4">
                            <h2 className="font-semibold text-lg">Primeiros passos</h2>

                            <ul className="space-y-2">
                                {steps.map((s, index) => (
                                    <li
                                        key={s.id}
                                        className={clsx(
                                            "rounded-md px-3 py-2 text-sm",
                                            index === stepIndex
                                                ? "bg-primary text-white"
                                                : "text-muted-foreground"
                                        )}
                                    >
                                        {s.label}
                                    </li>
                                ))}
                            </ul>

                            <div className="mt-auto text-xs text-muted-foreground flex flex-row justify-start align-center items-center gap-2">
                                <LogoIcon />
                                Fabris Meta
                            </div>
                        </aside>

                        {/* CONTENT */}
                        <main className="p-8 flex flex-col">
                            {step.id === "welcome" && (
                                <>
                                    <h3 className="text-xl font-semibold mb-2">
                                        Seja bem-vindo 👋
                                    </h3>
                                    <p className="text-muted-foreground">
                                        Vamos te guiar rapidamente para configurar tudo e começar a
                                        usar o sistema.
                                    </p>
                                </>
                            )}

                            {step.id === "profile" && (
                                <>
                                    <h3 className="text-xl font-semibold mb-2">
                                        Conclua seu cadastro
                                    </h3>

                                    <p className="text-muted-foreground mb-4">
                                        Verifique seus dados básicos como nome, e-mail e perfil.
                                    </p>

                                    <Button
                                        variant="default"
                                        className="w-fit"
                                        disabled={!components.firstSteps}
                                        onClick={() => setOpenStoreSetup(true)}
                                    >
                                        Clique aqui
                                    </Button>
                                </>
                            )}

                            {step.id === "finish" && (
                                <>
                                    <h3 className="text-xl font-semibold mb-2">
                                        Tudo pronto 🎉
                                    </h3>
                                    <p className="text-muted-foreground mb-10">
                                        Seu ambiente está configurado. Bom trabalho!
                                    </p>
                                    <p className="text-muted-foreground">
                                        Vamos mostrar rapidamente onde ficam os principais recursos.
                                    </p>

                                </>
                            )}

                            {/* ACTIONS */}
                            <div className="mt-auto flex justify-between">
                                <Button
                                    variant="outline"
                                    disabled={stepIndex === 0}
                                    onClick={back}
                                >
                                    Voltar
                                </Button>

                                <Button
                                    disabled={components.firstSteps && stepIndex === 1}
                                    onClick={() => {
                                        if (step.id === "finish") {
                                            dispatch(updateColaborador({
                                                colaborador: {
                                                    ...userAccount,
                                                    first: false,
                                                }
                                            }));

                                            setTimeout(() => {
                                                dispatch(allUpdateColaborador());
                                            }, 1000);

                                            handleStartTour();
                                            next();
                                            return;
                                        }

                                        next();
                                    }}

                                >
                                    {stepIndex === steps.length - 1
                                        ? "Finalizar"
                                        : "Próximo"}
                                </Button>

                            </div>
                        </main>
                    </div>
                </DialogContent>
            </Dialog>
            <StoreSetupModal
                open={openStoreSetup}
                onClose={() => setOpenStoreSetup(false)}
            />
            <DashboardTour
                run={runTour}
                onFinish={() => setRunTour(false)}
            />
        </>
    );
}
