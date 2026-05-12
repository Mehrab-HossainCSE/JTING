export interface MenuResponse {
  id: number;
  name: string;
  displayName: string;
  url: string;
  navIcon: string;
  displayOrder: number;
  visible: boolean;
  controllerName?: string;
  actionUrl?: string;
  moduleId?: number | null;
  canView?: boolean;
  canCreate?: boolean;
  canUpdate?: boolean;
  canDelete?: boolean;
  children?: MenuResponse[];
}

export interface ApiMenuResponse {
  success: boolean;
  message: string;
  data: MenuResponse[];
  errors: string[] | null;
  errorCode: string | null;
  traceId: string | null;
}