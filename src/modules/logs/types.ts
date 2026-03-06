export interface LogEntry {
  id: string;
  userId?: string;
  action: string;
  resource?: string;
  entityId?: string;
  description?: string;
  ip?: string;
  userAgent?: string;
  createdAt: Date;
}
