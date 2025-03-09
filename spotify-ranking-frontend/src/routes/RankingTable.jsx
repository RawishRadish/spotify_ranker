import React, { useMemo, useState } from "react";
import { 
    useReactTable, 
    getCoreRowModel,
    getSortedRowModel,
    flexRender,
} from "@tanstack/react-table";

export default function RankingTable({ songs }) {
    const [sorting, setSorting] = useState([]);

    // Add position to each song before passing data to the table
    const processedSongs = useMemo(() => {
        return [...songs]
            .sort((a, b) => b.elo_rating - a.elo_rating)
            .map((song, index) => ({
                ...song,
                position: index + 1, // Add position dynamically
            }));
        }, [songs]);
    
    // Define columns
    const columns = useMemo(() => 
        [
            {
                header: "Positie",
                accessorKey: "position",
            },
            {
                header: "Titel",
                accessorKey: "title",
            },
            {
                header: "Artiest",
                accessorKey: "artist",
            },
            {
                header: "Elo-score",
                accessorKey: "elo_rating",
            }
        ], []
    );


    // Create table instance
    const table = useReactTable({
        data: processedSongs,
        columns,
        getCoreRowModel: getCoreRowModel(),
        getSortedRowModel: getSortedRowModel(),
        state: { sorting },
        onSortingChange: setSorting,
    });

    return (
        <div className="overflow-x-auto">
            <table className="min-w-full border border-gray-300 shadow-md rounded-md">
                <thead className='bg-gray-200'>
                    {table.getHeaderGroups().map((headerGroup) => (
                        <tr key={headerGroup.id}>
                            {headerGroup.headers.map((header) => (
                                <th 
                                    key={header.id}
                                    className='py-3 px-4 text-left cursor-pointer font-semibold text-gray-700'
                                    onClick={header.column.getToggleSortingHandler()}
                                >
                                    {flexRender(header.column.columnDef.header, header.getContext())}
                                    {header.column.getIsSorted() === "asc" ? " ▲" : header.column.getIsSorted() === "desc" ? " ▼" : ""}
                                </th>
                            ))}
                        </tr>
                    ))}
                </thead>
                <tbody>
                    {table.getRowModel().rows.map((row) => (
                        <tr key={row.id} className="border-t hover:bg-gray-100 transition duration-200">
                            {row.getVisibleCells().map((cell) => (
                                <td key={cell.id} className='py-2 px-4 text-gray-800'>
                                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                </td>
                            ))}
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}