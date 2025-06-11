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
import AlertCustomerDelete from './AlertCustomerDelete';
import IconButton from 'components/@extended/IconButton';
import CircularWithPath from 'components/@extended/progress/CircularWithPath';

import { insertCustomer, updateCustomer } from 'api/customer';
import { openSnackbar } from 'api/snackbar';
import { Gender } from 'config';
import { ImagePath, getImageUrl } from 'utils/getImageUrl';

// assets
import { Camera, CloseCircle, Trash } from 'iconsax-react';

// types
import { SnackbarProps } from 'types/snackbar';
import { CustomerList } from 'types/customer';
import { m } from 'framer-motion';

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
const getInitialValues = (customer: CustomerList | null) => {
  const newCustomer = {
    firstName: '',
    lastName: '',
    middleName: '',
    name: '',
    email: '',
    phone: '',
    age: 18,
    gender: Gender.FEMALE,
    supportSales: '',
    classCustomer: '',
    role: '',
    companyName: '',
    fatherName: '',
    orders: 0,
    progress: 50,
    status: 2,
    orderStatus: '',
    contact: '',
    about: '',
    skills: [],
    time: ['just now'],
    date: ''
  };

  if (customer) {
    return merge({}, newCustomer, customer);
  }

  return newCustomer;
};

const allStatus: StatusProps[] = [
  { value: 3, label: 'Rejected' },
  { value: 1, label: 'Verified' },
  { value: 2, label: 'Pending' }
];


const customerClassifications = [
  { value: 'A', label: 'Platino (más de $500,000 en ventas)' },
  { value: 'B', label: 'Oro (entre $250,000 y $500,000 en ventas)' },
  { value: 'C', label: 'Plata (entre $100,000 y $250,000 en ventas)' },
  { value: 'D', label: 'Bronce (entre $50,000 y $100,000 en ventas)' },
  { value: 'E', label: 'Regular (entre $10,000 y $50,000 en ventas)' },
  { value: 'F', label: 'Bajo (menos de $10,000 en ventas)' }
];

// ==============================|| CUSTOMER ADD / EDIT - FORM ||============================== //

