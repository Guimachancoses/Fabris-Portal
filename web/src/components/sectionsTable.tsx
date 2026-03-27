import { useEffect, useMemo, useState } from "react"
import {
    MoreVertical,
    GripVertical,
    Plus,
    SlidersHorizontal,
    Check,
    Search,
    X,
} from "lucide-react"

import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/src/components/ui/table"

import { Button } from "@/src/components/ui/button"
import { Badge } from "@/src/components/ui/badge"

import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/src/components/ui/dropdown-menu"

import {
    ColumnDef,
    flexRender,
    getCoreRowModel,
    getPaginationRowModel,
    useReactTable,
    VisibilityState,
    getFilteredRowModel,
} from "@tanstack/react-table"

import { Section, Period, useSectionsByPeriod } from "@/src/data/useSectionsByPeriod"

import { formatCurrencyBR } from "../lib/utils"

const columns: ColumnDef<Section>[] = [
    {
        id: "drag",
        enableHiding: false,
        cell: () => <GripVertical className="h-4 w-4 text-muted-foreground" />,
    },
    {
        accessorKey: "header",
        header: "Nome",
        enableGlobalFilter: true,
    },
    {
        accessorKey: "meta",
        header: "Objetivo Definido",
        enableGlobalFilter: true,
        cell: ({ getValue }) => {
            const value = getValue<number | null>()
            return value === null ? "-" : `R$ ${formatCurrencyBR(value)}`
        },
    },
    {
        accessorKey: "faturamento",
        header: "Meta Atingida",
        enableGlobalFilter: true,
        cell: ({ getValue }) => {
            const value = getValue<number | null>()
            return value === null ? "-" : `R$ ${formatCurrencyBR(value)}`
        },
    },
    {
        accessorKey: "target",
        header: "E-Commerce",
        cell: ({ getValue }) => {
            const value = getValue<number | null>()
            return value === null ? "-" : `R$ ${formatCurrencyBR(value)}`
        },
    },
    {
        accessorKey: "limit",
        header: "Meta Diária",
        cell: ({ getValue }) => {
            const value = getValue<number | null>()
            return value === null ? "-" : `R$ ${formatCurrencyBR(value)}`
        },
    },
    {
        accessorKey: "reviewer",
        header: "Projeção",
        cell: ({ getValue }) => {
            const value = getValue<number | null>()
            return value === null ? "-" : `R$ ${formatCurrencyBR(value)}`
        },
    },
    {
        id: "actions",
        enableHiding: false,
        cell: () => (
            <Button variant="ghost" size="icon">
                <MoreVertical className="h-4 w-4" />
            </Button>
        ),
    },
]

