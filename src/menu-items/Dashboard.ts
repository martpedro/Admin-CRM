// Simple dashboard menu item without group
import { NavItemType } from 'types/menu';
import { Element4 } from 'iconsax-react';


const dashboard: NavItemType = {
  id: 'dashboard',
  title: 'Inicio',
  type: 'group',
  url: '/inicio',
  icon: Element4
};

export default dashboard;
