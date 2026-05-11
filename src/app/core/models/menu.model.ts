export interface MenuItem {
  // Backend response properties
  id: number;
  name?: string;
  parentMenuId?: number | null;
  controllerName?: string;
  actionUrl?: string;
  url?: string;
  navIcon?: string;
  displayOrder?: number;
  visible?: boolean;
  moduleId?: number | null;

  // Mapped properties for template
  menuId: number;
  menuName: string;
  icon: string;
  menuUrl: string;

  children?: MenuItem[];
}