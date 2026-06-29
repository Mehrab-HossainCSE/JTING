import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';

import { FormsModule } from '@angular/forms';

import { Role } from '../../../../core/models/role/role';
import { RoleService } from '../../../../core/services/roleManageServices/role-service';
import { NavMenuService } from '../../../../core/services/navMenusServices/nav-menu-service';
import { ErrorHandlerService } from '../../../../core/services/error-handler.service';
import { ToastrService } from 'ngx-toastr';
import { StorageService } from '../../../../core/services/storage.service';
import { MenuResponse } from '../../../../core/models/MenuResponse';

@Component({
  selector: 'app-assign-role-component',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './assign-role-component.html',
  styleUrl: './assign-role-component.scss'
})
export class AssignRoleComponent implements OnInit {
  private roleService = inject(RoleService);
  private navMenuService = inject(NavMenuService);
  private errorHandler = inject(ErrorHandlerService);
  private toastr = inject(ToastrService);
  private storageService = inject(StorageService);

  selectedRole = signal<string>('');
  roles = signal<Role[]>([]);
  menuSections = signal<any[]>([]);

  permissions = signal({
    canView: false,
    canCreate: false,
    canUpdate: false,
    canDelete: false
  });

  canView = computed(() => this.permissions().canView);
  canUpdate = computed(() => this.permissions().canUpdate);

  // Split sections into two columns
  leftColumnSections = computed(() => {
    const sections = this.menuSections();
    const half = Math.ceil(sections.length / 2);
    return sections.slice(0, half);
  });

  rightColumnSections = computed(() => {
    const sections = this.menuSections();
    const half = Math.ceil(sections.length / 2);
    return sections.slice(half);
  });

  // Flat items per column (for header checkbox states)
  leftColumnItems = computed(() => {
    const flat: any[] = [];
    this.leftColumnSections().forEach(s => s.items.forEach((i: any) => flat.push(i)));
    return flat;
  });

  rightColumnItems = computed(() => {
    const flat: any[] = [];
    this.rightColumnSections().forEach(s => s.items.forEach((i: any) => flat.push(i)));
    return flat;
  });

  totalItemsCount = computed(() => this.leftColumnItems().length + this.rightColumnItems().length);
  totalActiveCount = computed(() =>
    [...this.leftColumnItems(), ...this.rightColumnItems()].filter(i => i.isSelected).length
  );

  allLeftView  = computed(() => this.leftColumnItems().length > 0 && this.leftColumnItems().every(i => i.view));
  allLeftAdd   = computed(() => this.leftColumnItems().length > 0 && this.leftColumnItems().every(i => i.add));
  allLeftEdit  = computed(() => this.leftColumnItems().length > 0 && this.leftColumnItems().every(i => i.edit));
  allRightView = computed(() => this.rightColumnItems().length > 0 && this.rightColumnItems().every(i => i.view));
  allRightAdd  = computed(() => this.rightColumnItems().length > 0 && this.rightColumnItems().every(i => i.add));
  allRightEdit = computed(() => this.rightColumnItems().length > 0 && this.rightColumnItems().every(i => i.edit));

  ngOnInit(): void {
    this.loadPermissionsFromStorage();

    if (this.canView()) {
      this.roleService.getAll().subscribe({
        next: (response) => {
          if (response && response.data) {
            this.roles.set(response.data);
          }
        },
        error: (error) => {
          this.errorHandler.handleErrorWithToster(error);
        }
      });

      this.loadMenuDistribution();
    }
  }

