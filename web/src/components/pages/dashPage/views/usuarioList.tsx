import { formatCurrencyBR } from "@/src/lib/utils"

type UsuarioListProps = {
  colaboradores: Array<{
    id: number
    nome: string
    meta: string
    faturamento: string
  }>
}

export function UsuarioList({ colaboradores }: UsuarioListProps) {
  if (!colaboradores || colaboradores.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">
        Nenhum colaborador encontrado
      </p>
    )
  }

  return (
    <div>
      <div className="flex justify-between">
        <h4 className="font-medium mb-2">Colaboradores</h4>
        <div className="flex justify-between gap-6 px-4">
          <h4 className="text-sm text-muted-foreground">Meta</h4>
          <h4 className="text-sm text-muted-foreground">Faturamento</h4>
        </div>
      </div>

      <div className="space-y-2">
        {colaboradores.map((colaborador) => (
          <div
            key={colaborador.id}
            className="cursor-pointer rounded-lg border p-3 hover:bg-muted"
          >
            <div className="flex justify-between">
              <span>{colaborador.nome}</span>
              <div className="flex justify-between gap-4">
                <span className="text-sm text-muted-foreground">
                  R$ {colaborador.meta}
                </span>
                <span className="text-sm font-semibold text-green-600">
                  R$ {colaborador.faturamento}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
