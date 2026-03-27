"use client";

import Joyride, { Step } from "react-joyride";

export function DashboardTour({
    run,
    onFinish,
}: {
    run: boolean;
    onFinish: () => void;
}) {
    const steps: Step[] = [
        {
            target: '[data-tour="user-profile"]',
            content: "Aqui você acessa suas informações de usuário.",
            placement: "bottom",
        },
        {
            target: '[data-tour="ajustar-meta"]',
            content: "Clique aqui para ajustar a meta da loja.",
            placement: "left",
        },
        {
            target: '[data-tour="ajustar-meta-user"]',
            content: "Clique aqui para ajustar a sua meta. E também suas vendas do dia.",
            placement: "left",
        },
        {
            target: '[data-tour="colab-register"]',
            content: 'Para cadastrar os colaboradores da sua loja, acesse a guia “Colaboradores”. Após o cadastro, eles receberão um convite para acessar a plataforma.',
            placement: "left",
        },
        {
            target: '[data-tour="dashboard-grafico"]',
            content: "Este gráfico mostra a projeção das vendas da sua loja.",
            placement: "top",
        },
        {
            target: '[data-tour="table-user"]',
            content: "Nesta tabela, você acompanha em tempo real os detalhes das metas e das projeções dos seus colaboradores.",
            placement: "top",
        },
    ];

    return (
        <Joyride
            steps={steps}
            run={run}
            continuous
            showSkipButton
            disableScrolling
            locale={{
                back: "Voltar",
                close: "Fechar",
                last: "Finalizar",
                next: "Próximo",
                skip: "Pular",
            }}
            styles={{
                options: {
                    zIndex: 10000,
                    primaryColor: "#0f3c6e",
                },
                overlay: {
                    backgroundColor: "rgba(0,0,0,0.6)",
                },
                spotlight: {
                    borderRadius: 8,
                },
            }}
            callback={(data) => {
                if (data.status === "finished" || data.status === "skipped") {
                    onFinish();
                }
            }}
        />
    );
}
