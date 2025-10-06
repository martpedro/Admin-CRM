// project-imports
import { NavItemType } from 'types/menu';

// assets
import { Profile, Profile2User } from 'iconsax-react';

// ==============================|| MENU ITEMS - PROFILES ||============================== //

const profiles: NavItemType = {
  id: 'group-profiles',
  title: 'Profiles',
  type: 'group',
  children: [
    {
      id: 'user-profile',
      title: 'User Profile',
      type: 'item',
      url: '/profiles/user/personal',
      icon: Profile,
      breadcrumbs: false
    },
    {
      id: 'account-profile',
      title: 'Account Profile',
      type: 'item',
      url: '/profiles/account/basic',
      icon: Profile2User,
      breadcrumbs: false
    }
  ]
};

export default profiles;