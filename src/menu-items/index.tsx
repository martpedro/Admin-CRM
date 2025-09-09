// project-imports
import applications from './applications';
import pages from './pages';
import support from './support';


// types
import { NavItemType } from 'types/menu';
import Users from './Users';
import customer from './Customers';
import permissions from './Permissions';
import quotations from './Quotations';
import companies from './Companies';

// ==============================|| MENU ITEMS ||============================== //

const menuItems: { items: NavItemType[] } = {
  items: [Users, customer, companies, quotations, permissions]
};

export default menuItems;