export function SectionsTable() {

    const [columnVisibility, setColumnVisibility] =
        useState<VisibilityState>({})

    const [globalFilter, setGlobalFilter] = useState("")
    const [mobileSearchOpen, setMobileSearchOpen] = useState(false)

    const [period, setPeriod] = useState<Period>("daily")

    const sectionsByPeriod = useSectionsByPeriod()
    const sections = useMemo(
        () => sectionsByPeriod[period] ?? [],
        [sectionsByPeriod, period]
    )

    const table = useReactTable({
        data: sections,
        columns,
        state: {
            columnVisibility,
            globalFilter,
        },
        onColumnVisibilityChange: setColumnVisibility,
        onGlobalFilterChange: setGlobalFilter,
        getCoreRowModel: getCoreRowModel(),
        getFilteredRowModel: getFilteredRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
    })

    // salva no navegador as preferencias
    useEffect(() => {
        localStorage.setItem(
            "sections-table-columns",
            JSON.stringify(columnVisibility)
        )
    }, [columnVisibility])

    return (
        <div className="space-y-4">
            {/* 🔝 BARRA SUPERIOR */}
            <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                {/* TABS */}
                <div className="relative -mx-4 md:mx-0">
                    <div className="w-full overflow-x-auto scrollbar-hide touch-pan-x">
                        <div className="flex w-max items-center gap-2 px-4 md:px-0">
                            <div className="flex items-center gap-2 rounded-full bg-muted p-1">
                                <Button
                                    size="sm"
                                    variant={period === "daily" ? "secondary" : "ghost"}
                                    className="rounded-full px-3 text-xs md:px-4 md:text-sm"
                                    onClick={() => setPeriod("daily")}
                                >
                                    Diário
                                </Button>

                                <Button
                                    size="sm"
                                    variant={period === "monthly" ? "secondary" : "ghost"}
                                    className="rounded-full px-3 text-xs md:px-4 md:text-sm"
                                    onClick={() => setPeriod("monthly")}
                                >
                                    Mensal
                                </Button>

                                <Button
                                    size="sm"
                                    variant={period === "yearly" ? "secondary" : "ghost"}
                                    className="rounded-full px-3 text-xs md:px-4 md:text-sm"
                                    onClick={() => setPeriod("yearly")}
                                >
                                    Anual
                                </Button>
                            </div>

                        </div>
                    </div>
                </div>


                <div className="flex items-center justify-between gap-2 md:justify-end">
                    {/* MOBILE ACTIONS */}
                    <div className="flex items-center gap-2 md:hidden">
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="outline" size="icon">
                                    <SlidersHorizontal className="h-4 w-4" />
                                </Button>
                            </DropdownMenuTrigger>

                            <DropdownMenuContent align="end" className="w-56">
                                {table
                                    .getAllLeafColumns()
                                    .filter((column) => column.getCanHide())
                                    .map((column) => (
                                        <DropdownMenuItem
                                            key={column.id}
                                            className="flex items-center justify-between"
                                            onSelect={(e) => {
                                                e.preventDefault()
                                                column.toggleVisibility()
                                            }}
                                        >
                                            {column.columnDef.header as string}
                                            {column.getIsVisible() && (
                                                <Check className="h-4 w-4" />
                                            )}
                                        </DropdownMenuItem>
                                    ))}
                            </DropdownMenuContent>
                        </DropdownMenu>


                        <Button size="icon">
                            <Plus className="h-4 w-4" />
                        </Button>
                        {/* 🔍 MOBILE SEARCH */}
                        <div className="relative">
                            {!mobileSearchOpen ? (
                                <Button
                                    variant="outline"
                                    size="icon"
                                    onClick={() => setMobileSearchOpen(true)}
                                >
                                    <Search className="h-4 w-4" />
                                </Button>
                            ) : (
                                <div className="fixed left-1/2 top-16 z-50 -translate-x-1/2 flex items-center gap-1 rounded-md border bg-background p-1 shadow-md">
                                    <input
                                        autoFocus
                                        value={globalFilter ?? ""}
                                        onChange={(e) => setGlobalFilter(e.target.value)}
                                        placeholder="Buscar..."
                                        className="h-8 w-[180px] rounded-md border px-2 text-xs outline-none focus:ring-2 focus:ring-ring"
                                        onBlur={() => {
                                            if (!globalFilter) setMobileSearchOpen(false)
                                        }}
                                    />

                                    <Button
                                        size="icon"
                                        variant="ghost"
                                        className="h-8 w-8"
                                        onClick={() => {
                                            setGlobalFilter("")
                                            setMobileSearchOpen(false)
                                        }}
                                    >
                                        <X className="h-4 w-4" />
                                    </Button>
                                </div>
                            )}

                        </div>

                    </div>

                    {/* DESKTOP ACTIONS */}
                    <div className="hidden md:flex items-center gap-2">
                        <Search className="h-4 w-4" />
                        <input
                            value={globalFilter ?? ""}
                            onChange={(e) => setGlobalFilter(e.target.value)}
                            placeholder="Buscar..."
                            className="h-9 w-[220px] rounded-md border bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring"
                        />
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button size="sm">
                                    <SlidersHorizontal className="mr-2 h-4 w-4" />
                                    Personalizar colunas
                                </Button>
                            </DropdownMenuTrigger>

                            <DropdownMenuContent align="end" className="w-56">
                                {table
                                    .getAllLeafColumns()
                                    .filter((column) => column.getCanHide())
                                    .map((column) => (
                                        <DropdownMenuItem
                                            key={column.id}
                                            className="flex items-center justify-between"
                                            onSelect={(e) => {
                                                e.preventDefault()
                                                column.toggleVisibility()
                                            }}
                                        >
                                            <span className="capitalize">
                                                {column.columnDef.header as string}
                                            </span>

                                            {column.getIsVisible() && (
                                                <Check className="h-4 w-4" />
                                            )}
                                        </DropdownMenuItem>
                                    ))}
                            </DropdownMenuContent>
                        </DropdownMenu>

{/* 
                        <Button size="sm">
                            <Plus className="mr-2 h-4 w-4" />
                            Colaboradores
                        </Button> */}
                    </div>
                </div>
            </div>


            {/* 📋 TABELA */}
            <div className="rounded-xl border shadow-sm overflow-hidden hidden md:block">
                <div className="max-h-[420px] overflow-auto">
                    <Table>
                        <TableHeader className="bg-card sticky top-0 z-10">
                            {table.getHeaderGroups().map((headerGroup) => (
                                <TableRow key={headerGroup.id}>
                                    {headerGroup.headers.map((header) => (
                                        <TableHead key={header.id}>
                                            {header.isPlaceholder
                                                ? null
                                                : flexRender(
                                                    header.column.columnDef.header,
                                                    header.getContext()
                                                )}
                                        </TableHead>
                                    ))}
                                </TableRow>
                            ))}
                        </TableHeader>


                        {/* BODY */}
                        <TableBody>
                            {table.getRowModel().rows.map((row) => (
                                <TableRow key={row.id} className="hover:bg-muted/50">
                                    {row.getVisibleCells().map((cell) => (
                                        <TableCell key={cell.id}>
                                            {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                        </TableCell>
                                    ))}
                                </TableRow>
                            ))}
                        </TableBody>

                    </Table>
                </div>
            </div>
            <div className="hidden md:block">
                {/* TABELA */}
            </div>

            <div className="md:hidden space-y-2">
                {sections.map(section => (
                    <div
                        key={section.id}
                        className="rounded-lg border p-4 space-y-2"
                    >
                        <div className="font-medium">{section.header}</div>

                        <div className="flex justify-between text-sm">
                            <span>Meta:</span>
                            <Badge>R$ {section.meta}</Badge>
                        </div>

                        <div className="flex justify-between text-sm">
                            <span>Diária:</span>
                            <Badge variant="secondary">{section.limit}</Badge>
                        </div>

                        <Button size="sm" variant="outline" className="w-full">
                            Ver detalhes
                        </Button>
                    </div>
                ))}
            </div>
            {/* FOOTER */}
            <div className="flex items-center justify-between px-4 py-2 border-t bg-muted/30 rounded-xl border shadow-sm">
                {/* LEFT */}
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <span>Rows per page</span>

                    <Button variant="outline" size="sm" className="h-8 px-2">
                        {table.getState().pagination.pageSize}
                    </Button>
                </div>

                {/* CENTER */}
                <div className="text-sm text-muted-foreground">
                    Page{" "}
                    <span className="font-medium text-foreground">
                        {table.getState().pagination.pageIndex + 1}
                    </span>{" "}
                    of {table.getPageCount()}
                </div>

                {/* RIGHT */}
                <div className="flex items-center gap-1">
                    <Button
                        variant="outline"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => table.setPageIndex(0)}
                        disabled={!table.getCanPreviousPage()}
                    >
                        «
                    </Button>

                    <Button
                        variant="outline"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => table.previousPage()}
                        disabled={!table.getCanPreviousPage()}
                    >
                        ‹
                    </Button>

                    <Button
                        variant="outline"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => table.nextPage()}
                        disabled={!table.getCanNextPage()}
                    >
                        ›
                    </Button>

                    <Button
                        variant="outline"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => table.setPageIndex(table.getPageCount() - 1)}
                        disabled={!table.getCanNextPage()}
                    >
                        »
                    </Button>
                </div>
            </div>


        </div>
    )
}

