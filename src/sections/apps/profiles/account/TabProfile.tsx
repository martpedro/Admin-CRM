import { useEffect, useState } from 'react';

// material-ui
import { Theme } from '@mui/material/styles';
import useMediaQuery from '@mui/material/useMediaQuery';
import Chip from '@mui/material/Chip';
import Divider from '@mui/material/Divider';
import Grid from '@mui/material/Grid2';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemIcon from '@mui/material/ListItemIcon';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import CircularProgress from '@mui/material/CircularProgress';
import Box from '@mui/material/Box';
import Alert from '@mui/material/Alert';

// third-party
import { PatternFormat } from 'react-number-format';
import { FormattedMessage, useIntl } from 'react-intl';

// project-imports
import Avatar from 'components/@extended/Avatar';
import MainCard from 'components/MainCard';
import { GRID_COMMON_SPACING } from 'config';
import useAuth from 'hooks/useAuth';
import { getCurrentUserProfile } from 'api/user';

// assets
import { CallCalling, Sms } from 'iconsax-react';
import defaultImages from 'assets/images/users/default.png';

// types
interface UserProfileData {
  id: string;
  name: string;
  email: string;
  phone?: string;
  role?: string;
  avatar?: string;
}

// ==============================|| ACCOUNT PROFILE - BASIC ||============================== //

