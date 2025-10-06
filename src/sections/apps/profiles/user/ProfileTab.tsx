import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

// third-party
import { FormattedMessage } from 'react-intl';

// material-ui
import List from '@mui/material/List';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';

// assets
import { Lock, Profile } from 'iconsax-react';

function getPathIndex(pathname: string) {
  let selectedTab = 0;
  switch (pathname) {
    case '/profiles/user/password':
      selectedTab = 1;
      break;
    case '/profiles/user/personal':
    default:
      selectedTab = 0;
  }
  return selectedTab;
}

// ==============================|| USER PROFILE - BASIC ||============================== //

export default function ProfileTab() {
  const navigate = useNavigate();
  const { pathname } = useLocation();

  const [selectedIndex, setSelectedIndex] = useState(getPathIndex(pathname));
  const handleListItemClick = (index: number, route: string) => {
    setSelectedIndex(index);
    navigate(route);
  };

  useEffect(() => {
    setSelectedIndex(getPathIndex(pathname));
  }, [pathname]);

  return (
    <List component="nav" sx={{ p: 0, '& .MuiListItemIcon-root': { minWidth: 32, color: 'secondary.main' } }}>
      <ListItemButton selected={selectedIndex === 0} onClick={() => handleListItemClick(0, '/profiles/user/personal')}>
        <ListItemIcon>
          <Profile size={18} />
        </ListItemIcon>
        <ListItemText primary={<FormattedMessage id="personal-information" />} />
      </ListItemButton>
      <ListItemButton selected={selectedIndex === 1} onClick={() => handleListItemClick(1, '/profiles/user/password')}>
        <ListItemIcon>
          <Lock size={18} />
        </ListItemIcon>
        <ListItemText primary={<FormattedMessage id="change-password" />} />
      </ListItemButton>
    </List>
  );
}
