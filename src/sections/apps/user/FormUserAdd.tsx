import { useEffect, useState, ChangeEvent } from 'react';

// material-ui
import Autocomplete from '@mui/material/Autocomplete';
import Button from '@mui/material/Button';
import Chip from '@mui/material/Chip';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import Divider from '@mui/material/Divider';
import FormControl from '@mui/material/FormControl';
import FormControlLabel from '@mui/material/FormControlLabel';
import FormHelperText from '@mui/material/FormHelperText';
import FormLabel from '@mui/material/FormLabel';
import Grid from '@mui/material/Grid2';
import InputLabel from '@mui/material/InputLabel';
import ListItemText from '@mui/material/ListItemText';
import MenuItem from '@mui/material/MenuItem';
import OutlinedInput from '@mui/material/OutlinedInput';
import Radio from '@mui/material/Radio';
import RadioGroup from '@mui/material/RadioGroup';
import Select, { SelectChangeEvent } from '@mui/material/Select';
import Stack from '@mui/material/Stack';
import Switch from '@mui/material/Switch';
import TextField from '@mui/material/TextField';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';

import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFnsV3';

// third-party
import { merge } from 'lodash-es';
import * as Yup from 'yup';
import { useFormik, Form, FormikProvider } from 'formik';

// project-imports
import AlertUserDelete from './AlertUserDelete';
import Avatar from 'components/@extended/Avatar';
import IconButton from 'components/@extended/IconButton';
import CircularWithPath from 'components/@extended/progress/CircularWithPath';

import { insertUser, updateUser } from 'api/user';
import { openSnackbar } from 'api/snackbar';
import { Gender } from 'config';
import { ImagePath, getImageUrl } from 'utils/getImageUrl';

// assets
import { Camera, CloseCircle, Trash } from 'iconsax-react';

// types
import { SnackbarProps } from 'types/snackbar';
import { CustomerList } from 'types/customer';

interface StatusProps {
  value: number;
  label: string;
}

const skills = [
  'Adobe XD',
  'After Effect',
  'Angular',
  'Animation',
  'ASP.Net',
  'Bootstrap',
  'C#',
  'CC',
  'Corel Draw',
  'CSS',
  'DIV',
  'Dreamweaver',
  'Figma',
  'Graphics',
  'HTML',
  'Illustrator',
  'J2Ee',
  'Java',
  'Javascript',
  'JQuery',
  'Logo Design',
  'Material UI',
  'Motion',
  'MVC',
  'MySQL',
  'NodeJS',
  'npm',
  'Photoshop',
  'PHP',
  'React',
  'Redux',
  'Reduxjs & tooltit',
  'SASS',
  'SCSS',
  'SQL Server',
  'SVG',
  'UI/UX',
  'User Interface Designing',
  'Wordpress'
];

// CONSTANT
const getInitialValues = (user: CustomerList | null) => {
  const newUser = {
    firstName: '',
    lastName: '',
    middleName: '',
    name: '',
    email: '',
    age: 18,
    avatar: 1,
    gender: Gender.FEMALE,
    role: '',
    fatherName: '',
    orders: 0,
    progress: 50,
    status: 2,
    letterasigned: '',
    orderStatus: '',
    contact: '',
    country: '',
    location: '',
    isInactive: false,
    about: '',
    skills: [],
    time: ['just now'],
    date: ''
  };

  if (user) {
    return merge({}, newUser, user);
  }

  return newUser;
};

const allStatus: StatusProps[] = [
  { value: 3, label: 'Rejected' },
  { value: 1, label: 'Verified' },
  { value: 2, label: 'Pending' }
];

// ==============================|| CUSTOMER ADD / EDIT - FORM ||============================== //

