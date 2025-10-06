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
import dashboard from './Dashboard';
import profiles from './Profiles';

// ==============================|| MENU ITEMS ||============================== //

const menuItems: { items: NavItemType[] } = {
  items: [dashboard, Users, customer, companies, quotations, permissions, profiles]
};

export default menuItems;
