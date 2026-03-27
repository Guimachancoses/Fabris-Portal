"use client"

import { File, Folder, Tree } from "@/src/components/ui/file-tree"
import { useEffect } from "react"
import { useDispatch, useSelector } from "react-redux"
import { allMesesAnos } from "@/src/store/modules/loja/actions"

type MetasTreeProps = {
  onSelect: (ano: number | null, mes: string | null) => void
}

export function MetasTree({ onSelect }: MetasTreeProps) {
  const dispatch = useDispatch()

  const periodos = useSelector(
    (state: any) => state.loja?.lojaAccount?.periodos || {}
  )

  useEffect(() => {
    dispatch(allMesesAnos())
  }, [dispatch])

  return (
    <div className="bg-background h-[350px] w-full rounded-lg border p-2">
      <Tree initialExpandedItems={["metas"]}>
        <Folder
          element="Metas"
          value="metas"
          onClick={() => onSelect(null, null)}
        >
          {Object.entries(periodos).map(([ano, meses]: [string, any]) => (
            <Folder
              key={ano}
              element={ano}
              value={ano}
            >
              {Array.isArray(meses) &&
                meses.map((mes: string) => (
                  <File
                    key={`${ano}-${mes}`}
                    value={`${ano}-${mes}`}
                    onClick={(e) => {
                      e.stopPropagation()
                      onSelect(Number(ano), mes)
                    }}
                  >
                    {mes}
                  </File>
                ))}
            </Folder>
          ))}
        </Folder>
      </Tree>
    </div>
  )
}
