// assets
import { ReceiptText } from 'iconsax-react';

// type
import { NavItemType } from 'types/menu';

// icons
const icons = {
  quotations: ReceiptText
};

// ==============================|| MENU ITEMS - QUOTATIONS ||============================== //

const quotations: NavItemType = {
  id: 'group-quotations',
  title: 'quotations',
  icon: icons.quotations,
  type: 'group',
  children: [
    {
      id: 'quotations-list',
      title: 'quotations-list',
      type: 'item',
      url: '/quotations',
      icon: icons.quotations
    }
  ]
};

export default quotations;
