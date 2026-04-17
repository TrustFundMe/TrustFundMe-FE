'use client';

import { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { campaignCategoryService } from '@/services/campaignCategoryService';
import { DataTable } from '@/components/admin/DataTable';
import { ColumnDef } from '@tanstack/react-table';
import { CampaignCategory } from '@/types/campaign';
import { Button } from '@/components/ui/button';
import {
    Plus,
    Pencil,
    Trash2,
    MoreHorizontal,
    ImageIcon,
    Loader2,
} from 'lucide-react';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { CategoryDialog } from '@/components/categories/CategoryDialog';
import { toast } from 'react-hot-toast';
import { formatDate } from '@/lib/utils';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
    DialogBody,
    DialogDescription,
} from '@/components/ui/dialog';
import { mediaService } from '@/services/mediaService';

export default function AdminCategoriesPage() {
    const [dialogOpen, setDialogOpen] = useState(false);
    const [selectedCategory, setSelectedCategory] = useState<CampaignCategory | null>(null);
    const [deleteId, setDeleteId] = useState<number | null>(null);
    const [dateFilter, setDateFilter] = useState('ALL');
    const queryClient = useQueryClient();

    const { data: categories = [], isLoading } = useQuery({
        queryKey: ['campaign-categories'],
        queryFn: () => campaignCategoryService.getAll(),
    });

    const filteredCategories = useMemo(() => {
        if (!categories || dateFilter === 'ALL') return categories;
        const now = new Date();
        const todayStart = new Date(new Date().setHours(0, 0, 0, 0));

        // This week start (Monday)
        const d = new Date();
        const day = d.getDay();
        const diff = d.getDate() - day + (day === 0 ? -6 : 1);
        const weekStart = new Date(d.setDate(diff));
        weekStart.setHours(0, 0, 0, 0);

        const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

        return categories.filter((c: CampaignCategory) => {
            const createdDate = new Date(c.createdAt || '');
            if (dateFilter === 'TODAY') return createdDate >= todayStart;
            if (dateFilter === 'THIS_WEEK') return createdDate >= weekStart;
            if (dateFilter === 'THIS_MONTH') return createdDate >= monthStart;
            return true;
        });
    }, [categories, dateFilter]);

    const deleteMutation = useMutation({
        mutationFn: (id: number) => campaignCategoryService.delete(id),
        onSuccess: () => {
            toast.success('Xóa danh mục thành công');
            queryClient.invalidateQueries({ queryKey: ['campaign-categories'] });
            setDeleteId(null);
        },
        onError: (err: any) => {
            toast.error(err.response?.data?.message || 'Không thể xóa danh mục này');
            setDeleteId(null);
        },
    });

    const handleCreate = () => {
        setSelectedCategory(null);
        setDialogOpen(true);
    };

    const handleEdit = (category: CampaignCategory) => {
        setSelectedCategory(category);
        setDialogOpen(true);
    };

    const handleDelete = (id: number) => {
        setDeleteId(id);
    };

    const confirmDelete = () => {
        if (deleteId) {
            deleteMutation.mutate(deleteId);
        }
    };

    const columns: ColumnDef<CampaignCategory>[] = [
        {
            id: 'stt',
            header: 'STT',
            cell: ({ row }) => <span className="font-bold text-slate-400 text-[11px]">{row.index + 1}</span>,
        },
        {
            accessorKey: 'icon',
            header: 'Icon',
            cell: ({ row }) => {
                const iconId = row.original.icon;
                return <CategoryIconDisplay iconId={iconId} />;
            },
            meta: { title: 'Icon' },
        },
        {
            accessorKey: 'name',
            header: 'Tên danh mục',
            cell: ({ row }) => <span className="font-bold text-slate-900 text-sm">{row.getValue('name')}</span>,
            meta: { title: 'Tên danh mục' },
        },
        {
            accessorKey: 'description',
            header: 'Mô tả',
            cell: ({ row }) => (
                <span className="text-slate-500 font-medium text-[13px] line-clamp-1 max-w-[400px]">
                    {row.getValue('description') || '---'}
                </span>
            ),
            meta: { title: 'Mô tả' },
        },
        {
            accessorKey: 'createdAt',
            header: 'Ngày tạo',
            cell: ({ row }) => (
                <span className="text-slate-400 font-bold text-xs">
                    {formatDate(row.getValue('createdAt'))}
                </span>
            ),
            meta: { title: 'Ngày tạo' },
        },
        {
            id: 'actions',
            cell: ({ row }) => {
                const category = row.original;

                return (
                    <div className="flex justify-end">
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="ghost" className="h-8 w-8 p-0 hover:bg-slate-100 rounded-full">
                                    <MoreHorizontal className="h-4 w-4 text-slate-400" />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="rounded-2xl border-slate-100 shadow-xl p-1.5 w-48">
                                <DropdownMenuItem
                                    onClick={() => handleEdit(category)}
                                    className="flex items-center gap-2 font-bold text-xs py-2.5 px-3 cursor-pointer rounded-xl hover:bg-slate-50"
                                >
                                    <Pencil className="h-3.5 w-3.5" />
                                    Chỉnh sửa
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                    onClick={() => handleDelete(category.id)}
                                    className="flex items-center gap-2 font-bold text-xs py-2.5 px-3 text-slate-700 hover:text-rose-600 hover:bg-rose-50/50 cursor-pointer rounded-xl group"
                                >
                                    <Trash2 className="h-3.5 w-3.5 text-slate-400 group-hover:text-rose-500" />
                                    Xóa danh mục
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                );
            },
        },
    ];

    return (
        <div className="flex flex-col flex-1 min-h-0 h-full overflow-hidden">
            <div className="flex-1 min-h-0">
                <DataTable
                    columns={columns}
                    data={filteredCategories}
                    isLoading={isLoading}
                    isSearch={true}
                    searchPlaceholder="Tìm kiếm danh mục..."
                    searchValue={['name']}
                    filterContent={
                        <div className="flex flex-col gap-3">
                            <div className="flex flex-col gap-1.5">
                                <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest pl-1">Ngày tạo</label>
                                <select
                                    value={dateFilter}
                                    className="text-xs h-10 border border-slate-200 rounded-xl px-3 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-600 font-bold shadow-sm w-full"
                                    onChange={(e) => setDateFilter(e.target.value)}
                                >
                                    <option value="ALL">Tất cả thời gian</option>
                                    <option value="TODAY">Hôm nay</option>
                                    <option value="THIS_WEEK">Tuần này</option>
                                    <option value="THIS_MONTH">Tháng này</option>
                                </select>
                            </div>
                            {dateFilter !== 'ALL' && (
                                <Button
                                    variant="ghost"
                                    onClick={() => setDateFilter('ALL')}
                                    className="h-8 rounded-xl text-[10px] font-black uppercase text-rose-500 hover:bg-rose-50 hover:text-rose-600 transition-all"
                                >
                                    Xóa lọc
                                </Button>
                            )}
                        </div>
                    }
                    headerActions={
                        <Button
                            onClick={handleCreate}
                            className="bg-slate-900 hover:bg-black text-white font-black uppercase text-[10px] tracking-[0.2em] px-6 h-10 rounded-xl shadow-lg shadow-slate-200 flex items-center gap-2 transition-all active:scale-95"
                        >
                            <Plus className="h-4 w-4" />
                            Thêm danh mục
                        </Button>
                    }
                />
            </div>

            <CategoryDialog
                open={dialogOpen}
                onOpenChange={setDialogOpen}
                category={selectedCategory}
                onSuccess={() => queryClient.invalidateQueries({ queryKey: ['campaign-categories'] })}
            />

            <Dialog open={!!deleteId} onOpenChange={(open: boolean) => !open && setDeleteId(null)}>
                <DialogContent className="sm:max-w-[400px] rounded-[32px] border-none shadow-2xl">
                    <DialogHeader className="bg-white border-none p-8 pb-4">
                        <div className="mx-auto w-12 h-12 rounded-2xl bg-rose-50 flex items-center justify-center mb-4">
                            <Trash2 className="h-6 w-6 text-rose-500" />
                        </div>
                        <DialogTitle className="text-xl font-black text-slate-900 text-center">
                            Xác nhận xóa danh mục?
                        </DialogTitle>
                        <DialogDescription className="text-center font-bold text-slate-400 text-sm mt-2">
                            Hành động này không thể hoàn tác. Danh mục sẽ bị xóa vĩnh viễn khỏi hệ thống.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter className="bg-slate-50/80 rounded-b-[32px] p-8 pt-6 border-none flex flex-row gap-3">
                        <Button
                            variant="ghost"
                            onClick={() => setDeleteId(null)}
                            className="flex-1 h-12 rounded-xl font-black uppercase text-xs tracking-[0.2em] text-slate-400 border-none hover:bg-white hover:text-slate-600 transition-all"
                        >
                            Hủy
                        </Button>
                        <Button
                            onClick={confirmDelete}
                            className="flex-1 h-12 rounded-xl bg-slate-900 hover:bg-black text-white font-black uppercase text-xs tracking-[0.2em] px-8 shadow-lg shadow-slate-200 transition-all active:scale-95"
                        >
                            {deleteMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Xóa ngay'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}

function CategoryIconDisplay({ iconId }: { iconId?: number }) {
    const { data: media, isLoading } = useQuery({
        queryKey: ['media', iconId],
        queryFn: () => (iconId ? mediaService.getMediaById(iconId) : null),
        enabled: !!iconId,
        staleTime: 1000 * 60 * 5, // 5 minutes cache
    });

    if (!iconId) return (
        <div className="h-10 w-10 rounded-xl bg-slate-100 flex items-center justify-center border border-slate-200/50">
            <ImageIcon className="h-5 w-5 text-slate-300" />
        </div>
    );

    if (isLoading) return <div className="h-10 w-10 bg-slate-100 animate-pulse rounded-xl border border-slate-200/50" />;

    return (
        <div className="h-10 w-10 rounded-xl bg-slate-50 border border-slate-200/50 flex items-center justify-center overflow-hidden shadow-sm group hover:scale-105 transition-transform duration-300">
            {media?.url ? (
                <img src={media.url} alt="Icon" className="h-6 w-6 object-contain" />
            ) : (
                <ImageIcon className="h-5 w-5 text-slate-300" />
            )}
        </div>
    );
}
