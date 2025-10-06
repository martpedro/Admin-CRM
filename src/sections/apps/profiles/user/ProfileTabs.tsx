import { useEffect, useState, ChangeEvent, MouseEvent } from 'react';
import { Link } from 'react-router-dom';

// hooks
import useAuth from 'hooks/useAuth';

// material-ui
import Divider from '@mui/material/Divider';
import FormLabel from '@mui/material/FormLabel';
import Grid from '@mui/material/Grid2';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';

// project-imports
import ProfileTab from './ProfileTab';
import Avatar from 'components/@extended/Avatar';
import AvatarWithInitials from 'components/AvatarWithInitials';
import MoreIcon from 'components/@extended/MoreIcon';
import IconButton from 'components/@extended/IconButton';
import MainCard from 'components/MainCard';
import { facebookColor, linkedInColor } from 'config';
import { generateInitialsAvatar, getInitials } from 'utils/avatar-generator';

// assets
import { Apple, Camera, Facebook, Google } from 'iconsax-react';
import defaultImages from 'assets/images/users/default.png';

interface Props {
  focusInput: () => void;
}

// ==============================|| USER PROFILE - TABS ||============================== //

export default function ProfileTabs({ focusInput }: Props) {
  const { user } = useAuth();
  const [selectedImage, setSelectedImage] = useState<File | undefined>(undefined);
  const [avatar, setAvatar] = useState<string | undefined>(user?.avatar || defaultImages);
  const [generatedAvatar, setGeneratedAvatar] = useState<string>('');

  useEffect(() => {
    if (selectedImage) {
      setAvatar(URL.createObjectURL(selectedImage));
    }
  }, [selectedImage]);

  // Generar avatar con iniciales si no hay imagen de perfil
  useEffect(() => {
    const generateDefaultAvatar = async () => {
      if (!user?.avatar && user?.name) {
        const nameParts = user.name.split(' ');
        const firstName = nameParts[0] || '';
        const lastName = nameParts.slice(1).join(' ') || '';
        
        try {
          const avatarDataURL = await generateInitialsAvatar(firstName, lastName, 124);
          setGeneratedAvatar(avatarDataURL);
          setAvatar(avatarDataURL);
        } catch (error) {
          console.error('Error generando avatar:', error);
        }
      }
    };
    
    generateDefaultAvatar();
  }, [user?.name, user?.avatar]);

  const [anchorEl, setAnchorEl] = useState<Element | (() => Element) | null | undefined>(null);
  const open = Boolean(anchorEl);

  const handleClick = (event: MouseEvent<HTMLButtonElement> | undefined) => {
    setAnchorEl(event?.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  return (
    <MainCard>
      <Grid container spacing={6}>
        <Grid size={12}>
         
          <Stack sx={{ gap: 2.5, alignItems: 'center' }}>
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
                name={user?.name?.split(' ')[0] || ''}
                lastName={user?.name?.split(' ').slice(1).join(' ') || ''}
                src={avatar}
                size={124}
                sx={{ border: '1px dashed #ccc' }}
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
                  <Camera style={{ fontSize: '2rem' }} />
                  <Typography>Upload</Typography>
                </Stack>
              </Box>
            </FormLabel>
            <TextField
              type="file"
              id="change-avatar"
              placeholder="Outlined"
              variant="outlined"
              sx={{ display: 'none' }}
              onChange={(e: ChangeEvent<HTMLInputElement>) => setSelectedImage(e.target.files?.[0])}
            />
            <Stack sx={{ gap: 0.5, alignItems: 'center' }}>
              <Typography variant="h5">{user?.name || 'Usuario'}</Typography>
              <Typography color="secondary">{user?.role || 'Sin rol asignado'}</Typography>
            </Stack>
           
          </Stack>
        </Grid>
        
        <Grid size={12}>
          <ProfileTab />
        </Grid>
      </Grid>
    </MainCard>
  );
}
