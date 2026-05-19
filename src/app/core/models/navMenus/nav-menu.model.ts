export interface NavMenuItem {
  id: number;
  name: string;
  displayName: string;
  controllerName: string;
  actionUrl: string;
  url: string;
  navIcon: string;
  displayOrder: number;
  visible: boolean;
  moduleId: number;
  canView: boolean;
  canCreate: boolean;
  canUpdate: boolean;
  canDelete: boolean;
}

export interface NavMenu {
  id: number;
  name: string;
  displayName: string;
  url: string;
  navIcon: string;
  displayOrder: number;
  visible: boolean;
  children: NavMenuItem[];
}
