import { useRef, useState, ReactNode, SyntheticEvent } from 'react';
import { useNavigate } from 'react-router';

// material-ui
import { useTheme } from '@mui/material/styles';
import ButtonBase from '@mui/material/ButtonBase';
import CardContent from '@mui/material/CardContent';
import ClickAwayListener from '@mui/material/ClickAwayListener';
import Grid from '@mui/material/Grid2';
import Paper from '@mui/material/Paper';
import Popper from '@mui/material/Popper';
import Stack from '@mui/material/Stack';
import Tab from '@mui/material/Tab';
import Tabs from '@mui/material/Tabs';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';

// project-imports
import ProfileTab from './ProfileTab';
import SettingTab from './SettingTab';
import Avatar from 'components/@extended/Avatar';
import AvatarWithInitials from 'components/AvatarWithInitials';
import IconButton from 'components/@extended/IconButton';
import Transitions from 'components/@extended/Transitions';
import MainCard from 'components/MainCard';

import useAuth from 'hooks/useAuth';

// assets
import avatar1 from 'assets/images/users/avatar-6.png';
import { Setting2, Profile, Logout } from 'iconsax-react';

// types
interface TabPanelProps {
  children?: ReactNode;
  dir?: string;
  index: number;
  value: number;
}

// tab panel wrapper
function TabPanel({ children, value, index, ...other }: TabPanelProps) {
  return (
    <Box
      role="tabpanel"
      hidden={value !== index}
      id={`profile-tabpanel-${index}`}
      aria-labelledby={`profile-tab-${index}`}
      {...other}
      sx={{ p: 1 }}
    >
      {value === index && children}
    </Box>
  );
}

function a11yProps(index: number) {
  return {
    id: `profile-tab-${index}`,
    'aria-controls': `profile-tabpanel-${index}`
  };
}

const tabStyle = {
  display: 'flex',
  flexDirection: 'row',
  justifyContent: 'center',
  alignItems: 'center',
  textTransform: 'capitalize',
  gap: 1.25
};

// ==============================|| HEADER CONTENT - PROFILE ||============================== //

export default function ProfilePage() {
  const theme = useTheme();
  const navigate = useNavigate();

  const { logout, user } = useAuth();
  const handleLogout = async () => {
    try {
      await logout();
      navigate(`/login`, {
        state: {
          from: ''
        }
      });
    } catch (err) {
      console.error(err);
    }
  };

  const anchorRef = useRef<any>(null);
  const [open, setOpen] = useState(false);
  const handleToggle = () => {
    setOpen((prevOpen) => !prevOpen);
  };

  const handleClose = (event: MouseEvent | TouchEvent) => {
    if (anchorRef.current && anchorRef.current.contains(event.target)) {
      return;
    }
    setOpen(false);
  };

  const [value, setValue] = useState(0);

  const handleChange = (event: SyntheticEvent, newValue: number) => {
    setValue(newValue);
  };

  return (
    <Box sx={{ flexShrink: 0, ml: 0.75 }}>
      <ButtonBase
        sx={(theme) => ({
          p: 0.25,
          borderRadius: 1,
          '&:hover': { bgcolor: 'secondary.lighter', ...theme.applyStyles('dark', { bgcolor: 'secondary.light' }) },
          '&:focus-visible': {
            outline: `2px solid ${theme.palette.secondary.dark}`,
            outlineOffset: 2
          }
        })}
        aria-label="open profile"
        ref={anchorRef}
        aria-controls={open ? 'profile-grow' : undefined}
        aria-haspopup="true"
        onClick={handleToggle}
      >
        <AvatarWithInitials 
          alt="profile user" 
          src={user?.profileImage || avatar1}
          name={user?.name || 'Usuario'}
          size={32}
        />
      </ButtonBase>
      <Popper
        placement="bottom-end"
        open={open}
        anchorEl={anchorRef.current}
        role={undefined}
        transition
        disablePortal
        popperOptions={{ modifiers: [{ name: 'offset', options: { offset: [0, 9] } }] }}
      >
        {({ TransitionProps }) => (
          <Transitions type="grow" position="top-right" in={open} {...TransitionProps}>
            <Paper
              sx={(theme) => ({
                boxShadow: theme.customShadows.z1,
                width: 290,
                minWidth: 240,
                maxWidth: 290,
                [theme.breakpoints.down('md')]: { maxWidth: 250 },
                borderRadius: 1.5
              })}
            >
              <ClickAwayListener onClickAway={handleClose}>
                <MainCard border={false} content={false}>
                  <CardContent sx={{ px: 2.5, pt: 3 }}>
                    <Grid container sx={{ justifyContent: 'space-between', alignItems: 'center' }}>
                      <Grid>
                        <Stack direction="row" sx={{ gap: 1.25, alignItems: 'center' }}>
                          <AvatarWithInitials 
                            alt="profile user" 
                            src={user?.profileImage || avatar1}
                            name={user?.name || 'Usuario'}
                            size={40}
                          />
                          <Stack>
                            <Typography variant="subtitle1">{user?.name || 'Usuario'}</Typography>
                            <Typography variant="body2" color="secondary">
                              {user?.profile?.name || user?.role || 'Sin rol asignado'}
                            </Typography>
                          </Stack>
                        </Stack>
                      </Grid>
                      <Grid>
                        <Tooltip title="Cerrar Sesión">
                          <IconButton size="large" color="error" sx={{ p: 1 }} onClick={handleLogout}>
                            <Logout variant="Bulk" />
                          </IconButton>
                        </Tooltip>
                      </Grid>
                    </Grid>
                  </CardContent>

                  <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
                    <Tabs variant="fullWidth" value={value} onChange={handleChange} aria-label="profile tabs">
                      <Tab sx={tabStyle} icon={<Profile size={18} style={{ marginBottom: 0 }} />} label="Profile" {...a11yProps(0)} />
                    </Tabs>
                  </Box>
                  <TabPanel value={value} index={0} dir={theme.direction}>
                    <ProfileTab handleLogout={handleLogout} />
                  </TabPanel>
               
                </MainCard>
              </ClickAwayListener>
            </Paper>
          </Transitions>
        )}
      </Popper>
    </Box>
  );
}
