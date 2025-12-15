"use client"

import * as React from "react"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
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
}

export function CustomTable<T>({ data, columns, className }: CustomTableProps<T>) {
    return (
        <div className={cn("w-full overflow-hidden rounded-[20px] border border-sky-950/20", className)}>
            <Table>
                <TableHeader className="bg-[#003366]">
                    <TableRow className="border-b-0 hover:bg-[#003366]">
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
                            key={rowIndex}
                            className="border-b border-sky-950/20 hover:bg-neutral-100 last:border-b-0"
                        >
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
