'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Plus, Pencil, Trash2, ChevronRight, ChevronDown,
  LayoutDashboard, GripVertical, FolderOpen, List,
  Users, Folder, Layers, Calendar, BookOpen, ClipboardCheck,
  Home, Star, Building, MapPin, TrendingUp, GraduationCap,
  Eye, EyeOff, Shield
} from 'lucide-react';
import { toast } from 'react-hot-toast';

import { moduleGroupApi, moduleApi } from '@/api/moduleApi';
import type { ModuleGroup, Module, CreateModuleGroupRequest, CreateModuleRequest, IconKey } from '@/types/module';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';

// ─── Icon Pick ───────────────────────────────────────────────
const ICON_OPTIONS: { key: IconKey; label: string; Icon: any }[] = [
  { key: 'dashboard', label: 'Dashboard', Icon: LayoutDashboard },
  { key: 'users', label: 'Users', Icon: Users },
  { key: 'folder', label: 'Folder', Icon: Folder },
  { key: 'menu', label: 'Menu', Icon: List },
  { key: 'layers', label: 'Layers', Icon: Layers },
  { key: 'calendar', label: 'Calendar', Icon: Calendar },
  { key: 'book-open', label: 'Book', Icon: BookOpen },
  { key: 'clipboard-check', label: 'Clipboard', Icon: ClipboardCheck },
  { key: 'home', label: 'Home', Icon: Home },
  { key: 'star', label: 'Star', Icon: Star },
  { key: 'building', label: 'Building', Icon: Building },
  { key: 'map-pin', label: 'Map Pin', Icon: MapPin },
  { key: 'trending-up', label: 'Trending', Icon: TrendingUp },
  { key: 'graduation-cap', label: 'Education', Icon: GraduationCap },
  { key: 'security', label: 'Security', Icon: Shield },
];

// ─── Types ───────────────────────────────────────────────────
type GroupDialogMode = { type: 'create' } | { type: 'edit'; group: ModuleGroup };
type ModuleDialogMode = { type: 'create'; groupId: string; parentId?: string } | { type: 'edit'; module: Module; groupId: string };

// ─── Sub-components ──────────────────────────────────────────
function IconPicker({ value, onChange }: { value?: string; onChange: (v: IconKey) => void }) {
  return (
    <div className="flex flex-wrap gap-2">
      {ICON_OPTIONS.map(({ key, label, Icon }) => (
        <button
          key={key}
          type="button"
          title={label}
          onClick={() => onChange(key)}
          className={`p-2 rounded-lg border transition-all ${
            value === key
              ? 'border-blue-600 bg-blue-50 text-blue-700'
              : 'border-slate-200 hover:border-slate-300 text-slate-500'
          }`}
        >
          <Icon className="h-4 w-4" />
        </button>
      ))}
    </div>
  );
}

