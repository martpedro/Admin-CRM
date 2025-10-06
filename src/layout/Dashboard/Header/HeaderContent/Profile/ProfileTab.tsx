import { useState, MouseEvent, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router';

// material-ui
import List from '@mui/material/List';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';

// assets
import { Card, Edit2, Logout, Profile, Profile2User } from 'iconsax-react';

// ==============================|| HEADER PROFILE - PROFILE TAB ||============================== //

interface Props {
  handleLogout: () => void;
}

export default function ProfileTab({ handleLogout }: Props) {
  const navigate = useNavigate();
  const { pathname } = useLocation();

  const [selectedIndex, setSelectedIndex] = useState<number>();
  const handleListItemClick = (event: MouseEvent<HTMLDivElement>, index: number, route: string = '') => {
    setSelectedIndex(index);

    if (route && route !== '') {
      navigate(route);
    }
  };

  useEffect(() => {
    const pathToIndex: { [key: string]: number } = {
      '/profiles/user/personal': 0,
      '/profiles/account/basic': 1,
      '/profiles/account/personal': 2,
    };

    setSelectedIndex(pathToIndex[pathname] ?? undefined);
  }, [pathname]);

  return (
    <List component="nav" sx={{ p: 0, '& .MuiListItemIcon-root': { minWidth: 32 } }}>
      <ListItemButton
        selected={selectedIndex === 0}
        onClick={(event: MouseEvent<HTMLDivElement>) => handleListItemClick(event, 0, '/profiles/user/personal')}
      >
        <ListItemIcon>
          <Edit2 variant="Bulk" size={18} />
        </ListItemIcon>
        <ListItemText primary="Editar Perfil" />
      </ListItemButton>
      <ListItemButton
        selected={selectedIndex === 1}
        onClick={(event: MouseEvent<HTMLDivElement>) => handleListItemClick(event, 1, '/profiles/account/basic')}
      >
        <ListItemIcon>
          <Profile variant="Bulk" size={18} />
        </ListItemIcon>
        <ListItemText primary="Ver Perfil" />
      </ListItemButton>

      <ListItemButton selected={selectedIndex === 2} onClick={handleLogout}>
        <ListItemIcon>
          <Logout variant="Bulk" size={18} />
        </ListItemIcon>
        <ListItemText primary="Cerrar Sesión" />
      </ListItemButton>
    </List>
  );
}
