"use client";

import { useState, useRef, useLayoutEffect } from "react";
import { useMemo } from "react";
import {
  flexRender,
  getCoreRowModel,
  useReactTable,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  type ColumnFiltersState,
  type PaginationState,
  type VisibilityState,
  type SortingState,
  type ColumnDef,
} from "@tanstack/react-table";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Search,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Loader,
  Filter,
  FileUp,
  FileDown,
  Plus,
} from "lucide-react";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationEllipsis,
} from "@/components/ui/pagination";
import { usePagination } from "@/hooks/usePagination";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Separator } from "@/components/ui/separator";

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  isLoading?: boolean;
  isFetching?: boolean;
  // PAGINATION
  pageIndex?: number;
  pageSize?: number;
  totalPage?: number;
  onPageChange?: (pageIndex: number) => void;
  onPageSizeChange?: (pageSize: number) => void;
  manualPagination?: boolean;
  // SEARCH
  isSearch?: boolean;
  manualSearch?: boolean;
  searchValue?: string[];
  searchPlaceholder?: string;
  onSearchChange?: (search: string) => void;
  //SORTED
  sorting?: SortingState;
  onSortingChange?: (sorting: SortingState) => void;
  manualSorting?: boolean;
  // ACTION
  headerActions?: React.ReactNode;
  // FILTER MODAL CONTENT
  filterContent?: React.ReactNode;
  // Row click
  onRowClick?: (row: TData) => void;
}