  private loadPermissionsFromStorage(): void {
    const menus = this.storageService.getAngularItem<MenuResponse[]>('menus');
    const userManagementMenu = menus?.find(
      (menu) => menu.name?.toUpperCase().includes('USER_MANAGEMENT') ||
                menu.url?.toLowerCase().includes('/users')
    );

    const assignRoleMenu = userManagementMenu?.children?.find(
      (child) => child.name?.toUpperCase().includes('ASSIGN_MODULE_WITH_ROLE') ||
                 child.url?.toLowerCase().includes('/assignrole') ||
                 child.url?.toLowerCase().includes('/assign-role')
    );

    if (!assignRoleMenu) {
      this.permissions.set({ canView: false, canCreate: false, canUpdate: false, canDelete: false });
      return;
    }

    this.permissions.set({
      canView: !!assignRoleMenu.canView,
      canCreate: !!assignRoleMenu.canCreate,
      canUpdate: !!assignRoleMenu.canUpdate,
      canDelete: !!assignRoleMenu.canDelete
    });
  }

  loadMenuDistribution(): void {
    this.navMenuService.getChildrenMenuItems().subscribe({
      next: (response) => {
        if (response && response.data) {
          this.menuSections.set(response.data.map((section: any) => ({
            id: section.id,
            name: section.name,
            displayName: section.displayName,
            url: section.url,
            navIcon: section.navIcon,
            displayOrder: section.displayOrder,
            visible: section.visible,
            title: section.displayName,
            isSelected: false,
            allView: false,
            allAdd: false,
            allEdit: false,
            allDelete: false,
            isOpen: true,
            items: section.children ? section.children.map((child: any) => ({
              id: child.id,
              originalName: child.name,
              displayName: child.displayName,
              controllerName: child.controllerName,
              actionUrl: child.actionUrl,
              url: child.url,
              navIcon: child.navIcon,
              displayOrder: child.displayOrder,
              visible: child.visible,
              moduleId: child.moduleId,
              name: child.displayName,
              isSelected: false,
              view: child.canView || false,
              add: child.canCreate || false,
              edit: child.canUpdate || false,
              delete: child.canDelete || false
            })) : []
          })));
        }
      },
      error: (error) => {
        this.errorHandler.handleErrorWithToster(error);
      }
    });
  }

  onRoleChange(roleId: string): void {
    this.selectedRole.set(roleId);
    if (!roleId) return;

    this.navMenuService.getNavMenusByRoleId(roleId).subscribe({
      next: (response) => {
        if (response && response.data) {
          this.updateMenuPermissions(response.data);
        }
      },
      error: (error) => {
        this.errorHandler.handleErrorWithToster(error);
      }
    });
  }

  updateMenuPermissions(roleMenus: any[]): void {
    const roleMenuMap = new Map<number, any>();
    const flatten = (menus: any[]) => {
      for (const m of menus) {
        roleMenuMap.set(m.id, m);
        if (m.children && m.children.length > 0) {
          flatten(m.children);
        }
      }
    };
    flatten(roleMenus);

    this.menuSections.update(sections => {
      sections.forEach(section => {
        let anyItemSelected = false;

        section.items.forEach((item: any) => {
          const roleMenu = roleMenuMap.get(item.id);
          if (roleMenu) {
            item.view = roleMenu.canView || false;
            item.add = roleMenu.canCreate || false;
            item.edit = roleMenu.canUpdate || false;
            item.delete = roleMenu.canDelete || false;
            item.isSelected = item.view || item.add || item.edit || item.delete;
          } else {
            item.view = false;
            item.add = false;
            item.edit = false;
            item.delete = false;
            item.isSelected = false;
          }
          if (item.isSelected) anyItemSelected = true;
        });

        section.isSelected = anyItemSelected;

        if (section.items.length > 0) {
          section.allView = section.items.every((i: any) => i.view);
          section.allAdd = section.items.every((i: any) => i.add);
          section.allEdit = section.items.every((i: any) => i.edit);
          section.allDelete = section.items.every((i: any) => i.delete);
        }
      });
      return [...sections];
    });
  }

  toggleSection(section: any): void {
    section.isOpen = !section.isOpen;
    this.menuSections.update(sections => [...sections]);
  }

