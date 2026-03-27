import { useSelector } from "react-redux"
import { UsuarioList } from "./usuarioList"
import { formatCurrencyBR } from "@/src/lib/utils"

type MetasDetailsProps = {
    selected: {
        ano: number | null
        mes: string | null
    }
}

export function MetasDetails({ selected }: MetasDetailsProps) {
    const { objetivos } = useSelector((state: any) => state.loja)

    if (!selected.ano || !selected.mes) {
        return (
            <div className="rounded-xl border p-6 text-muted-foreground">
                Selecione o ano e um mês para visualizar os detalhes
            </div>
        )
    }

    const colaboradoresProcessados =
        objetivos?.colaboradores?.map((colaborador: any, index: number) => ({
            id: index + 1,
            nome: `${colaborador?.nome} ${colaborador?.sobrenome}`,
            meta: formatCurrencyBR(colaborador?.metas?.[0]?.meta),
            faturamento: formatCurrencyBR(colaborador?.metas?.[0]?.faturamento),
        })) ?? []

    const metaLoja = objetivos?.loja?.[0];

    return (
        <div className="rounded-xl border p-6 space-y-6">

            {/* Topo */}
            <div className="grid grid-cols-2 gap-4">
                <div>
                    <p className="text-sm text-muted-foreground">Meta</p>
                    <p className="text-2xl font-semibold">
                        R$ {metaLoja ? formatCurrencyBR(metaLoja.meta) : "--"}
                    </p>
                </div>

                <div>
                    <p className="text-sm text-muted-foreground">Faturamento</p>
                    <p>
                        R$ {metaLoja ? formatCurrencyBR(metaLoja.faturamento) : "--"}
                    </p>
                </div>
            </div>

            {/* Usuários */}
            <UsuarioList colaboradores={colaboradoresProcessados} />
        </div>
    )
}
