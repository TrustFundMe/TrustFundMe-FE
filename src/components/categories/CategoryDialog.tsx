'use client';

import { useState, useEffect } from 'react';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
    DialogBody,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { CampaignCategory } from '@/types/campaign';
import { mediaService } from '@/services/mediaService';
import { campaignCategoryService } from '@/services/campaignCategoryService';
import { toast } from 'react-hot-toast';
import { Loader2, Upload, X, ImageIcon } from 'lucide-react';
import { api } from '@/config/axios';

interface CategoryDialogProps {
    category: CampaignCategory | null;
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSuccess: () => void;
}

export function CategoryDialog({
    category,
    open,
    onOpenChange,
    onSuccess,
}: CategoryDialogProps) {
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [iconId, setIconId] = useState<number | undefined>(undefined);
    const [iconUrl, setIconUrl] = useState<string | undefined>(undefined);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [submitting, setSubmitting] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [errors, setErrors] = useState<{ name?: string; description?: string; icon?: string }>({});

    useEffect(() => {
        if (category) {
            setName(category.name);
            setDescription(category.description || '');
            setIconId(category.icon);
            // Fetch icon URL if iconId exists
            if (category.icon) {
                mediaService.getMediaById(category.icon)
                    .then(res => setIconUrl(res.url))
                    .catch(() => setIconUrl(undefined));
            } else {
                setIconUrl(undefined);
            }
        } else {
            setName('');
            setDescription('');
            setIconId(undefined);
            setIconUrl(undefined);
            setSelectedFile(null);
        }
    }, [category, open]);

    const handleIconUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // Harden PNG validation: check both type and extension
        const isPng = file.type === 'image/png' || file.name.toLowerCase().endsWith('.png');
        if (!isPng) {
            toast.error('Chỉ chấp nhận ảnh định dạng .png');
            // Clear input so they can't submit it if they bypass some other way
            e.target.value = '';
            return;
        }

        setSelectedFile(file);
        if (errors.icon) setErrors(prev => ({ ...prev, icon: undefined }));

        // Create local preview
        const reader = new FileReader();
        reader.onloadend = () => {
            setIconUrl(reader.result as string);
        };
        reader.readAsDataURL(file);
    };

    const handleUploadPng = async (file: File, existingIconId?: number) => {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('description', 'Category Icon (PNG)');

        if (existingIconId) {
            // Use PATCH for update
            const response = await api.patch(`/api/media/upload/png/${existingIconId}`, formData, {
                headers: { 'Content-Type': 'multipart/form-data' },
            });
            return response.data;
        } else {
            // Use POST for create
            const response = await api.post('/api/media/upload/png', formData, {
                headers: { 'Content-Type': 'multipart/form-data' },
            });
            return response.data;
        }
    };

    const removeIcon = () => {
        setIconId(undefined);
        setIconUrl(undefined);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const newErrors: { name?: string; description?: string; icon?: string } = {};

        if (name.trim().length < 4 || name.trim().length > 20) {
            newErrors.name = 'Tên danh mục phải từ 4 đến 20 ký tự';
        }

        if (description.trim() && (description.trim().length < 10 || description.trim().length > 50)) {
            newErrors.description = 'Mô tả phải từ 10 đến 50 ký tự';
        }

        if (!iconUrl && !selectedFile) {
            newErrors.icon = 'Vui lòng chọn icon cho danh mục';
        }

        // Final defensive check for selected file
        if (selectedFile) {
            const isPng = selectedFile.type === 'image/png' || selectedFile.name.toLowerCase().endsWith('.png');
            if (!isPng) {
                newErrors.icon = 'File đã chọn không đúng định dạng .png';
            }
        }

        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            toast.error('Vui lòng kiểm tra lại thông tin');
            return;
        }

        setErrors({});

        setSubmitting(true);
        try {
            let finalIconId = iconId;

            // If a new file is selected, upload it first
            if (selectedFile) {
                setUploading(true);
                try {
                    const res = await handleUploadPng(selectedFile, category?.icon);
                    finalIconId = res.id;
                } catch (uploadErr: any) {
                    console.error('Upload Error:', uploadErr);
                    toast.error(uploadErr.response?.data?.message || 'Tải ảnh lên thất bại');
                    setUploading(false);
                    setSubmitting(false);
                    return;
                }
                setUploading(false);
            }

            const data = {
                name: name.trim(),
                description: description.trim(),
                icon: finalIconId,
            };

            if (category) {
                await campaignCategoryService.update(category.id, data);
                toast.success('Cập nhật thành công');
            } else {
                await campaignCategoryService.create(data);
                toast.success('Tạo danh mục mới thành công');
            }
            onSuccess();
            onOpenChange(false);
        } catch (err: any) {
            toast.error(err.response?.data?.message || 'Có lỗi xảy ra');
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[440px] rounded-[24px] border-none shadow-2xl p-0">
                <DialogHeader className="pt-3 px-3 pb-0 border-none bg-white">
                    <DialogTitle className="text-lg font-black text-slate-900 text-center">
                        {category ? 'Chỉnh sửa' : 'Thêm mới'}
                    </DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit}>
                    <DialogBody className="space-y-2.5 px-3 py-2">
                        <div className="space-y-2">
                            <Label htmlFor="name" className="text-xs font-black uppercase text-slate-400 tracking-wider">
                                Tên danh mục <span className="text-rose-500">*</span>
                            </Label>
                            <Input
                                id="name"
                                value={name}
                                onChange={(e) => {
                                    setName(e.target.value);
                                    if (errors.name) setErrors(prev => ({ ...prev, name: undefined }));
                                }}
                                placeholder="VD: Giáo dục, Y tế..."
                                className={`h-10 rounded-xl font-bold text-sm bg-slate-50 focus:bg-white transition-all focus:ring-slate-200 ${errors.name ? 'border-rose-500 bg-rose-50/50' : 'border-slate-100'}`}
                            />
                            {errors.name && (
                                <p className="text-[10px] text-rose-500 font-bold mt-1 pl-1">
                                    {errors.name}
                                </p>
                            )}
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="description" className="text-xs font-black uppercase text-slate-400 tracking-wider">
                                Mô tả
                            </Label>
                            <Textarea
                                id="description"
                                value={description}
                                onChange={(e) => {
                                    setDescription(e.target.value);
                                    if (errors.description) setErrors(prev => ({ ...prev, description: undefined }));
                                }}
                                placeholder="Mô tả ngắn gọn về danh mục này..."
                                className={`min-h-[80px] rounded-xl font-bold text-sm bg-slate-50 focus:bg-white transition-all focus:ring-slate-200 ${errors.description ? 'border-rose-500 bg-rose-50/50' : 'border-slate-100'}`}
                            />
                            {errors.description && (
                                <p className="text-[10px] text-rose-500 font-bold mt-1 pl-1">
                                    {errors.description}
                                </p>
                            )}
                        </div>

                        <div className="space-y-2">
                            <Label className="text-xs font-black uppercase text-slate-400 tracking-wider">
                                Icon
                            </Label>
                            <div className="flex items-center gap-3">
                                <div className="relative h-14 w-14 rounded-xl bg-slate-50 border-2 border-dashed border-slate-100 flex items-center justify-center overflow-hidden group">
                                    {iconUrl ? (
                                        <>
                                            <img src={iconUrl} alt="Icon" className="h-full w-full object-contain p-2" />
                                            <button
                                                type="button"
                                                onClick={removeIcon}
                                                className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                                            >
                                                <X className="h-5 w-5 text-white" />
                                            </button>
                                        </>
                                    ) : uploading ? (
                                        <Loader2 className="h-6 w-6 text-[#F84D43] animate-spin" />
                                    ) : (
                                        <ImageIcon className="h-5 w-5 text-slate-300" />
                                    )}
                                </div>
                                <div className="flex-1">
                                    <input
                                        type="file"
                                        id="icon-upload"
                                        className="hidden"
                                        accept="image/png"
                                        onChange={handleIconUpload}
                                    />
                                    <Label
                                        htmlFor="icon-upload"
                                        className="flex items-center gap-2 w-fit px-3 h-8 rounded-lg bg-white border border-slate-100 font-bold text-[10px] text-slate-600 hover:bg-slate-50 cursor-pointer transition-colors shadow-sm"
                                    >
                                        <Upload className="h-3 w-3" />
                                        Tải lên icon
                                    </Label>
                                    <p className="text-[10px] text-rose-500 font-bold mt-1 ml-0.5 animate-pulse">
                                        * Chỉ chấp nhận ảnh định dạng .png
                                    </p>
                                    {errors.icon && (
                                        <p className="text-[10px] text-rose-500 font-bold mt-1 pl-1 italic underline decoration-rose-200">
                                            {errors.icon}
                                        </p>
                                    )}
                                </div>
                            </div>
                        </div>
                    </DialogBody>
                    <DialogFooter className="bg-slate-50/50 p-2.5 pb-4 border-none flex justify-center">
                        <Button
                            type="submit"
                            disabled={submitting || uploading}
                            className="w-full h-11 rounded-xl font-black uppercase text-[10px] tracking-[0.2em] bg-slate-900 hover:bg-black text-white shadow-lg shadow-slate-200"
                        >
                            {submitting ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                            ) : category ? (
                                'Lưu thay đổi'
                            ) : (
                                'Tạo danh mục'
                            )}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
