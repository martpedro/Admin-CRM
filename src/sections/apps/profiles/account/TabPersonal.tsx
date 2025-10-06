import { useEffect, useState, ChangeEvent } from 'react';

// third-party
import { FormattedMessage, useIntl } from 'react-intl';

// material-ui
import Button from '@mui/material/Button';
import FormLabel from '@mui/material/FormLabel';
import Grid from '@mui/material/Grid2';
import InputLabel from '@mui/material/InputLabel';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import Alert from '@mui/material/Alert';
import CircularProgress from '@mui/material/CircularProgress';

// third-party
import { PatternFormat } from 'react-number-format';

// project-imports
import Avatar from 'components/@extended/Avatar';
import AvatarWithInitials from 'components/AvatarWithInitials';
import MainCard from 'components/MainCard';
import { GRID_COMMON_SPACING } from 'config';
import useAuth from 'hooks/useAuth';
import { getCurrentUserProfile, updateCurrentUserPersonal } from 'api/user';
import { openSnackbar } from 'api/snackbar';
import { generateInitialsAvatar } from 'utils/avatar-generator';

// assets
import defaultImages from 'assets/images/users/default.png';
import { Camera } from 'iconsax-react';

// types
interface UserPersonalData {
  name: string;
  lastName: string;
  email: string;
  phone: string;
  username: string;
}

// ==============================|| ACCOUNT PROFILE - PERSONAL ||============================== //

