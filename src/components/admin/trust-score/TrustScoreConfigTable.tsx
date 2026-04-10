'use client';

import { Pencil, Star, ToggleLeft, ToggleRight } from 'lucide-react';
import { TrustScoreConfig } from '@/services/trustScoreService';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { useState } from 'react';
import { trustScoreService } from '@/services/trustScoreService';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';

interface Props {
  data: TrustScoreConfig[];
  isLoading?: boolean;
}

export function TrustScoreConfigTable({ data, isLoading }: Props) {
  const [editModal, setEditModal] = useState<TrustScoreConfig | null>(null);
  const [editPoints, setEditPoints] = useState('');
  const [editRuleName, setEditRuleName] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [editActive, setEditActive] = useState(true);
  const queryClient = useQueryClient();

  const updateMutation = useMutation({
    mutationFn: ({
      ruleKey,
      payload,
    }: {
      ruleKey: string;
      payload: { ruleName: string; description: string; points: number; isActive?: boolean };
    }) => trustScoreService.updateConfig(ruleKey, payload),
    onSuccess: () => {
      toast.success('Cập nhật thành công!');
      queryClient.invalidateQueries({ queryKey: ['trust-score-configs'] });
      setEditModal(null);
    },
    onError: () => {
      toast.error('Cập nhật thất bại!');
    },
  });

  const openEdit = (item: TrustScoreConfig) => {
    setEditModal(item);
    setEditPoints(String(item.points));
    setEditRuleName(item.ruleName);
    setEditDescription(item.description);
    setEditActive(item.isActive);
  };

  const handleSave = () => {
    if (!editModal) return;
    const points = parseInt(editPoints, 10);
    if (isNaN(points)) {
      toast.error('Số điểm phải là số nguyên');
      return;
    }
    updateMutation.mutate({
      ruleKey: editModal.ruleKey,
      payload: { 
        ruleName: editRuleName, 
        description: editDescription, 
        points, 
        isActive: editActive 
      },
    });
  };

  return (
    <>
      <div className="overflow-auto custom-scrollbar" style={{ maxHeight: 'calc(100vh - 280px)' }}>
        <table className="min-w-full text-sm">
          <thead>
            <tr className="border-b border-slate-100 bg-white sticky top-0 z-10">
              <th className="text-left py-3 px-4 font-semibold text-slate-600 text-[13px]">Key</th>
              <th className="text-left py-3 px-4 font-semibold text-slate-600 text-[13px]">Quy tắc</th>
              <th className="text-center py-3 px-4 font-semibold text-slate-600 text-[13px]">Điểm</th>
              <th className="text-center py-3 px-4 font-semibold text-slate-600 text-[13px]">Trạng thái</th>
              <th className="text-right py-3 px-4 font-semibold text-slate-600 text-[13px]">Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr>
                <td colSpan={5} className="text-center py-12 text-slate-400">
                  Đang tải...
                </td>
              </tr>
            ) : data.length === 0 ? (
              <tr>
                <td colSpan={5} className="text-center py-12 text-slate-400">
                  Không có quy tắc nào.
                </td>
              </tr>
            ) : (
              data.map((item) => (
                <tr
                  key={item.id}
                  className="border-b border-slate-50 hover:bg-slate-50/50 transition-colors"
                >
                  <td className="py-3 px-4">
                    <code className="text-xs font-mono bg-slate-100 text-slate-600 px-2 py-1 rounded-md">
                      {item.ruleKey}
                    </code>
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-2">
                      <div className="h-8 w-8 rounded-lg bg-amber-50 flex items-center justify-center">
                        <Star className="h-4 w-4 text-amber-500" />
                      </div>
                      <span className="font-medium text-slate-800">{item.ruleName}</span>
                    </div>
                  </td>
                  <td className="py-3 px-4 text-center">
                    <Badge
                      className={
                        item.points >= 0
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-100'
                          : 'bg-red-50 text-red-600 border-red-100'
                      }
                    >
                      {item.points}
                    </Badge>
                  </td>
                  <td className="py-3 px-4 text-center">
                    {item.isActive ? (
                      <Badge className="bg-emerald-50 text-emerald-700 border-emerald-100">
                        Đang bật
                      </Badge>
                    ) : (
                      <Badge className="bg-slate-100 text-slate-500 border-slate-200">
                        Đã tắt
                      </Badge>
                    )}
                  </td>
                  <td className="py-3 px-4 text-right">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => openEdit(item)}
                      className="gap-1.5 text-slate-600 hover:text-amber-600"
                    >
                      <Pencil className="h-3.5 w-3.5" />
                      Sửa
                    </Button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Edit Modal */}
      <Dialog open={!!editModal} onOpenChange={(v) => !v && setEditModal(null)}>
        <DialogContent className="sm:max-w-xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Star className="h-5 w-5 text-amber-500" />
              Chỉnh sửa quy tắc điểm
            </DialogTitle>
          </DialogHeader>

          {editModal && (
            <div className="px-6 py-6 space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-slate-700 font-medium mb-1.5 block">
                    Rule Key
                  </Label>
                  <Input
                    value={editModal.ruleKey}
                    disabled
                    className="bg-slate-50 font-mono text-xs"
                  />
                </div>
                <div>
                  <Label className="text-slate-700 font-medium mb-1.5 block">
                    Số điểm
                  </Label>
                  <Input
                    type="number"
                    value={editPoints}
                    onChange={(e) => setEditPoints(e.target.value)}
                    className="text-base font-semibold"
                  />
                </div>
              </div>

              <div>
                <Label className="text-slate-700 font-medium mb-1.5 block">
                  Quy tắc (Tên)
                </Label>
                <Input
                  value={editRuleName}
                  onChange={(e) => setEditRuleName(e.target.value)}
                  placeholder="Nhập tên quy tắc..."
                />
              </div>

              <div>
                <Label className="text-slate-700 font-medium mb-1.5 block">
                  Mô tả chi tiết
                </Label>
                <textarea
                  value={editDescription}
                  onChange={(e) => setEditDescription(e.target.value)}
                  className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  placeholder="Nhập mô tả cho quy tắc này..."
                />
              </div>

              <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl">
                <div>
                  <Label className="text-slate-700 font-medium">Trạng thái áp dụng</Label>
                  <p className="text-xs text-slate-400">
                    Tắt = quy tắc này sẽ không được tính điểm
                  </p>
                </div>
                <Switch
                  checked={editActive}
                  onCheckedChange={setEditActive}
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <Button
                  variant="outline"
                  onClick={() => setEditModal(null)}
                  className="border-slate-200"
                >
                  Hủy
                </Button>
                <Button
                  onClick={handleSave}
                  disabled={updateMutation.isPending}
                  className="bg-amber-500 hover:bg-amber-600 text-white"
                >
                  {updateMutation.isPending ? 'Đang lưu...' : 'Lưu'}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
