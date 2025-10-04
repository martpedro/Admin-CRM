// material-ui
import { useTheme } from '@mui/material/styles';

// project-imports
import newLogo from 'assets/images/regalos corporativos y promocionales.png';

// ==============================|| LOGO IMAGE ||============================== //

export default function LogoMain() {
  const theme = useTheme();

  return (
    <img 
      src={newLogo} 
      alt="Regalos Corporativos y Promocionales" 
      style={{ 
        width: 'auto',
        maxWidth: '200px'
      }} 
    />
  );
}
