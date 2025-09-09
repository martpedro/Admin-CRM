// assets
import { Buildings } from 'iconsax-react';

// type
import { NavItemType } from 'types/menu';

const icons = { companies: Buildings };

const companies: NavItemType = {
  id: 'group-companies',
  title: 'Empresas',
  icon: icons.companies,
  type: 'group',
  children: [
    {
      id: 'companies-list',
      title: 'Listado',
      type: 'item',
      url: '/company/list',
      icon: icons.companies
    }
  ]
};

export default companies;
