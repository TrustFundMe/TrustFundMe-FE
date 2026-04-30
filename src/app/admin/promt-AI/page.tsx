'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { systemConfigService, SystemConfig } from '@/services/systemConfigService';
import { DataTable } from '@/components/admin/DataTable';
import { ColumnDef } from '@tanstack/react-table';
import { Button } from '@/components/ui/button';
import {
    Pencil,
    BrainCircuit,
    Clock,
    ChevronRight
} from 'lucide-react';
import { PromptDialog } from '@/components/admin/PromptDialog';
import { formatDate } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';

export default function AdminPromptPage() {
    const [selectedConfig, setSelectedConfig] = useState<SystemConfig | null>(null);
    const [dialogOpen, setDialogOpen] = useState(false);

    const { data: configs = [], isLoading } = useQuery({
        queryKey: ['system-configs', 'AI'],
        queryFn: () => systemConfigService.getByGroup('AI'),
    });

    const handleEdit = (config: SystemConfig) => {
        setSelectedConfig(config);
        setDialogOpen(true);
    };

    const columns: ColumnDef<SystemConfig>[] = [
        {
            id: 'stt',
            header: 'STT',
            cell: ({ row }) => <span className="font-bold text-slate-400 text-[11px]">{row.index + 1}</span>,
        },
        {
            accessorKey: 'configKey',
            header: 'Tên cấu hình',
            cell: ({ row }) => (
                <span className="font-black text-slate-900 text-sm tracking-tight">{row.getValue('configKey')}</span>
            ),
            meta: { title: 'Tên cấu hình' },
        },
        {
            accessorKey: 'description',
            header: 'Mô tả mục đích',
            cell: ({ row }) => (
                <span className="text-slate-500 font-medium text-[13px] line-clamp-1 max-w-[350px]">
                    {row.getValue('description') || '---'}
                </span>
            ),
            meta: { title: 'Mô tả' },
        },
        {
            accessorKey: 'updatedAt',
            header: 'Cập nhật lúc',
            cell: ({ row }) => (
                <div className="flex flex-col">
                    <span className="text-slate-900 font-bold text-xs">
                        {formatDate(row.getValue('updatedAt'))}
                    </span>
                    <span className="text-[10px] text-slate-400 font-medium flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        Vừa mới đây
                    </span>
                </div>
            ),
            meta: { title: 'Cập nhật' },
        },
        {
            id: 'actions',
            cell: ({ row }) => (
                <div className="flex justify-end">
                    <Button
                        onClick={() => handleEdit(row.original)}
                        className="h-9 px-4 rounded-xl bg-slate-50 hover:bg-slate-900 text-slate-600 hover:text-white font-bold text-[11px] uppercase tracking-wider transition-all border border-slate-100 group shadow-sm"
                    >
                        Chỉnh sửa
                        <ChevronRight className="h-3.5 w-3.5 ml-1.5 group-hover:translate-x-0.5 transition-transform" />
                    </Button>
                </div>
            ),
        },
    ];

    return (
        <div className="flex flex-col h-full overflow-hidden bg-slate-50/30 p-2">

            <div className="flex-1 min-h-0 bg-white rounded-[40px] shadow-2xl shadow-slate-200/50 border border-slate-100 overflow-hidden">
                <DataTable
                    columns={columns}
                    data={configs}
                    isLoading={isLoading}
                    isSearch={true}
                    searchPlaceholder="Tìm kiếm cấu hình..."
                    searchValue={['configKey', 'description']}
                />
            </div>

            <PromptDialog
                open={dialogOpen}
                onOpenChange={setDialogOpen}
                config={selectedConfig}
            />
        </div>
    );
}
