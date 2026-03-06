export interface MenuItem {
  id: string;
  key: string;
  label: string;
  path: string;
  screen: string;
  resource: string;
  action: string;
  icon?: string;
  sortOrder: number;
  enabled: boolean;
}
