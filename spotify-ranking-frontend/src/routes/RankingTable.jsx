import React, { useMemo, useState } from "react";
import { 
    useReactTable, 
    getCoreRowModel,
    getSortedRowModel,
    flexRender,
} from "@tanstack/react-table";

export default function RankingTable({ songs, searchTerm }) {
    const [sorting, setSorting] = useState([]);

    // Add position to each song before passing data to the table
    const indexedSongs = useMemo(() => {
        return [...songs]
            .sort((a, b) => b.elo_rating - a.elo_rating)
            .map((song, index) => ({
                ...song,
                position: index + 1, // Add position dynamically
            }));
        }, [songs]);

    // Filter songs
    const filteredSongs = useMemo(() => {
        return indexedSongs.filter(song =>
            song.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            song.artist.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }, [indexedSongs, searchTerm]);
    
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
                header: "Mu",
                accessorKey: "mu",
            }
        ], []
    );

    const getPositionColor = (sigma) => {
        if (sigma > 7) return "bg-red-300"; // Very high uncertainty
        if (sigma > 6) return "bg-orange-300"; // High uncertainty
        if (sigma > 5) return "bg-yellow-300"; // Medium uncertainty
        if (sigma > 3)return "bg-green-300"; // Low uncertainty
        return "bg-blue-300"; // Very low uncertainty
    };


    // Create table instance
    const table = useReactTable({
        data: filteredSongs,
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
                        <tr 
                            key={row.id} 
                            id={`song-${row.index}`}
                            className="border-t hover:bg-gray-100 transition duration-200 scroll-mt-16"
                        >
                            {row.getVisibleCells().map((cell) => {
                            const sigmaValue = row.original.sigma; // Get sigma value from the row
                            const isPositionColumn = cell.column.columnDef.accessorKey === "position";
                            
                            return (
                                <td 
                                    key={cell.id} 
                                    className={`py-2 px-4 text-gray-800
                                        ${isPositionColumn ? getPositionColor(sigmaValue) : ""}`}
                                >
                                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                </td>
                            );
                        })}
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}