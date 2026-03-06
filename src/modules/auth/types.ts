export interface AuthTokenPayload {
  userId: string;
  roleId: string;
  permissions: Array<{ resource: string; action: string; screen: string }>;
  featureFlags: string[];
}