  onPermissionToggle(section: any, permission: string, event: Event): void {
    const checked = (event.target as HTMLInputElement).checked;
    const propName = 'all' + permission.charAt(0).toUpperCase() + permission.slice(1);
    section[propName] = checked;
    section.items.forEach((item: any) => {
      item[permission] = checked;
      item.isSelected = item.view || item.add || item.edit || item.delete;
    });
    section.isSelected = section.items.some((i: any) => i.isSelected);
    this.menuSections.update(sections => [...sections]);
  }

  togglePermission(item: any, permission: string, section: any): void {
    if (!this.canUpdate()) return;
    item[permission] = !item[permission];
    item.isSelected = item.view || item.add || item.edit || item.delete;

    section.isSelected = section.items.some((i: any) => i.isSelected);
    section.allView = section.items.every((i: any) => i.view);
    section.allAdd = section.items.every((i: any) => i.add);
    section.allEdit = section.items.every((i: any) => i.edit);

    this.menuSections.update(sections => [...sections]);
  }

  toggleColumnPermission(column: 'left' | 'right', permission: 'view' | 'add' | 'edit', event: Event): void {
    if (!this.canUpdate()) return;
    const checked = (event.target as HTMLInputElement).checked;
    const sections = column === 'left' ? this.leftColumnSections() : this.rightColumnSections();

    this.menuSections.update(allSections => {
      sections.forEach(section => {
        const propName = 'all' + permission.charAt(0).toUpperCase() + permission.slice(1);
        section[propName] = checked;
        section.items.forEach((item: any) => {
          item[permission] = checked;
          item.isSelected = item.view || item.add || item.edit || item.delete;
        });
        section.isSelected = section.items.some((i: any) => i.isSelected);
      });
      return [...allSections];
    });
  }

  selectAll(): void {
    this.menuSections.update(sections => {
      sections.forEach(section => {
        section.isSelected = true;
        section.allView = true;
        section.allAdd = true;
        section.allEdit = true;
        section.allDelete = true;
        section.items.forEach((item: any) => {
          item.isSelected = true;
          item.view = true;
          item.add = true;
          item.edit = true;
          item.delete = true;
        });
      });
      return [...sections];
    });
  }

  clearAll(): void {
    this.menuSections.update(sections => {
      sections.forEach(section => {
        section.isSelected = false;
        section.allView = false;
        section.allAdd = false;
        section.allEdit = false;
        section.allDelete = false;
        section.items.forEach((item: any) => {
          item.isSelected = false;
          item.view = false;
          item.add = false;
          item.edit = false;
          item.delete = false;
        });
      });
      return [...sections];
    });
  }

  savePermissions(): void {
    if (!this.canUpdate()) {
      this.toastr.warning('You do not have permission to update role assignments.', 'Warning');
      return;
    }

    const roleId = this.selectedRole();
    if (!roleId) {
      this.toastr.warning('Please select a role first.', 'Warning');
      return;
    }

    const payload = this.menuSections().map(section => ({
      id: section.id,
      name: section.name,
      displayName: section.displayName,
      url: section.url,
      navIcon: section.navIcon,
      displayOrder: section.displayOrder,
      visible: section.visible,
      children: section.items.map((item: any) => ({
        id: item.id,
        name: item.originalName,
        displayName: item.displayName,
        controllerName: item.controllerName,
        actionUrl: item.actionUrl,
        url: item.url,
        navIcon: item.navIcon,
        displayOrder: item.displayOrder,
        visible: item.visible,
        moduleId: item.moduleId,
        canView: item.view,
        canCreate: item.add,
        canUpdate: item.edit,
        canDelete: item.delete
      }))
    }));

    this.navMenuService.create(roleId, payload).subscribe({
      next: (res) => {
        if (res.success) {
          this.toastr.success('Permissions saved successfully.', 'Success');
        }
      },
      error: (error) => this.errorHandler.handleErrorWithToster(error)
    });
  }
}
