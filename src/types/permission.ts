// ==============================|| TYPES - Permission  ||============================== //

export interface PermissionProps {
  modal: boolean;
}

export interface User {
  id: number;
  name: string;
  lastName: string;
  email: string;
  isActive: boolean;
  rol?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface PermissionAdvanced {
  id?: number;
  permissionKey: string;
  name: string;
  description?: string;
  module: string;
  type: PermissionType;
  dataScope?: DataScope;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface UserPermission {
  id?: number;
  userId: number;
  permissionId: number;
  assignedBy: number;
  assignedAt: string;
  permission?: PermissionAdvanced;
}

export interface Team {
  id?: number;
  name: string;
  description?: string;
  leaderId: number;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
  members?: TeamMember[];
  leader?: any; // User data
}

export interface TeamMember {
  id?: number;
  teamId: number;
  userId: number;
  joinedAt: string;
  user?: any; // User data
}

export interface MenuPermission {
  id?: number;
  userId: number;
  menuItem: string;
  canAccess: boolean;
  assignedBy: number;
  assignedAt: string;
}

export enum PermissionType {
  BASIC_CRUD = 'BASIC_CRUD',
  DATA_SCOPE = 'DATA_SCOPE',
  MENU_ACCESS = 'MENU_ACCESS',
  ACTION_PERMISSION = 'ACTION_PERMISSION'
}

export enum DataScope {
  ALL = 'ALL',
  TEAM_ONLY = 'TEAM_ONLY',
  OWN_ONLY = 'OWN_ONLY',
  DEPARTMENT = 'DEPARTMENT',
  REGIONAL = 'REGIONAL'
}

export interface PermissionCheckRequest {
  userId: number;
  permissionKey: string;
}

export interface PermissionAssignRequest {
  userId: number;
  permissionId: number;
  assignedBy: number;
}

export interface PermissionRevokeRequest {
  userId: number;
  permissionId: number;
}

export interface TeamCreateRequest {
  name: string;
  description?: string;
  leaderId: number;
  memberIds: number[];
}

export interface TeamUpdateRequest {
  id: number;
  name?: string;
  description?: string;
  leaderId?: number;
  memberIds?: number[];
}

export interface DataScopeResponse {
  scope: DataScope;
  teamId?: number;
  departmentId?: number;
  regionId?: string;
}
