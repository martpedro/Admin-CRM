import Grid from '@mui/material/Grid2';
import Typography from '@mui/material/Typography';
import MainCard from 'components/MainCard';

export default function DashboardHome() {
  return (
    <Grid container spacing={3}>
      <Grid size={12}>
        <MainCard>
          <Typography variant="h4" gutterBottom>
            Bienvenido a la Plataforma de Administración
          </Typography>
          <Typography variant="body1" color="textSecondary">
            Selecciona una opción del menú para comenzar.
          </Typography>
        </MainCard>
      </Grid>
    </Grid>
  );
}
