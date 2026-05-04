'use client';

import { useState, useEffect } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { systemConfigService, SystemConfig } from '@/services/systemConfigService';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { toast } from 'react-hot-toast';
import { Loader2, Save, X } from 'lucide-react';

interface PromptDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    config: SystemConfig | null;
    onSuccess?: () => void;
}

export function PromptDialog({ open, onOpenChange, config, onSuccess }: PromptDialogProps) {
    const [value, setValue] = useState('');
    const [description, setDescription] = useState('');
    const queryClient = useQueryClient();

    useEffect(() => {
        if (config) {
            setValue(config.configValue);
            setDescription(config.description || '');
        } else {
            setValue('');
            setDescription('');
        }
    }, [config, open]);

    const updateMutation = useMutation({
        mutationFn: (data: Partial<SystemConfig>) =>
            systemConfigService.update(config!.configKey, data),
        onSuccess: () => {
            toast.success('Cập nhật prompt thành công');
            queryClient.invalidateQueries({ queryKey: ['system-configs'] });
            onSuccess?.();
            onOpenChange(false);
        },
        onError: (err: any) => {
            toast.error(err.response?.data?.message || 'Lỗi khi cập nhật prompt');
        },
    });

    const handleSave = () => {
        if (!config) return;

        // Basic JSON validation if the key implies it
        if (config.configKey.includes('ocr')) {
            try {
                JSON.parse(value);
            } catch (e) {
                toast.error('Giá trị phải là JSON hợp lệ cho cấu hình OCR');
                return;
            }
        }

        updateMutation.mutate({
            configValue: value,
            description: description,
        });
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[700px] max-h-[95vh] overflow-y-auto rounded-[32px] border-none shadow-2xl p-0 bg-white/95 backdrop-blur-xl custom-scrollbar">
                <DialogHeader className="p-8 pb-2">
                    <DialogTitle className="text-2xl font-black text-slate-900 flex items-center gap-3">
                        <div className="w-10 h-10 rounded-2xl bg-blue-50 flex items-center justify-center">
                            <Save className="h-5 w-5 text-blue-500" />
                        </div>
                        Chỉnh sửa Prompt AI
                    </DialogTitle>
                </DialogHeader>

                <div className="p-8 py-0 space-y-4">
                    <div className="space-y-2">
                        <Label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-1">Mô tả mục đích</Label>
                        <Input
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            placeholder="Nhập mô tả cho prompt này..."
                            className="h-11 rounded-2xl border-slate-100 bg-slate-50/50 focus:ring-blue-500 font-bold text-sm"
                        />
                    </div>

                    <div className="space-y-2">
                        <Label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-1 text-blue-500">Nội dung Prompt (System Instruction)</Label>
                        <Textarea
                            value={value}
                            onChange={(e) => setValue(e.target.value)}
                            placeholder="Nhập nội dung prompt..."
                            className="min-h-[300px] md:min-h-[350px] rounded-[24px] border-slate-100 bg-slate-50/50 focus:ring-blue-500 font-medium text-[13px] leading-relaxed resize-none p-4"
                        />
                        {config?.configKey.includes('ocr') && (
                            <p className="text-[10px] font-bold text-amber-500 italic ml-1">
                                * Lưu ý: Đây là cấu hình JSON. Hãy đảm bảo đúng định dạng {"{ \"front\": \"...\", \"back\": \"...\" }"}
                            </p>
                        )}
                    </div>
                </div>

                <DialogFooter className="p-8 pt-4 bg-slate-50/50 border-t border-slate-100 mt-4 flex flex-row gap-3">
                    <Button
                        variant="ghost"
                        onClick={() => onOpenChange(false)}
                        className="flex-1 h-12 rounded-2xl font-black uppercase text-xs tracking-[0.2em] text-slate-400 hover:bg-white hover:text-slate-600 transition-all"
                    >
                        <X className="h-4 w-4 mr-2" />
                        Hủy
                    </Button>
                    <Button
                        onClick={handleSave}
                        disabled={updateMutation.isPending}
                        className="flex-1 h-12 rounded-2xl bg-slate-900 hover:bg-black text-white font-black uppercase text-xs tracking-[0.2em] shadow-lg shadow-slate-200 transition-all active:scale-95 disabled:opacity-50"
                    >
                        {updateMutation.isPending ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                            <div className="flex items-center gap-2">
                                <Save className="h-4 w-4" />
                                Lưu cấu hình
                            </div>
                        )}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
