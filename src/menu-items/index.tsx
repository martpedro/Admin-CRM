// project-imports
import applications from './applications';
import pages from './pages';
import samplePage from './sample-page';
import support from './support';


// types
import { NavItemType } from 'types/menu';
import Users from './Users';
import customer from './Customers';
import sales from './Sales';

// ==============================|| MENU ITEMS ||============================== //

const menuItems: { items: NavItemType[] } = {
  items: [samplePage, Users, customer, sales]
};

export default menuItems;