function ModuleRow({
  module, groupId, depth = 0,
  onEdit, onDelete, onAddChild,
}: {
  module: Module;
  groupId: string;
  depth?: number;
  onEdit: (m: Module) => void;
  onDelete: (id: string) => void;
  onAddChild: (parentId: string) => void;
}) {
  const [expanded, setExpanded] = useState(true);
  const hasChildren = module.children && module.children.length > 0;

  const IconComp = ICON_OPTIONS.find(i => i.key === module.icon)?.Icon;

  return (
    <div>
      <div
        className={`flex items-center gap-3 px-4 py-2.5 rounded-lg hover:bg-slate-50 group transition-all ${
          depth > 0 ? 'ml-8 border-l-2 border-slate-100 pl-4' : ''
        }`}
      >
        {/* Expand toggle */}
        <button
          className="text-slate-400 flex-shrink-0"
          onClick={() => setExpanded(!expanded)}
        >
          {hasChildren ? (
            expanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />
          ) : (
            <GripVertical className="h-4 w-4 opacity-30" />
          )}
        </button>

        {/* Icon */}
        <div className="h-8 w-8 rounded-lg bg-slate-100 flex items-center justify-center flex-shrink-0">
          {IconComp ? <IconComp className="h-4 w-4 text-slate-600" /> : <List className="h-4 w-4 text-slate-400" />}
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-sm text-slate-800 truncate">{module.title}</span>
            {!module.isActive && (
              <Badge variant="secondary" className="text-[10px] py-0">Ẩn</Badge>
            )}
            {module.requiredPermission && (
              <Badge variant="outline" className="text-[10px] py-0 border-orange-300 text-orange-600">
                {module.requiredPermission}
              </Badge>
            )}
          </div>
          {module.url && (
            <span className="text-[11px] text-slate-400 font-mono">{module.url}</span>
          )}
        </div>

        {/* Actions */}
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          {depth === 0 && (
            <Button
              variant="ghost" size="icon"
              className="h-7 w-7 text-slate-400 hover:text-blue-600"
              onClick={() => onAddChild(module.id)}
              title="Thêm mục con"
            >
              <Plus className="h-3.5 w-3.5" />
            </Button>
          )}
          <Button
            variant="ghost" size="icon"
            className="h-7 w-7 text-slate-400 hover:text-slate-700"
            onClick={() => onEdit(module)}
          >
            <Pencil className="h-3.5 w-3.5" />
          </Button>
          <Button
            variant="ghost" size="icon"
            className="h-7 w-7 text-slate-400 hover:text-red-500"
            onClick={() => onDelete(module.id)}
          >
            <Trash2 className="h-3.5 w-3.5" />
          </Button>
        </div>
      </div>

      {/* Children */}
      {hasChildren && expanded && (
        <div className="mt-0.5">
          {module.children.map(child => (
            <ModuleRow
              key={child.id}
              module={child}
              groupId={groupId}
              depth={depth + 1}
              onEdit={onEdit}
              onDelete={onDelete}
              onAddChild={onAddChild}
            />
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Main Page ───────────────────────────────────────────────
export default function ModulesPage() {
  const qc = useQueryClient();

  const { data: groupsData, isLoading } = useQuery<ModuleGroup[]>({
    queryKey: ['module-groups-admin'],
    queryFn: () => moduleGroupApi.getAllModuleGroups({ page: 0, size: 100, sort: 'displayOrder' }),
  });

  const groups: ModuleGroup[] = (groupsData as any)?.content || groupsData || [];

  // ── Dialog State ──
  const [groupDialog, setGroupDialog] = useState<GroupDialogMode | null>(null);
  const [moduleDialog, setModuleDialog] = useState<ModuleDialogMode | null>(null);

  // ── Group Form ──
  const [groupForm, setGroupForm] = useState<Partial<CreateModuleGroupRequest & { isActive: boolean }>>({});

  // ── Module Form ──
  const [moduleForm, setModuleForm] = useState<Partial<CreateModuleRequest & { isActive: boolean; title: string }>>({});

  // ── Delete confirm ──
  const [deleteTarget, setDeleteTarget] = useState<{ type: 'group' | 'module'; id: string } | null>(null);

  // ── Mutations ──
  const createGroup = useMutation({
    mutationFn: moduleGroupApi.createModuleGroup,
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['module-groups-admin'] }); toast.success('Đã tạo nhóm menu'); setGroupDialog(null); },
    onError: () => toast.error('Tạo nhóm thất bại'),
  });

  const updateGroup = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<ModuleGroup> }) => moduleGroupApi.updateModuleGroup(id, data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['module-groups-admin'] }); toast.success('Đã cập nhật nhóm'); setGroupDialog(null); },
    onError: () => toast.error('Cập nhật nhóm thất bại'),
  });

  const deleteGroup = useMutation({
    mutationFn: moduleGroupApi.deleteModuleGroup,
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['module-groups-admin'] }); toast.success('Đã xóa nhóm'); setDeleteTarget(null); },
    onError: () => toast.error('Xóa nhóm thất bại'),
  });

  const createModule = useMutation({
    mutationFn: moduleApi.createModule,
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['module-groups-admin'] }); toast.success('Đã tạo mục menu'); setModuleDialog(null); },
    onError: () => toast.error('Tạo mục thất bại'),
  });

  const updateModule = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Module> }) => moduleApi.updateModule(id, data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['module-groups-admin'] }); toast.success('Đã cập nhật mục'); setModuleDialog(null); },
    onError: () => toast.error('Cập nhật mục thất bại'),
  });

  const deleteModule = useMutation({
    mutationFn: moduleApi.deleteModule,
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['module-groups-admin'] }); toast.success('Đã xóa mục'); setDeleteTarget(null); },
    onError: () => toast.error('Xóa mục thất bại'),
  });

  // ── Handlers ──
  function openCreateGroup() {
    setGroupForm({ displayOrder: (groups.length + 1) });
    setGroupDialog({ type: 'create' });
  }

  function openEditGroup(group: ModuleGroup) {
    setGroupForm({ name: group.name, description: group.description, displayOrder: group.displayOrder, isActive: group.isActive });
    setGroupDialog({ type: 'edit', group });
  }

  function openCreateModule(groupId: string, parentId?: string) {
    setModuleForm({ moduleGroupId: groupId, parentId, isActive: true, displayOrder: 0 });
    setModuleDialog({ type: 'create', groupId, parentId });
  }

  function openEditModule(module: Module, groupId: string) {
    setModuleForm({
      moduleGroupId: groupId,
      parentId: module.parentId,
      title: module.title,
      url: module.url,
      icon: module.icon as IconKey,
      requiredPermission: module.requiredPermission,
      displayOrder: module.displayOrder,
      isActive: module.isActive,
    });
    setModuleDialog({ type: 'edit', module, groupId });
  }

  function handleGroupSubmit() {
    if (!groupForm.name?.trim()) return toast.error('Tên nhóm không được trống');
    if (groupDialog?.type === 'create') {
      createGroup.mutate({ name: groupForm.name, description: groupForm.description, displayOrder: groupForm.displayOrder });
    } else if (groupDialog?.type === 'edit') {
      updateGroup.mutate({ id: groupDialog.group.id, data: groupForm });
    }
  }

  function handleModuleSubmit() {
    if (!moduleForm.title?.trim()) return toast.error('Tiêu đề không được trống');
    if (moduleDialog?.type === 'create') {
      createModule.mutate({
        moduleGroupId: moduleDialog.groupId,
        parentId: moduleDialog.parentId,
        title: moduleForm.title!,
        url: moduleForm.url,
        icon: moduleForm.icon,
        requiredPermission: moduleForm.requiredPermission,
        displayOrder: moduleForm.displayOrder,
      });
    } else if (moduleDialog?.type === 'edit') {
      updateModule.mutate({ id: moduleDialog.module.id, data: moduleForm });
    }
  }

  function handleDeleteConfirm() {
    if (!deleteTarget) return;
    if (deleteTarget.type === 'group') deleteGroup.mutate(deleteTarget.id);
    else deleteModule.mutate(deleteTarget.id);
  }

  return (
    <div className="flex flex-col gap-6 h-full">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-slate-900">Quản lý Menu</h1>
          <p className="text-sm text-slate-500 mt-0.5">Cấu hình menu điều hướng cho Admin Dashboard</p>
        </div>
        <Button onClick={openCreateGroup} className="gap-2 bg-blue-700 hover:bg-blue-800 rounded-xl">
          <Plus className="h-4 w-4" />
          Thêm nhóm
        </Button>
      </div>

      {/* Groups */}
      {isLoading ? (
        <div className="flex items-center justify-center h-40 text-slate-400">Đang tải...</div>
      ) : groups.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-40 text-slate-400 gap-3">
          <FolderOpen className="h-10 w-10 opacity-30" />
          <p className="text-sm">Chưa có nhóm menu nào. Tạo nhóm đầu tiên!</p>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {groups.map(group => (
            <div key={group.id} className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
              {/* Group Header */}
              <div className="flex items-center justify-between px-5 py-3.5 bg-slate-50/70 border-b border-slate-100">
                <div className="flex items-center gap-3">
                  <div className="h-8 w-8 rounded-lg bg-blue-100 flex items-center justify-center">
                    <Layers className="h-4 w-4 text-blue-600" />
                  </div>
                  <div>
                    <span className="font-black text-sm text-slate-800">{group.name}</span>
                    {!group.isActive && (
                      <Badge variant="secondary" className="ml-2 text-[10px]">Ẩn</Badge>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <Button
                    variant="ghost" size="sm"
                    className="gap-1.5 text-xs text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                    onClick={() => openCreateModule(group.id)}
                  >
                    <Plus className="h-3.5 w-3.5" />
                    Thêm mục
                  </Button>
                  <Button
                    variant="ghost" size="icon"
                    className="h-8 w-8 text-slate-400 hover:text-slate-700"
                    onClick={() => openEditGroup(group)}
                  >
                    <Pencil className="h-3.5 w-3.5" />
                  </Button>
                  <Button
                    variant="ghost" size="icon"
                    className="h-8 w-8 text-slate-400 hover:text-red-500"
                    onClick={() => setDeleteTarget({ type: 'group', id: group.id })}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>

              {/* Modules */}
              <div className="p-3">
                {(!group.modules || group.modules.length === 0) ? (
                  <div className="text-center text-slate-400 text-xs py-4">Chưa có mục menu nào</div>
                ) : (
                  group.modules
                    .filter(m => !m.parentId)
                    .sort((a, b) => (a.displayOrder || 0) - (b.displayOrder || 0))
                    .map(module => (
                      <ModuleRow
                        key={module.id}
                        module={module}
                        groupId={group.id}
                        onEdit={(m) => openEditModule(m, group.id)}
                        onDelete={(id) => setDeleteTarget({ type: 'module', id })}
                        onAddChild={(parentId) => openCreateModule(group.id, parentId)}
                      />
                    ))
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ── Group Dialog ── */}
      <Dialog open={!!groupDialog} onOpenChange={() => setGroupDialog(null)}>
        <DialogContent className="sm:max-w-md rounded-2xl">
          <DialogHeader>
            <DialogTitle>{groupDialog?.type === 'create' ? 'Tạo nhóm menu' : 'Chỉnh sửa nhóm'}</DialogTitle>
          </DialogHeader>
          <div className="flex flex-col gap-4 py-2">
            <div className="grid gap-1.5">
              <Label className="text-xs font-bold text-slate-600">Tên nhóm *</Label>
              <Input
                placeholder="VD: Quản lý hệ thống"
                value={groupForm.name || ''}
                onChange={e => setGroupForm(p => ({ ...p, name: e.target.value }))}
                className="rounded-xl"
              />
            </div>
            <div className="grid gap-1.5">
              <Label className="text-xs font-bold text-slate-600">Mô tả</Label>
              <Input
                placeholder="Mô tả ngắn..."
                value={groupForm.description || ''}
                onChange={e => setGroupForm(p => ({ ...p, description: e.target.value }))}
                className="rounded-xl"
              />
            </div>
            <div className="grid gap-1.5">
              <Label className="text-xs font-bold text-slate-600">Thứ tự hiển thị</Label>
              <Input
                type="number" min={0}
                value={groupForm.displayOrder ?? ''}
                onChange={e => setGroupForm(p => ({ ...p, displayOrder: Number(e.target.value) }))}
                className="rounded-xl"
              />
            </div>
            {groupDialog?.type === 'edit' && (
              <div className="flex items-center justify-between">
                <Label className="text-xs font-bold text-slate-600">Hiển thị</Label>
                <Switch
                  checked={!!groupForm.isActive}
                  onCheckedChange={v => setGroupForm(p => ({ ...p, isActive: v }))}
                />
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setGroupDialog(null)}>Hủy</Button>
            <Button
              onClick={handleGroupSubmit}
              disabled={createGroup.isPending || updateGroup.isPending}
              className="bg-blue-700 hover:bg-blue-800 rounded-xl"
            >
              {groupDialog?.type === 'create' ? 'Tạo nhóm' : 'Lưu thay đổi'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── Module Dialog ── */}
      <Dialog open={!!moduleDialog} onOpenChange={() => setModuleDialog(null)}>
        <DialogContent className="sm:max-w-lg rounded-2xl">
          <DialogHeader>
            <DialogTitle>
              {moduleDialog?.type === 'create'
                ? moduleDialog?.parentId ? 'Thêm mục con' : 'Thêm mục menu'
                : 'Chỉnh sửa mục menu'}
            </DialogTitle>
          </DialogHeader>
          <div className="flex flex-col gap-4 py-2">
            <div className="grid gap-1.5">
              <Label className="text-xs font-bold text-slate-600">Tiêu đề *</Label>
              <Input
                placeholder="VD: Quản lý Người dùng"
                value={moduleForm.title || ''}
                onChange={e => setModuleForm(p => ({ ...p, title: e.target.value }))}
                className="rounded-xl"
              />
            </div>
            <div className="grid gap-1.5">
              <Label className="text-xs font-bold text-slate-600">Đường dẫn (URL)</Label>
              <Input
                placeholder="VD: /admin/users"
                value={moduleForm.url || ''}
                onChange={e => setModuleForm(p => ({ ...p, url: e.target.value }))}
                className="rounded-xl font-mono"
              />
            </div>
            <div className="grid gap-1.5">
              <Label className="text-xs font-bold text-slate-600">Icon</Label>
              <IconPicker
                value={moduleForm.icon}
                onChange={v => setModuleForm(p => ({ ...p, icon: v }))}
              />
            </div>
            <div className="grid gap-1.5">
              <Label className="text-xs font-bold text-slate-600">Quyền yêu cầu</Label>
              <Input
                placeholder="VD: VIEW_USERS"
                value={moduleForm.requiredPermission || ''}
                onChange={e => setModuleForm(p => ({ ...p, requiredPermission: e.target.value }))}
                className="rounded-xl font-mono"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="grid gap-1.5">
                <Label className="text-xs font-bold text-slate-600">Thứ tự</Label>
                <Input
                  type="number" min={0}
                  value={moduleForm.displayOrder ?? ''}
                  onChange={e => setModuleForm(p => ({ ...p, displayOrder: Number(e.target.value) }))}
                  className="rounded-xl"
                />
              </div>
              <div className="flex flex-col gap-1.5 justify-end pb-1">
                <Label className="text-xs font-bold text-slate-600">Hiển thị</Label>
                <Switch
                  checked={!!moduleForm.isActive}
                  onCheckedChange={v => setModuleForm(p => ({ ...p, isActive: v }))}
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setModuleDialog(null)}>Hủy</Button>
            <Button
              onClick={handleModuleSubmit}
              disabled={createModule.isPending || updateModule.isPending}
              className="bg-blue-700 hover:bg-blue-800 rounded-xl"
            >
              {moduleDialog?.type === 'create' ? 'Tạo mục' : 'Lưu thay đổi'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── Delete Confirm ── */}
      <Dialog open={!!deleteTarget} onOpenChange={() => setDeleteTarget(null)}>
        <DialogContent className="sm:max-w-sm rounded-2xl">
          <DialogHeader>
            <DialogTitle>Xác nhận xóa</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-slate-600">
            {deleteTarget?.type === 'group'
              ? 'Xóa nhóm menu này sẽ xóa tất cả các mục menu bên trong. Hành động không thể hoàn tác.'
              : 'Xóa mục menu này. Nếu là mục cha, tất cả mục con cũng sẽ bị xóa.'}
          </p>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setDeleteTarget(null)}>Hủy</Button>
            <Button
              variant="destructive"
              onClick={handleDeleteConfirm}
              disabled={deleteGroup.isPending || deleteModule.isPending}
              className="rounded-xl"
            >
              Xóa
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