export default function TabPersonal() {
  const intl = useIntl();
  const { user } = useAuth();
  
  // Avatar state
  const [selectedImage, setSelectedImage] = useState<File | undefined>(undefined);
  const [avatar, setAvatar] = useState<string | undefined>(defaultImages);
  const [generatedAvatar, setGeneratedAvatar] = useState<string>('');

  // Form state
  const [formData, setFormData] = useState<UserPersonalData>({
    name: '',
    lastName: '',
    email: '',
    phone: '',
    username: ''
  });

  // UI state
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (selectedImage) {
      setAvatar(URL.createObjectURL(selectedImage));
    }
  }, [selectedImage]);

  // Generar avatar con iniciales si no hay imagen
  useEffect(() => {
    const generateDefaultAvatar = async () => {
      if (!avatar || avatar === defaultImages) {
        if (formData.name || formData.lastName) {
          try {
            const avatarDataURL = await generateInitialsAvatar(formData.name, formData.lastName, 76);
            setGeneratedAvatar(avatarDataURL);
            setAvatar(avatarDataURL);
          } catch (error) {
            console.error('Error generando avatar:', error);
          }
        }
      }
    };
    
    generateDefaultAvatar();
  }, [formData.name, formData.lastName, avatar]);

  // Load user data on component mount
  useEffect(() => {
    const loadUserData = async () => {
      if (!user) return;
      
      setLoading(true);
      try {
        const result = await getCurrentUserProfile();
        if (result.success && result.data) {
          const userData = result.data.user || result.data;
          
          // Split name and lastname if they're combined
          const fullName = userData.name || user.name || '';
          const nameParts = fullName.split(' ');
          const firstName = nameParts[0] || '';
          const lastName = nameParts.slice(1).join(' ') || '';
          
          setFormData({
            name: firstName,
            lastName: lastName,
            email: userData.email || user.email || '',
            phone: userData.phone || '',
            username: userData.email || user.email || ''
          });
        } else {
          // Use auth context data as fallback
          const fullName = user.name || '';
          const nameParts = fullName.split(' ');
          setFormData({
            name: nameParts[0] || '',
            lastName: nameParts.slice(1).join(' ') || '',
            email: user.email || '',
            phone: '',
            username: user.email || ''
          });
        }
      } catch (err) {
        console.error('Error loading user data:', err);
        setError(intl.formatMessage({ id: 'error-loading-user-data' }));
        // Use auth context data as fallback
        if (user) {
          const fullName = user.name || '';
          const nameParts = fullName.split(' ');
          setFormData({
            name: nameParts[0] || '',
            lastName: nameParts.slice(1).join(' ') || '',
            email: user.email || '',
            phone: '',
            username: user.email || ''
          });
        }
      } finally {
        setLoading(false);
      }
    };

    loadUserData();
  }, [user]);

  // Handle form field changes
  const handleFieldChange = (field: keyof UserPersonalData) => (
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const value = event.target.value;
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Handle form submission
  const handleSubmit = async () => {
    if (!user?.id) {
      setError(intl.formatMessage({ id: 'user-id-not-found' }));
      return;
    }

    setSaving(true);
    setError(null);
    
    try {
      const updatePayload = {
        name: formData.name,
        lastName: formData.lastName,
        email: formData.email,
        phone: formData.phone,
        username: formData.username
      };

      await updateCurrentUserPersonal(updatePayload, selectedImage);
      
      openSnackbar({
        action: false,
        open: true,
        message: 'Información personal actualizada exitosamente',
        anchorOrigin: {
          vertical: 'bottom',
          horizontal: 'right'
        },
        variant: 'alert',
        alert: {
          color: 'success',
          variant: 'filled'
        },
        transition: 'Fade',
        close: false,
        actionButton: false,
        dense: false,
        maxStack: 3,
        iconVariant: 'usedefault'
      });
    } catch (err: any) {
      console.error('Error updating personal information:', err);
      setError(err.message || 'Error updating personal information');
      openSnackbar({
        action: false,
        open: true,
        message: intl.formatMessage({ id: 'error-updating-personal-info' }),
        anchorOrigin: {
          vertical: 'bottom',
          horizontal: 'right'
        },
        variant: 'alert',
        alert: {
          color: 'error',
          variant: 'filled'
        },
        transition: 'Fade',
        close: false,
        actionButton: false,
        dense: false,
        maxStack: 3,
        iconVariant: 'usedefault'
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Grid container spacing={GRID_COMMON_SPACING}>
      {error && (
        <Grid size={12}>
          <Alert severity="error" onClose={() => setError(null)}>
            {error}
          </Alert>
        </Grid>
      )}
      
      <Grid size={{ xs: 12, sm: 8 }}>
        <MainCard title={<FormattedMessage id="personal-details" />}>
          <Grid container spacing={3}>
            <Grid size={12}>
              <Stack sx={{ gap: 2.5, alignItems: 'center', m: 3 }}>
                <FormLabel
                  htmlFor="change-avatar"
                  sx={{
                    position: 'relative',
                    borderRadius: '50%',
                    overflow: 'hidden',
                    '&:hover .MuiBox-root': { opacity: 1 },
                    cursor: 'pointer'
                  }}
                >
                  <AvatarWithInitials 
                    name={formData.name}
                    lastName={formData.lastName}
                    src={avatar}
                    size={76}
                    fallbackToInitials={true}
                  />
                  <Box
                    sx={(theme) => ({
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      bgcolor: 'rgba(0,0,0,.65)',
                      ...theme.applyStyles('dark', { bgcolor: 'rgba(255, 255, 255, .75)' }),
                      width: '100%',
                      height: '100%',
                      opacity: 0,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    })}
                  >
                    <Stack sx={{ gap: 0.5, alignItems: 'center', color: 'secondary.lighter' }}>
                      <Camera style={{ fontSize: '1.5rem' }} />
                      <Typography variant="caption"><FormattedMessage id="upload-avatar" /></Typography>
                    </Stack>
                  </Box>
                </FormLabel>
                <TextField
                  type="file"
                  id="change-avatar"
                  variant="outlined"
                  sx={{ display: 'none' }}
                  onChange={(e: ChangeEvent<HTMLInputElement>) => setSelectedImage(e.target.files?.[0])}
                  inputProps={{ accept: 'image/*' }}
                />
              </Stack>
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <Stack sx={{ gap: 1 }}>
                <InputLabel htmlFor="personal-first-name"><FormattedMessage id="first-name" /></InputLabel>
                <TextField 
                  fullWidth 
                  value={formData.name}
                  onChange={handleFieldChange('name')}
                  id="personal-first-name" 
                  placeholder={intl.formatMessage({ id: 'enter-first-name' })} 
                  autoFocus 
                />
              </Stack>
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <Stack sx={{ gap: 1 }}>
                <InputLabel htmlFor="personal-last-name"><FormattedMessage id="last-name" /></InputLabel>
                <TextField 
                  fullWidth 
                  value={formData.lastName}
                  onChange={handleFieldChange('lastName')}
                  id="personal-last-name" 
                  placeholder={intl.formatMessage({ id: 'enter-last-name' })} 
                />
              </Stack>
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <Stack sx={{ gap: 1 }}>
                <InputLabel htmlFor="personal-username"><FormattedMessage id="username" /></InputLabel>
                <TextField 
                  fullWidth 
                  value={formData.username}
                  onChange={handleFieldChange('username')}
                  id="personal-username" 
                  placeholder={intl.formatMessage({ id: 'enter-username' })} 
                />
              </Stack>
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <Stack sx={{ gap: 1 }}>
                <InputLabel htmlFor="personal-email"><FormattedMessage id="email" /></InputLabel>
                <TextField 
                  fullWidth 
                  value={formData.email}
                  onChange={handleFieldChange('email')}
                  id="personal-email" 
                  placeholder={intl.formatMessage({ id: 'enter-email' })}
                  type="email"
                />
              </Stack>
            </Grid>
            <Grid size={12}>
              <Stack sx={{ gap: 1 }}>
                <InputLabel htmlFor="personal-phone"><FormattedMessage id="phone" /></InputLabel>
                <PatternFormat
                  format="+52 (###) ###-####"
                  mask="_"
                  fullWidth
                  customInput={TextField}
                  placeholder={intl.formatMessage({ id: 'enter-phone' })}
                  value={formData.phone}
                  onValueChange={(values) => {
                    setFormData(prev => ({ ...prev, phone: values.value }));
                  }}
                  id="personal-phone"
                />
              </Stack>
            </Grid>
          </Grid>
        </MainCard>
      </Grid>
      
      <Grid size={12}>
        <Stack direction="row" sx={{ gap: 2, justifyContent: 'flex-end', alignItems: 'center' }}>
          <Button 
            variant="outlined" 
            color="secondary"
            disabled={saving}
            onClick={() => {
              // Reset form to original values
              if (user) {
                const fullName = user.name || '';
                const nameParts = fullName.split(' ');
                setFormData({
                  name: nameParts[0] || '',
                  lastName: nameParts.slice(1).join(' ') || '',
                  email: user.email || '',
                  phone: '',
                  username: user.email || ''
                });
              }
              setSelectedImage(undefined);
              setAvatar(defaultImages);
              setError(null);
            }}
          >
            Cancelar
          </Button>
          <Button 
            variant="contained"
            onClick={handleSubmit}
            disabled={saving}
            startIcon={saving ? <CircularProgress size={20} /> : null}
          >
            {saving ? <FormattedMessage id="loading" /> : <FormattedMessage id="update-profile" />}
          </Button>
        </Stack>
      </Grid>
    </Grid>
  );
}