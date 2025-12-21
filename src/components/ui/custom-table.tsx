"use client"

import * as React from "react"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/shadcn/table"
import { cn } from "@/lib/utils"

export interface Column<T> {
    header: string
    accessorKey?: keyof T
    render?: (item: T) => React.ReactNode
    className?: string
    headerClassName?: string
}

interface CustomTableProps<T> {
    data: T[]
    columns: Column<T>[]
    className?: string
    onSelectionChange?: (selectedItems: T[]) => void
    enableSelection?: boolean
}

export function CustomTable<T extends { id: string | number }>({
    data,
    columns,
    className,
    onSelectionChange,
    enableSelection = false
}: CustomTableProps<T>) {
    const [selectedIds, setSelectedIds] = React.useState<Set<string | number>>(new Set())

    const handleSelectAll = (checked: boolean) => {
        if (checked) {
            const allIds = new Set(data.map(item => item.id))
            setSelectedIds(allIds)
            if (onSelectionChange) onSelectionChange(data)
        } else {
            setSelectedIds(new Set())
            if (onSelectionChange) onSelectionChange([])
        }
    }

    const handleSelectRow = (id: string | number, checked: boolean) => {
        const newSelected = new Set(selectedIds)
        if (checked) {
            newSelected.add(id)
        } else {
            newSelected.delete(id)
        }
        setSelectedIds(newSelected)

        if (onSelectionChange) {
            const selectedItems = data.filter(item => newSelected.has(item.id))
            onSelectionChange(selectedItems)
        }
    }

    const isAllSelected = data.length > 0 && selectedIds.size === data.length

    return (
        <div className={cn("w-full overflow-hidden rounded-[20px] border border-sky-950/20", className)}>
            <Table>
                <TableHeader className="bg-[#003366]">
                    <TableRow className="border-b-0 hover:bg-[#003366]">
                        {enableSelection && (
                            <TableHead className="w-[50px] border-r border-white/20 text-center py-4">
                                <button
                                    onClick={() => handleSelectAll(!isAllSelected)}
                                    className="flex items-center justify-center w-full h-full focus:outline-none cursor-pointer group"
                                >
                                    <span
                                        className={cn(
                                            "text-2xl transition-all duration-200",
                                            isAllSelected ? "icon-[mdi--checkbox-marked]" : "icon-[mdi--checkbox-blank-outline]",
                                            "text-white group-hover:scale-110"
                                        )}
                                    ></span>
                                </button>
                            </TableHead>
                        )}
                        {columns.map((col, index) => (
                            <TableHead
                                key={index}
                                className={cn(
                                    "text-white font-bold text-base text-center py-4 border-r border-white/20 uppercase tracking-wider h-auto last:border-r-0",
                                    col.headerClassName
                                )}
                            >
                                {col.header}
                            </TableHead>
                        ))}
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {data.map((item, rowIndex) => (
                        <TableRow
                            key={item.id || rowIndex}
                            className={cn(
                                "border-b border-sky-950/20 hover:bg-neutral-100 last:border-b-0 transition-colors",
                                selectedIds.has(item.id) && "bg-blue-50"
                            )}
                        >
                            {enableSelection && (
                                <TableCell className="text-center py-4 border-r border-sky-950/20 align-middle">
                                    <button
                                        onClick={() => handleSelectRow(item.id, !selectedIds.has(item.id))}
                                        className="flex items-center justify-center w-full h-full focus:outline-none cursor-pointer group"
                                    >
                                        <span
                                            className={cn(
                                                "text-2xl transition-all duration-200",
                                                selectedIds.has(item.id)
                                                    ? "icon-[mdi--checkbox-marked] text-[#003366]"
                                                    : "icon-[mdi--checkbox-blank-outline] text-gray-400 group-hover:text-[#003366]"
                                            )}
                                        ></span>
                                    </button>
                                </TableCell>
                            )}
                            {columns.map((col, colIndex) => (
                                <TableCell
                                    key={colIndex}
                                    className={cn(
                                        "text-sky-950 text-lg border-r border-sky-950/20 py-4 align-middle last:border-r-0",
                                        col.className
                                    )}
                                >
                                    {col.render
                                        ? col.render(item)
                                        : col.accessorKey
                                            ? (item[col.accessorKey] as React.ReactNode)
                                            : null}
                                </TableCell>
                            ))}
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </div>
    )
}
