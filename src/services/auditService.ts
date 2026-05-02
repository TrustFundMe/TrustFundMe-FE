import { api } from '@/config/axios';

export interface AuditLog {
  id: number;
  entityType: string;
  entityId: number;
  action: string;
  dataSnapshot: string;
  auditHash: string;
  previousHash: string;
  actorId: number;
  actorName: string;
  ipAddress: string;
  userAgent: string;
  createdAt: string;
}

export interface Page<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
}

export const auditService = {
  async getAll(page = 0, size = 10, query = '') {
    const res = await api.get<Page<AuditLog>>('/api/audit', {
      params: { page, size, query, sort: 'createdAt,desc' }
    });
    return res.data;
  },
  
  async getByEntity(entityType: string, entityId: number) {
    const res = await api.get<AuditLog[]>(`/api/audit/entity/${entityType}/${entityId}`);
    return res.data;
  },

  async getGlobalStatus() {
    const res = await api.get<{ integrity: string, total: number, status: string }>('/api/audit/integrity');
    return res.data;
  },

  async verifyIntegrity(auditId: number) {
    const res = await api.get<{ valid: boolean, currentHash: string }>(`/api/audit/${auditId}/verify`);
    return res.data;
  },

  async create(data: {
    entityType: string;
    entityId: number;
    action: string;
    dataSnapshot: string;
    auditHash: string;
    actorId?: number;
    actorName?: string;
  }) {
    const res = await api.post<AuditLog>('/api/audit', data);
    return res.data;
  }
};
