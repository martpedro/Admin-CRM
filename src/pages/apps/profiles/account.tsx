import { useEffect, useState, SyntheticEvent } from 'react';
import { useLocation, Link, Outlet } from 'react-router-dom';

// third-party
import { FormattedMessage } from 'react-intl';

// material-ui
import Stack from '@mui/material/Stack';
import Tab from '@mui/material/Tab';
import Tabs from '@mui/material/Tabs';
import Box from '@mui/material/Box';

// project-imports
import Breadcrumbs from 'components/@extended/Breadcrumbs';
import MainCard from 'components/MainCard';
import { APP_DEFAULT_PATH, GRID_COMMON_SPACING } from 'config';

// assets
import { DocumentText, Lock, Profile } from 'iconsax-react';

// ==============================|| PROFILE - ACCOUNT ||============================== //

export default function AccountProfile() {
  const { pathname } = useLocation();

  let selectedTab = 0;
  let breadcrumbTitle = '';
  let breadcrumbHeading = '';
  switch (pathname) {
    case '/profiles/account/personal':
      breadcrumbTitle = 'personal-tab';
      breadcrumbHeading = 'personal-tab';
      selectedTab = 1;
      break;
    case '/profiles/account/password':
      breadcrumbTitle = 'change-password-tab';
      breadcrumbHeading = 'change-password-tab';
      selectedTab = 2;
      break;
    case '/profiles/account/basic':
    default:
      breadcrumbTitle = 'profile-tab';
      breadcrumbHeading = 'profile-tab';
      selectedTab = 0;
  }

  const [value, setValue] = useState(selectedTab);

  const handleChange = (event: SyntheticEvent, newValue: number) => {
    setValue(newValue);
  };

  let breadcrumbLinks = [
    { title: 'inicio', to: APP_DEFAULT_PATH },
    { title: 'perfil-cuenta', to: '/profiles/account/basic' },
    { title: breadcrumbTitle }
  ];
  if (selectedTab === 0) {
    breadcrumbLinks = [{ title: 'inicio', to: APP_DEFAULT_PATH }, { title: 'perfil-cuenta' }];
  }

  useEffect(() => {
    if (pathname === '/profiles/account/basic') {
      setValue(0);
    }
  }, [pathname]);

  return (
    <>
      <Breadcrumbs custom heading={breadcrumbHeading} links={breadcrumbLinks} />
      <MainCard border={false}>
        <Stack sx={{ gap: GRID_COMMON_SPACING }}>
          <Box sx={{ borderBottom: 1, borderColor: 'divider', width: '100%' }}>
            <Tabs value={value} onChange={handleChange} variant="scrollable" scrollButtons="auto" aria-label="account profile tab">
              <Tab label={<FormattedMessage id="profile-tab" />} component={Link} to="/profiles/account/basic" icon={<Profile />} iconPosition="start" />
              <Tab label={<FormattedMessage id="personal-tab" />} component={Link} to="/profiles/account/personal" icon={<DocumentText />} iconPosition="start" />
              <Tab label={<FormattedMessage id="change-password-tab" />} component={Link} to="/profiles/account/password" icon={<Lock />} iconPosition="start" />
            </Tabs>
          </Box>
          <Outlet />
        </Stack>
      </MainCard>
    </>
  );
}
