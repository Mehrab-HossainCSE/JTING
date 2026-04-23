export interface MenuItem {
  menuId: number;
  menuName: string;
  menuUrl: string;
  icon: string;
  parentId: number | null;
  children?: MenuItem[];
}

export interface MenuResponse {
  menus: MenuItem[];
}