export default function FormUserAdd({ user, closeModal }: { user: CustomerList | null; closeModal: () => void }) {
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedImage, setSelectedImage] = useState<File | undefined>(undefined);
  const [avatar, setAvatar] = useState<string | undefined>(
    getImageUrl(`avatar-${user && user !== null && user?.avatar ? user.avatar : 1}.png`, ImagePath.USERS)
  );

  useEffect(() => {
    if (selectedImage) {
      setAvatar(URL.createObjectURL(selectedImage));
    }
  }, [selectedImage]);

  useEffect(() => {
    setLoading(false);
  }, []);

  const CustomerSchema = Yup.object().shape({
    firstName: Yup.string().max(255).required('El nombre es obligatorio'),
    lastName: Yup.string().max(255).required('El apellido es obligatorio'),
    middleName: Yup.string().max(255, 'El apellido no debe exceder los 255 caracteres'),
    email: Yup.string().max(255).required('El correo electrónico es obligatorio').email('Debe ser un correo electrónico válido'),
    status: Yup.string().required('El estado es obligatorio'),
    location: Yup.string().max(500, 'La ubicación no debe exceder los 500 caracteres'),
    about: Yup.string().max(500, 'La información no debe exceder los 500 caracteres')
  });

  const [openAlert, setOpenAlert] = useState(false);

  const handleAlertClose = () => {
    setOpenAlert(!openAlert);
    closeModal();
  };

  const formik = useFormik({
    initialValues: getInitialValues(user!),
    validationSchema: CustomerSchema,
    enableReinitialize: true,
    onSubmit: async (values, { setSubmitting }) => {
      try {
        let newUser: CustomerList = values;
        newUser.name = newUser.firstName + ' ' + newUser.lastName;

        if (user) {
          updateUser(newUser.id!, newUser).then(() => {
            console.log('newUser update', newUser);

            openSnackbar({
              open: true,
              message: 'Cliente actualizado exitosamente.',
              variant: 'alert',
              alert: {
                color: 'success'
              }
            } as SnackbarProps);
            setSubmitting(false);
            closeModal();
          });
        } else {
          console.log('newUser insert', newUser);
          await insertUser(newUser).then(() => {

            openSnackbar({
              open: true,
              message: 'Cliente agregado exitosamente.',
              variant: 'alert',
              alert: {
                color: 'success'
              }
            } as SnackbarProps);
            setSubmitting(false);
            closeModal();
          });
        }
      } catch {}
    }
  });

  const { errors, touched, handleSubmit, isSubmitting, getFieldProps, setFieldValue } = formik;

  if (loading)
    return (
      <Box sx={{ p: 5 }}>
        <Stack direction="row" sx={{ justifyContent: 'center' }}>
          <CircularWithPath />
        </Stack>
      </Box>
    );

  return (
    <>
      <FormikProvider value={formik}>
        <LocalizationProvider dateAdapter={AdapterDateFns}>
          <Form autoComplete="off" noValidate onSubmit={handleSubmit}>
            <DialogTitle>{user ? 'Editar Cliente' : 'Nuevo Cliente'}</DialogTitle>
            <Divider />
            <DialogContent sx={{ p: 2.5 }}>
              <Grid container spacing={3}>
                <Grid size={{ xs: 12, md: 3 }}>
                  <Stack direction="row" sx={{ justifyContent: 'center', mt: 3 }}>
                    <FormLabel
                      htmlFor="change-avtar"
                      sx={{
                        position: 'relative',
                        borderRadius: '50%',
                        overflow: 'hidden',
                        '&:hover .MuiBox-root': { opacity: 1 },
                        cursor: 'pointer'
                      }}
                    >
                      <Avatar alt="Avatar 1" src={avatar} sx={{ width: 72, height: 72, border: '1px dashed' }} />
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
                          <Typography>Subir</Typography>
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
                  </Stack>
                </Grid>
                <Grid size={{ xs: 12, md: 8 }}>
                  <Grid container spacing={3}>
                    <Grid size={{ xs: 12, sm: 12 }}>
                      <Stack sx={{ gap: 1 }}>
                        <InputLabel htmlFor="user-firstName">Nombre</InputLabel>
                        <TextField
                          fullWidth
                          id="user-firstName"
                          placeholder="Ingrese el nombre"
                          {...getFieldProps('firstName')}
                          error={Boolean(touched.firstName && errors.firstName)}
                          helperText={touched.firstName && errors.firstName}
                        />
                      </Stack>
                    </Grid>
                    <Grid size={{ xs: 12, sm: 6 }}>
                      <Stack sx={{ gap: 1 }}>
                        <InputLabel htmlFor="user-lastName">Apellido Paterno</InputLabel>
                        <TextField
                          fullWidth
                          id="user-lastName"
                          placeholder="Ingrese el apellido"
                          {...getFieldProps('lastName')}
                          error={Boolean(touched.lastName && errors.lastName)}
                          helperText={touched.lastName && errors.lastName}
                        />
                      </Stack>
                    </Grid>
                    
                    <Grid size={{ xs: 12, sm: 6 }}>
                      <Stack sx={{ gap: 1 }}>
                        <InputLabel htmlFor="user-middleName">Apellido Materno</InputLabel>
                        <TextField
                          fullWidth
                          id="user-middleName"
                          placeholder="Ingrese el apellido"
                          {...getFieldProps('middleName')}
                          error={Boolean(touched.middleName && errors.middleName)}
                          helperText={touched.middleName && errors.middleName}
                        />
                      </Stack>
                    </Grid>
                    <Grid size={12}>
                      <Stack sx={{ gap: 1 }}>
                        <InputLabel htmlFor="user-email">Correo electrónico</InputLabel>
                        <TextField
                          fullWidth
                          id="user-email"
                          placeholder="Ingrese el correo electrónico"
                          {...getFieldProps('email')}
                          error={Boolean(touched.email && errors.email)}
                          helperText={touched.email && errors.email}
                        />
                      </Stack>
                    </Grid>
                    
                   
                    <Grid size={{ xs: 12, sm: 6 }}>
                      <Stack sx={{ gap: 1 }}>
                        <InputLabel htmlFor="user-letterasigned">Letra de Cotización</InputLabel>
                        <TextField
                          fullWidth
                          id="user-letterasigned"
                          placeholder="Ingrese la letra de cotización"
                          {...getFieldProps('letterasigned')}
                          inputProps={{
                            style: { textTransform: 'uppercase' }
                          }}
                          onChange={(e: ChangeEvent<HTMLInputElement>) => {
                            const upperValue = e.target.value.toUpperCase();
                            setFieldValue('letterasigned', upperValue);
                          }}
                          value={formik.values.letterasigned}
                          error={Boolean(touched.letterasigned && errors.letterasigned)}
                          helperText={touched.letterasigned && errors.letterasigned}
                        />
                      </Stack>
                    </Grid>
                    {/* <Grid size={{ xs: 12, sm: 6 }}>
                      <Stack sx={{ gap: 1 }}>
                        <InputLabel htmlFor="user-gender">Género</InputLabel>
                        <RadioGroup row aria-label="payment-card" {...getFieldProps('gender')}>
                          <FormControlLabel control={<Radio value={Gender.FEMALE} />} label={Gender.FEMALE} />
                          <FormControlLabel control={<Radio value={Gender.MALE} />} label={Gender.MALE} />
                        </RadioGroup>
                      </Stack>
                    </Grid> */}
                    <Grid size={6}>
                      <Stack sx={{ gap: 1 }}>
                        <InputLabel htmlFor="user-role">Rol</InputLabel>
                        <FormControl fullWidth>
                          <Select
                            id="column-hiding"
                            displayEmpty
                            {...getFieldProps('role')}
                            onChange={(event: SelectChangeEvent<string>) => setFieldValue('role', event.target.value as string)}
                            input={<OutlinedInput id="select-column-hiding" placeholder="Ordenar por" />}
                            renderValue={(selected) => {
                              if (!selected) {
                                return <Typography variant="subtitle1">Seleccionar Rol</Typography>;
                              }

                              const selectedStatus = allStatus.filter((item) => item.value === Number(selected));
                              return (
                                <Typography variant="subtitle2">
                                  {selectedStatus.length > 0 ? selectedStatus[0].label : 'Pendiente'}
                                </Typography>
                              );
                            }}
                          >
                            {allStatus.map((column: StatusProps) => (
                              <MenuItem key={column.value} value={column.value}>
                                <ListItemText primary={column.label} />
                              </MenuItem>
                            ))}
                          </Select>
                        </FormControl>
                        {touched.role && errors.role && (
                          <FormHelperText error id="standard-weight-helper-text-email-login" sx={{ pl: 1.75 }}>
                            {errors.role}
                          </FormHelperText>
                        )}
                      </Stack>
                    </Grid>
                    {/* <Grid size={{ xs: 12, sm: 6 }}>
                      <Stack sx={{ gap: 1 }}>
                        <InputLabel htmlFor="user-contact">Contacto</InputLabel>
                        <TextField
                          fullWidth
                          id="user-contact"
                          placeholder="Ingrese el contacto"
                          {...getFieldProps('contact')}
                          error={Boolean(touched.contact && errors.contact)}
                          helperText={touched.contact && errors.contact}
                        />
                      </Stack>
                    </Grid> */}
                    {/* <Grid size={{ xs: 12, sm: 6 }}>
                      <Stack sx={{ gap: 1 }}>
                        <InputLabel htmlFor="user-country">País</InputLabel>
                        <TextField
                          fullWidth
                          id="user-country"
                          placeholder="Ingrese el país"
                          {...getFieldProps('country')}
                          error={Boolean(touched.country && errors.country)}
                          helperText={touched.country && errors.country}
                        />
                      </Stack>
                    </Grid> */}
                    {/* <Grid size={12}>
                      <Stack sx={{ gap: 1 }}>
                        <InputLabel htmlFor="user-location">Ubicación</InputLabel>
                        <TextField
                          fullWidth
                          id="user-location"
                          multiline
                          rows={2}
                          placeholder="Ingrese la ubicación"
                          {...getFieldProps('location')}
                          error={Boolean(touched.location && errors.location)}
                          helperText={touched.location && errors.location}
                        />
                      </Stack>
                    </Grid> */}
                    {/* <Grid size={12}>
                      <Stack sx={{ gap: 1 }}>
                        <InputLabel htmlFor="user-about">Acerca del cliente</InputLabel>
                        <TextField
                          fullWidth
                          id="user-about"
                          multiline
                          rows={2}
                          placeholder="Ingrese información del cliente"
                          {...getFieldProps('about')}
                          error={Boolean(touched.about && errors.about)}
                          helperText={touched.about && errors.about}
                        />
                      </Stack>
                    </Grid> */}
                    <Grid size={12}>
                      <Stack sx={{ gap: 1 }}>
                        <InputLabel htmlFor="user-skills">Subsidiarias</InputLabel>
                        <Autocomplete
                          multiple
                          fullWidth
                          id="user-skills"
                          options={skills}
                          {...getFieldProps('skills')}
                          getOptionLabel={(label) => label}
                          onChange={(event, newValue) => {
                            setFieldValue('skills', newValue);
                          }}
                          renderInput={(params) => <TextField {...params} name="skill" placeholder="Agregar habilidades" />}
                          renderTags={(value, getTagProps) =>
                            value.map((option, index) => (
                              <Chip
                                {...getTagProps({ index })}
                                variant="combined"
                                key={index}
                                label={option}
                                deleteIcon={<CloseCircle style={{ fontSize: '0.75rem' }} />}
                                sx={{ color: 'text.primary' }}
                              />
                            ))
                          }
                        />
                      </Stack>
                    </Grid>
                    <Grid size={12}>
                        <Stack direction="row" sx={{ justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <Stack sx={{ gap: 0.5 }}>
                          <Typography variant="subtitle1">Esta Inactivo</Typography>
                          <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                          Significa que no podra acceder al sistema
                          </Typography>
                        </Stack>
                        <FormControlLabel
                          control={
                          <Switch
                            checked={formik.values.isInactive}
                            onChange={(e: ChangeEvent<HTMLInputElement>) => setFieldValue('isInactive', e.target.checked)}
                            sx={{ mt: 0 }}
                          />
                          }
                          label=""
                          labelPlacement="start"
                        />
                        </Stack>
                    </Grid>
                  </Grid>
                </Grid>
              </Grid>
            </DialogContent>
            <Divider />
            <DialogActions sx={{ p: 2.5 }}>
              <Grid container sx={{ justifyContent: 'space-between', alignItems: 'center', width: 1 }}>
                <Grid>
                  {user && (
                    <Tooltip title="Delete User" placement="top">
                      <IconButton onClick={() => setOpenAlert(true)} size="large" color="error">
                        <Trash variant="Bold" />
                      </IconButton>
                    </Tooltip>
                  )}
                </Grid>
                <Grid>
                  <Stack direction="row" sx={{ gap: 2, alignItems: 'center' }}>
                    <Button color="error" onClick={closeModal}>
                      Cancel
                    </Button>
                    <Button type="submit" variant="contained" disabled={isSubmitting}>
                      {user ? 'Edit' : 'Add'}
                    </Button>
                  </Stack>
                </Grid>
              </Grid>
            </DialogActions>
          </Form>
        </LocalizationProvider>
      </FormikProvider>
      {user && <AlertUserDelete id={user.id!} title={user.name} open={openAlert} handleClose={handleAlertClose} />}
    </>
  );
}