export default function TabProfile() {
  const intl = useIntl();
  const downMD = useMediaQuery((theme: Theme) => theme.breakpoints.down('md'));
  const { user } = useAuth();
  
  // State
  const [userProfile, setUserProfile] = useState<UserProfileData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load user profile data
  useEffect(() => {
    const loadUserProfile = async () => {
      if (!user) return;
      
      setLoading(true);
      try {
        const result = await getCurrentUserProfile();
        if (result.success && result.data) {
          const userData = result.data.user || result.data;
          setUserProfile({
            id: userData.id || user.id || '',
            name: userData.name || user.name || '',
            email: userData.email || user.email || '',
            phone: userData.phone || '',
            role: userData.role || 'User',
            avatar: userData.avatar || defaultImages
          });
        } else {
          // Use auth context data as fallback
          setUserProfile({
            id: user.id || '',
            name: user.name || '',
            email: user.email || '',
            phone: '',
            role: 'User',
            avatar: defaultImages
          });
        }
      } catch (err) {
        console.error('Error loading user profile:', err);
        setError(intl.formatMessage({ id: 'error-loading-profile' }));
        // Use auth context data as fallback
        if (user) {
          setUserProfile({
            id: user.id || '',
            name: user.name || '',
            email: user.email || '',
            phone: '',
            role: 'User',
            avatar: defaultImages
          });
        }
      } finally {
        setLoading(false);
      }
    };

    loadUserProfile();
  }, [user]);

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  if (!userProfile) {
    return (
      <Alert severity="error">
        <FormattedMessage id="no-profile-data" />
      </Alert>
    );
  }

  // Split name for display
  const nameParts = userProfile.name.split(' ');
  const firstName = nameParts[0] || '';
  const lastName = nameParts.slice(1).join(' ') || '';

  return (
    <Grid container spacing={GRID_COMMON_SPACING}>
      {error && (
        <Grid size={12}>
          <Alert severity="warning" onClose={() => setError(null)}>
            {error}
          </Alert>
        </Grid>
      )}

      <Grid size={{ xs: 12, sm: 5, md: 4, xl: 3 }}>
        <Grid container spacing={GRID_COMMON_SPACING}>
          <Grid size={12}>
            <MainCard>
              <Grid container spacing={3}>
                <Grid size={12}>
                  <Stack direction="row" sx={{ justifyContent: 'flex-end' }}>
                    <Chip label="Activo" size="small" color="success" />
                  </Stack>
                  <Stack sx={{ gap: 2.5, alignItems: 'center' }}>
                    <Avatar alt={userProfile.name} size="xl" src={userProfile.avatar} />
                    <Stack sx={{ gap: 0.5, alignItems: 'center' }}>
                      <Typography variant="h5">{userProfile.name}</Typography>
                      <Typography color="secondary">{userProfile.role}</Typography>
                    </Stack>
                  </Stack>
                </Grid>
                <Grid size={12}>
                  <Divider />
                </Grid>
                <Grid size={12}>
                  <List component="nav" aria-label="user contact info" sx={{ py: 0, '& .MuiListItem-root': { p: 0, py: 1 } }}>
                    <ListItem secondaryAction={<Typography align="right">{userProfile.email}</Typography>}>
                      <ListItemIcon>
                        <Sms size={18} />
                      </ListItemIcon>
                    </ListItem>
                    {userProfile.phone && (
                      <ListItem secondaryAction={
                        <Typography align="right">
                          <PatternFormat 
                            value={userProfile.phone} 
                            displayType="text" 
                            format="+52 (###) ###-####" 
                          />
                        </Typography>
                      }>
                        <ListItemIcon>
                          <CallCalling size={18} />
                        </ListItemIcon>
                      </ListItem>
                    )}
                  </List>
                </Grid>
              </Grid>
            </MainCard>
          </Grid>
        </Grid>
      </Grid>
      
      <Grid size={{ xs: 12, sm: 7, md: 8, xl: 9 }}>
        <Grid container spacing={GRID_COMMON_SPACING}>
          <Grid size={12}>
            <MainCard title={<FormattedMessage id="about-me" />}>
              <Typography color="secondary">
                <FormattedMessage id="welcome-profile" />
              </Typography>
            </MainCard>
          </Grid>
          <Grid size={12}>
            <MainCard title={<FormattedMessage id="personal-details" />}>
              <List sx={{ py: 0 }}>
                <ListItem divider={!downMD}>
                  <Grid container spacing={3} size={12}>
                    <Grid size={{ xs: 12, md: 6 }}>
                      <Stack sx={{ gap: 0.5 }}>
                        <Typography color="secondary"><FormattedMessage id="full-name" /></Typography>
                        <Typography>{userProfile.name}</Typography>
                      </Stack>
                    </Grid>
                    <Grid size={{ xs: 12, md: 6 }}>
                      <Stack sx={{ gap: 0.5 }}>
                        <Typography color="secondary"><FormattedMessage id="profile-name-field" /></Typography>
                        <Typography>{firstName}</Typography>
                      </Stack>
                    </Grid>
                  </Grid>
                </ListItem>
                <ListItem divider={!downMD}>
                  <Grid container spacing={3} size={12}>
                    <Grid size={{ xs: 12, md: 6 }}>
                      <Stack sx={{ gap: 0.5 }}>
                        <Typography color="secondary"><FormattedMessage id="profile-lastname-field" /></Typography>
                        <Typography>{lastName || '-'}</Typography>
                      </Stack>
                    </Grid>
                    <Grid size={{ xs: 12, md: 6 }}>
                      <Stack sx={{ gap: 0.5 }}>
                        <Typography color="secondary">ID de Usuario</Typography>
                        <Typography>{userProfile.id}</Typography>
                      </Stack>
                    </Grid>
                  </Grid>
                </ListItem>
                <ListItem divider={!downMD}>
                  <Grid container spacing={3} size={12}>
                    <Grid size={{ xs: 12, md: 6 }}>
                      <Stack sx={{ gap: 0.5 }}>
                        <Typography color="secondary">Correo Electrónico</Typography>
                        <Typography>{userProfile.email}</Typography>
                      </Stack>
                    </Grid>
                    <Grid size={{ xs: 12, md: 6 }}>
                      <Stack sx={{ gap: 0.5 }}>
                        <Typography color="secondary">Teléfono</Typography>
                        <Typography>
                          {userProfile.phone ? (
                            <PatternFormat 
                              value={userProfile.phone} 
                              displayType="text" 
                              format="+52 (###) ###-####" 
                            />
                          ) : '-'}
                        </Typography>
                      </Stack>
                    </Grid>
                  </Grid>
                </ListItem>
                <ListItem>
                  <Stack sx={{ gap: 0.5 }}>
                    <Typography color="secondary">Rol</Typography>
                    <Typography>{userProfile.role}</Typography>
                  </Stack>
                </ListItem>
              </List>
            </MainCard>
          </Grid>
          <Grid size={12}>
            <MainCard title={<FormattedMessage id="account-information" />}>
              <List sx={{ py: 0 }}>
                <ListItem divider>
                  <Grid container spacing={{ xs: 0.5, md: 3 }} size={12}>
                    <Grid size={{ xs: 12, md: 6 }}>
                      <Stack sx={{ gap: 0.5 }}>
                        <Typography color="secondary">Estado de la Cuenta</Typography>
                        <Chip label="Activo" size="small" color="success" />
                      </Stack>
                    </Grid>
                    <Grid size={{ xs: 12, md: 6 }}>
                      <Stack sx={{ gap: 0.5 }}>
                        <Typography color="secondary">Tipo de Cuenta</Typography>
                        <Typography><FormattedMessage id="user-standard" /></Typography>
                      </Stack>
                    </Grid>
                  </Grid>
                </ListItem>
                <ListItem>
                  <Grid container spacing={{ xs: 0.5, md: 3 }} size={12}>
                    <Grid size={{ xs: 12, md: 6 }}>
                      <Stack sx={{ gap: 0.5 }}>
                        <Typography color="secondary">Miembro Desde</Typography>
                        <Typography>Sesión Actual</Typography>
                      </Stack>
                    </Grid>
                    <Grid size={{ xs: 12, md: 6 }}>
                      <Stack sx={{ gap: 0.5 }}>
                        <Typography color="secondary">Último Acceso</Typography>
                        <Typography>Ahora</Typography>
                      </Stack>
                    </Grid>
                  </Grid>
                </ListItem>
              </List>
            </MainCard>
          </Grid>
        </Grid>
      </Grid>
    </Grid>
  );
}