export default function FormCustomerAdd({ customer, closeModal }: { customer: CustomerList | null; closeModal: () => void }) {
  const [loading, setLoading] = useState<boolean>(true);


  useEffect(() => {
    setLoading(false);
  }, []);

  const CustomerSchema = Yup.object().shape({
    firstName: Yup.string().max(255).required('First Name is required'),
    lastName: Yup.string().max(255).required('Last Name is required'),
    email: Yup.string().max(255).required('Email is required').email('Must be a valid email'),
    about: Yup.string().max(500)
  });

  const [openAlert, setOpenAlert] = useState(false);

  const handleAlertClose = () => {
    setOpenAlert(!openAlert);
    closeModal();
  };

  const formik = useFormik({
    initialValues: getInitialValues(customer!),
    validationSchema: CustomerSchema,
    enableReinitialize: true,
    onSubmit: async (values, { setSubmitting }) => {
      try {
        let newCustomer: CustomerList = values;
        newCustomer.name = newCustomer.firstName + ' ' + newCustomer.lastName;

        if (customer) {
          updateCustomer(newCustomer.id!, newCustomer).then(() => {
            openSnackbar({
              open: true,
              message: 'Customer update successfully.',
              variant: 'alert',
              alert: {
                color: 'success'
              }
            } as SnackbarProps);
            setSubmitting(false);
            closeModal();
          });
        } else {
          await insertCustomer(newCustomer).then(() => {
            openSnackbar({
              open: true,
              message: 'Customer added successfully.',
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
            <DialogTitle>{customer ? 'Editar Cliente' : 'Nuevo Cliente'}</DialogTitle>
            <Divider />
            <DialogContent sx={{ p: 2.5 }}>
              <Grid container spacing={3}>
                <Grid size={{  md: 1 }} >
                    </Grid>
                
                <Grid size={{ xs: 12, md: 10 }} >
                  <Grid container spacing={3}>
                    <Grid size={{ xs: 12, sm: 12 }}>
                      <Stack sx={{ gap: 1 }}>
                        <InputLabel htmlFor="customer-firstName">Nombre</InputLabel>
                        <TextField
                          fullWidth
                          id="customer-firstName"
                          placeholder="Ingrese el nombre"
                          {...getFieldProps('firstName')}
                          error={Boolean(touched.firstName && errors.firstName)}
                          helperText={touched.firstName && errors.firstName}
                        />
                      </Stack>
                    </Grid>
                    <Grid size={{ xs: 12, sm: 6 }}>
                      <Stack sx={{ gap: 1 }}>
                        <InputLabel htmlFor="customer-lastName">Apellido Paterno</InputLabel>
                        <TextField
                          fullWidth
                          id="customer-lastName"
                          placeholder="Ingrese el apellido"
                          {...getFieldProps('lastName')}
                          error={Boolean(touched.lastName && errors.lastName)}
                          helperText={touched.lastName && errors.lastName}
                        />
                      </Stack>
                    </Grid>
                    <Grid size={{ xs: 12, sm: 6 }}>
                      <Stack sx={{ gap: 1 }}>
                        <InputLabel htmlFor="customer-lastName">Apellido Materno</InputLabel>
                        <TextField
                          fullWidth
                          id="customer-lastName"
                          placeholder="Ingrese el apellido"
                          {...getFieldProps('lastName')}
                          error={Boolean(touched.lastName && errors.lastName)}
                          helperText={touched.lastName && errors.lastName}
                        />
                      </Stack>
                    </Grid>
                    <Grid size={6}>
                      <Stack sx={{ gap: 1 }}>
                        <InputLabel htmlFor="customer-email">Correo electrónico</InputLabel>
                        <TextField
                          fullWidth
                          id="customer-email"
                          placeholder="Ingrese el correo electrónico"
                          {...getFieldProps('email')}
                          error={Boolean(touched.email && errors.email)}
                          helperText={touched.email && errors.email}
                        />
                      </Stack>
                    </Grid>
                    <Grid size={6}>
                      <Stack sx={{ gap: 1 }}>
                        <InputLabel htmlFor="customer-phone">Numero de telefono</InputLabel>
                        <TextField
                          type="number"
                          fullWidth
                          id="customer-phone"
                          placeholder="Ingrese la edad"
                          {...getFieldProps('phone')}
                          error={Boolean(touched.phone && errors.phone)}
                          helperText={touched.phone && errors.phone}
                        />
                      </Stack>
                    </Grid>
                    <Grid size={{ xs: 12, sm: 6 }}>
                      <Stack sx={{ gap: 1 }}>
                        <InputLabel htmlFor="customer-companyName">Nombre de la empresa</InputLabel>
                        <TextField
                          fullWidth
                          id="customer-companyName"
                          placeholder="Ingrese el nombre del padre"
                          {...getFieldProps('companyName')}
                          error={Boolean(touched.companyName && errors.companyName)}
                          helperText={touched.companyName && errors.companyName}
                        />
                      </Stack>
                    </Grid>
                    <Grid size={{ xs: 12, sm: 6 }}>
                      <Stack sx={{ gap: 1 }}>
                        <InputLabel htmlFor="customer-classCustomer">Clasificación del cliente</InputLabel>
                        <FormControl fullWidth>
                          <Select
                            id="customer-classCustomer"
                            displayEmpty
                            {...getFieldProps('classCustomer')}
                            onChange={(event: SelectChangeEvent<string>) => setFieldValue('classCustomer', event.target.value as string)}
                            input={<OutlinedInput id="select-classCustomer" placeholder="Seleccionar clasificación" />}
                            renderValue={(selected) => {
                              if (!selected) {
                                return <Typography variant="subtitle1">Seleccionar clasificación</Typography>;
                              }
                              const selectedClass = customerClassifications.find((item) => item.value === selected);
                              return (
                                <Typography variant="subtitle2">
                                  {selectedClass ? selectedClass.label : selected}
                                </Typography>
                              );
                            }}
                          >
                            {customerClassifications.map((option) => (
                              <MenuItem key={option.value} value={option.value}>
                                <ListItemText primary={option.label} />
                              </MenuItem>
                            ))}
                          </Select>
                          {touched.classCustomer && errors.classCustomer && (
                            <FormHelperText error>
                              {errors.classCustomer}
                            </FormHelperText>
                          )}
                        </FormControl>
                      </Stack>
                    </Grid>
                    {/* <Grid size={{ xs: 12, sm: 6 }}>
                      <Stack sx={{ gap: 1 }}>
                        <InputLabel htmlFor="customer-gender">Género</InputLabel>
                        <RadioGroup row aria-label="payment-card" {...getFieldProps('gender')}>
                          <FormControlLabel control={<Radio value={Gender.FEMALE} />} label={Gender.FEMALE} />
                          <FormControlLabel control={<Radio value={Gender.MALE} />} label={Gender.MALE} />
                        </RadioGroup>
                      </Stack>
                    </Grid> */}
                    <Grid size={12}>
                      <Stack sx={{ gap: 1 }}>
                        <InputLabel htmlFor="customer-status">Asesor de ventas</InputLabel>
                        <FormControl fullWidth>
                          <Select
                            id="column-hiding"
                            displayEmpty
                            {...getFieldProps('status')}
                            onChange={(event: SelectChangeEvent<string>) => setFieldValue('status', event.target.value as string)}
                            input={<OutlinedInput id="select-column-hiding" placeholder="Ordenar por" />}
                            renderValue={(selected) => {
                              if (!selected) {
                                return <Typography variant="subtitle1">Seleccionar un asesor</Typography>;
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
                        {touched.status && errors.status && (
                          <FormHelperText error id="standard-weight-helper-text-email-login" sx={{ pl: 1.75 }}>
                            {errors.status}
                          </FormHelperText>
                        )}
                      </Stack>
                    </Grid>
                   
                    <Grid size={12}>
                      <Stack sx={{ gap: 1 }}>
                        <InputLabel htmlFor="customer-about">Acerca del cliente</InputLabel>
                        <TextField
                          fullWidth
                          id="customer-about"
                          multiline
                          rows={2}
                          placeholder="Ingrese información del cliente"
                          {...getFieldProps('about')}
                          error={Boolean(touched.about && errors.about)}
                          helperText={touched.about && errors.about}
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
                  {customer && (
                    <Tooltip title="Eliminar cliente" placement="top">
                      <IconButton onClick={() => setOpenAlert(true)} size="large" color="error">
                        <Trash variant="Bold" />
                      </IconButton>
                    </Tooltip>
                  )}
                </Grid>
                <Grid>
                  <Stack direction="row" sx={{ gap: 2, alignItems: 'center' }}>
                    <Button color="error" onClick={closeModal}>
                      Cancelar
                    </Button>
                    <Button type="submit" variant="contained" disabled={isSubmitting}>
                      {customer ? 'Editar' : 'Agregar'}
                    </Button>
                  </Stack>
                </Grid>
              </Grid>
            </DialogActions>
          </Form>
        </LocalizationProvider>
      </FormikProvider>
      {customer && <AlertCustomerDelete id={customer.id!} title={customer.name} open={openAlert} handleClose={handleAlertClose} />}
    </>
  );
}