export function DataTable<TData, TValue>({
  columns,
  data,
  isLoading,
  isFetching,
  //PAGINATION
  pageIndex,
  pageSize,
  totalPage,
  onPageChange,
  onPageSizeChange,
  manualPagination = false,
  //SEARCH
  isSearch = false,
  searchValue = [],
  searchPlaceholder,
  onSearchChange,
  manualSearch = false,
  //SORTED
  sorting,
  onSortingChange,
  manualSorting = false,
  // ACTION
  headerActions,
  filterContent,
  // row click
  onRowClick,
}: DataTableProps<TData, TValue>) {
  /** ------------------ SEARCH DATA ------------------ */
  const [searchText, setSearchText] = useState("");
  const filteredData = useMemo(() => {
    if (manualSearch) return data; // if manualSearch is true, return data as is
    if (!searchText) return data; // if searchText is empty, return data as is

    return data.filter((item) =>
      searchValue.some((key) =>
        String(item[key as keyof TData] ?? "")
          .toLowerCase()
          .includes(searchText.toLowerCase())
      )
    );
  }, [data, searchText, manualSearch, searchValue]);

  /** ------------------ AUTO RESIZE PAGESIZE disabled ------------------ */
  const tableContainerRef = useRef<HTMLDivElement>(null);
  
  // Disable the auto-resize observer to respect manual pageSize select
  // useLayoutEffect(() => {
  //   //...
  // }, []);

  /** ------------------ PAGINATION, FILTER, SELECTION, VISIBILITY STATE ------------------ */
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: pageIndex ?? 0,
    pageSize: pageSize ?? 10,
  });
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [rowSelection, setRowSelection] = useState({});
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  const [internalSorting, setInternalSorting] = useState<SortingState>([]);
  const sortingState = sorting ?? internalSorting;

  /** ------------------ REACT TABLE ------------------ */
  const table = useReactTable({
    data: filteredData,
    columns,
    state: {
      columnFilters,
      rowSelection,
      pagination,
      columnVisibility,
      ...(sorting ? { sorting } : { sorting: sortingState }),
    },
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onColumnFiltersChange: setColumnFilters,
    onRowSelectionChange: setRowSelection,
    onColumnVisibilityChange: setColumnVisibility,
    enableColumnResizing: true,
    columnResizeMode: "onChange",
    getPaginationRowModel: getPaginationRowModel(),
    manualPagination: manualPagination,
    pageCount: totalPage,
    onPaginationChange: (updater) => {
      const next = typeof updater === "function" ? updater(pagination) : updater;
      setPagination(next);
      if (onPageChange) onPageChange(next.pageIndex);
      if (onPageSizeChange) onPageSizeChange(next.pageSize);
      if (onSearchChange) onSearchChange(searchText);
    },
    ...(manualSorting ? {} : { getSortedRowModel: getSortedRowModel() }),
    manualSorting: manualSorting,
    onSortingChange: (updaterOrValue) => {
      if (onSortingChange) {
        if (typeof updaterOrValue === "function") {
          onSortingChange(updaterOrValue(sorting ?? []));
        } else {
          onSortingChange(updaterOrValue);
        }
      } else {
        if (typeof updaterOrValue === "function") {
          setInternalSorting((prev) => updaterOrValue(prev));
        } else {
          setInternalSorting(updaterOrValue);
        }
      }
    },
  });

  const handleSearchInput = (value: string) => {
    setSearchText(value);
    setPagination((prev) => ({ ...prev, pageIndex: 0 }));
    if (onSearchChange) onSearchChange(value);
  };

  /* ---------- PAGINATION UI ---------- */
  const { pages, showLeftEllipsis, showRightEllipsis } = usePagination({
    currentPage: table.getState().pagination.pageIndex + 1,
    totalPages: table.getPageCount(),
    paginationItemsToDisplay: 5,
  });

  return (
    <div className="flex flex-col gap-4 h-full font-inter">
      {/* --- TABLE ACTIONS --- */}
      <div className="flex flex-col lg:flex-row justify-between items-center gap-4 w-full bg-white p-2 rounded-2xl shadow-sm border border-slate-100">
        <div className="flex flex-1 items-center gap-2 w-full lg:w-auto">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="h-10 px-4 rounded-xl font-bold text-slate-600 border-slate-200 hover:bg-slate-50 gap-2 !outline-none">
                <ChevronDown className="h-4 w-4 opacity-50" />
                <span>Columns</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-[200px] rounded-xl shadow-xl border-slate-100">
              {table
                .getAllColumns()
                .filter((column) => column.getCanHide())
                .map((column) => (
                  <DropdownMenuCheckboxItem
                    key={column.id}
                    className="capitalize font-bold text-xs py-2"
                    checked={column.getIsVisible()}
                    onCheckedChange={(value) => column.toggleVisibility(!!value)}
                  >
                    {(column.columnDef.meta as any)?.title ?? column.id}
                  </DropdownMenuCheckboxItem>
                ))}
            </DropdownMenuContent>
          </DropdownMenu>

          {filterContent ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="h-10 px-4 rounded-xl font-bold text-slate-600 border-slate-200 hover:bg-slate-50 gap-2 !outline-none">
                  <Filter className="h-4 w-4 opacity-50" />
                  <span>Filters</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-[300px] p-4 rounded-xl shadow-xl border-slate-100 flex flex-col gap-3">
                {filterContent}
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Button variant="outline" className="h-10 px-4 rounded-xl font-bold text-slate-600 border-slate-200 hover:bg-slate-50 gap-2 opacity-50" disabled>
              <Filter className="h-4 w-4 opacity-50" />
              <span>Filters</span>
            </Button>
          )}

          {isSearch && (
            <div className="relative flex-1 lg:max-w-[400px] flex items-center">
              <Search size={14} className="absolute text-slate-400 left-3 pointer-events-none z-10" />
              <input
                placeholder={searchPlaceholder || `Search ...`}
                value={searchText}
                onChange={(e) => handleSearchInput(e.target.value)}
                style={{ paddingLeft: '40px', paddingRight: '12px' }}
                className="h-10 w-full rounded-xl border border-slate-200 bg-slate-50/50 focus:bg-white outline-none focus:ring-2 focus:ring-blue-200 transition-all font-medium text-sm text-slate-700 placeholder:text-slate-400"
              />
            </div>
          )}
        </div>

        <div className="flex items-center gap-2">
          {headerActions && (
            <>
              {headerActions}
            </>
          )}
        </div>
      </div>

      {/* --- TABLE --- */}
      <div
        className="flex-1 rounded-[24px] border border-slate-100 bg-white shadow-sm flex flex-col overflow-auto w-full min-h-[400px]"
        ref={tableContainerRef}
      >
        <Table className="relative w-full">
          <TableHeader className="bg-slate-50/50 border-b border-slate-100 sticky top-0 z-10 shadow-[0_1px_2px_rgba(0,0,0,0.05)]">
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id} className="hover:bg-transparent border-none">
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead
                      key={header.id}
                      className="h-12 px-6 text-[11px] font-black uppercase tracking-widest text-slate-400"
                      style={
                        header.column.id === 'index'
                          ? { width: "40px", minWidth: "40px", maxWidth: "40px" }
                          : { position: "relative", width: header.getSize() }
                      }
                    >
                      {header.isPlaceholder
                        ? null
                        : flexRender(header.column.columnDef.header, header.getContext())}
                    </TableHead>
                  );
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}
                  className="group hover:bg-slate-50/80 cursor-pointer transition-all border-b border-slate-50/50"
                  onClick={(e) => {
                    try {
                      const target = e.target as HTMLElement | null;
                      if (target && target.closest("button, a, input, label")) return;
                    } catch (err) {}
                    if (onRowClick) onRowClick(row.original as TData);
                  }}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id} className="py-3.5 px-4 text-[13px] font-medium text-slate-700">
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : isLoading || isFetching ? (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-24">
                  <div className="flex items-center justify-center gap-2 text-slate-400 italic">
                    <Loader className="animate-spin size-4" />
                    <span>Đang tải dữ liệu...</span>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-48 text-center text-slate-400 font-medium">
                  Không có dữ liệu hiển thị.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* --- PAGINATION --- */}
      <div className="flex items-center justify-between px-4 py-3 bg-white border border-slate-100 mt-auto rounded-[24px] shadow-sm">
        <div className="text-xs font-medium text-slate-500 hidden md:block">
          {table.getSelectedRowModel().rows.length} of {table.getFilteredRowModel().rows.length} rows selected
        </div>
        
        <div className="flex items-center gap-4 md:gap-6 flex-1 md:flex-none justify-between md:justify-end">
          <div className="flex items-center gap-2">
            <span className="text-xs font-medium text-slate-500 hidden sm:inline-block">Rows per page</span>
            <select
              className="h-8 rounded-md border border-slate-200 bg-white px-2 text-xs font-medium text-slate-700 outline-none focus:border-blue-500 cursor-pointer"
              value={table.getState().pagination.pageSize}
              onChange={(e) => table.setPageSize(Number(e.target.value))}
            >
              {[5, 10, 20, 50].map((size) => (
                <option key={size} value={size}>
                  {size}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center text-xs font-medium text-slate-500">
            Page {table.getState().pagination.pageIndex + 1} of {table.getPageCount()}
          </div>

          <div className="flex items-center gap-1">
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8 text-slate-500 hover:text-slate-900 border-slate-200"
              onClick={() => table.previousPage()}
              disabled={!table.getCanPreviousPage()}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8 text-slate-500 hover:text-slate-900 border-slate-200"
              onClick={() => table.nextPage()}
              disabled={!table.getCanNextPage()}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
