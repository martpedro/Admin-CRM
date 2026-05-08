import { useEffect, useMemo, useState } from 'react';
import usePermissions from 'hooks/usePermissions';

// material-ui
import Button from '@mui/material/Button';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import Divider from '@mui/material/Divider';
import FormControl from '@mui/material/FormControl';
import FormHelperText from '@mui/material/FormHelperText';
import Grid from '@mui/material/Grid2';
import InputLabel from '@mui/material/InputLabel';
import ListItemText from '@mui/material/ListItemText';
import MenuItem from '@mui/material/MenuItem';
import OutlinedInput from '@mui/material/OutlinedInput';
import Select, { SelectChangeEvent } from '@mui/material/Select';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';

import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFnsV3';

import * as Yup from 'yup';
import { useFormik, Form, FormikProvider } from 'formik';

// project-imports
import AlertCustomerDelete from './AlertCustomerDelete';
import IconButton from 'components/@extended/IconButton';
import CircularWithPath from 'components/@extended/progress/CircularWithPath';
import CustomerDuplicationAlert from './CustomerDuplicationAlert';

import { insertCustomer, updateCustomer, validateCustomerDuplication } from 'api/customer';
import { getSalesAdvisors } from 'api/user';
import { openSnackbar } from 'api/snackbar';
import useAuth from 'hooks/useAuth';

// assets
import { Trash } from 'iconsax-react';

// types
import { SnackbarProps } from 'types/snackbar';
import { CustomerList } from 'types/customer';

// CONSTANT
const getInitialValues = (customer: CustomerList | null, currentUserId?: number) => {
  const newCustomer = {
    firstName: '',
    lastName: '',
    middleName: '',
    name: '',
    email: '',
    phone: '',
    supportSales: currentUserId ? currentUserId.toString() : '',
    classCustomer: '',
    companyName: '',
    status: 2,
    contact: '',
    about: '',
  };

  if (customer) {
    return {
      firstName: customer.FirstName || customer.firstName || '',
      lastName: customer.LastName || customer.lastName || '',
      middleName: customer.MiddleName || customer.middleName || '',
      name: customer.Name || customer.name || '',
      email: customer.Email || customer.email || '',
      phone: customer.Phone || customer.phone || '',
      supportSales: customer.SupportSales?.Id?.toString() || customer.supportSales || '',
      classCustomer: customer.ClassCustomer || customer.classCustomer || '',
      companyName: customer.CompanyName || customer.companyName || '',
      status: customer.Status ?? customer.status ?? 2,
      contact: customer.Contact || customer.contact || '',
      about: customer.About || customer.about || '',
    };
  }

  return newCustomer;
};

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
  type DuplicationValidationState = {
    hasEmailDuplication: boolean;
    hasDomainDuplication: boolean;
    canProceed: boolean;
    message?: string;
    requiresDuplicatePermission?: boolean;
    details?: {
      emailDuplication?: {
        customer: {
          id: number;
          name: string;
          email: string;
          assignedTo?: {
            id: number;
            name: string;
            email: string;
          } | null;
        };
      } | null;
      domainDuplication?: {
        domain: string;
        count: number;
        examples: Array<{
          id: number;
          name: string;
          email: string;
          assignedTo?: {
            id: number;
            name: string;
            email: string;
          } | null;
        }>;
      } | null;
    };
  };

  const { canCreate, canUpdate, canDelete } = usePermissions();
  const [loading, setLoading] = useState<boolean>(true);
  const [salesAdvisors, setSalesAdvisors] = useState<Array<{value: number, label: string, profile: string}>>([]);
  const [loadingAdvisors, setLoadingAdvisors] = useState<boolean>(false);
  const [duplicationValidation, setDuplicationValidation] = useState<DuplicationValidationState | null>(null);
  const [pendingCustomer, setPendingCustomer] = useState<CustomerList | null>(null);
  const [isProceedingWithDuplicateDomain, setIsProceedingWithDuplicateDomain] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    setLoading(false);
    loadSalesAdvisors();
  }, []);

  const loadSalesAdvisors = async () => {
    setLoadingAdvisors(true);
    try {
      const result = await getSalesAdvisors();
      if (result.success && result.data) {
        setSalesAdvisors(result.data);
      } else {
        openSnackbar({
          open: true,
          message: result.error || 'Error al cargar asesores de ventas',
          variant: 'alert',
          alert: {
            color: 'error'
          }
        } as SnackbarProps);
      }
    } catch (error) {
      console.error('Error loading sales advisors:', error);
    } finally {
      setLoadingAdvisors(false);
    }
  };

  const CustomerSchema = Yup.object().shape({
    firstName: Yup.string().max(255).required('El nombre es requerido'),
    lastName: Yup.string().max(255).required('El apellido paterno es requerido'),
    middleName: Yup.string().max(255),
    email: Yup.string().max(255).required('El correo electrónico es requerido').email('Debe ser un correo electrónico válido'),
    phone: Yup.string().matches(/^[0-9+\-\s()]*$/, 'El teléfono debe contener solo números y caracteres válidos'),
    companyName: Yup.string().max(255),
    classCustomer: Yup.string().required('La clasificación del cliente es requerida'),
    supportSales: Yup.string().required('El asesor de ventas es requerido'),
    about: Yup.string().max(500, 'La descripción no puede exceder 500 caracteres')
  });

  const [openAlert, setOpenAlert] = useState(false);

  const handleAlertClose = () => {
    setOpenAlert(!openAlert);
    closeModal();
  };

  const clearDuplicationValidation = () => {
    setDuplicationValidation(null);
    setPendingCustomer(null);
    setIsProceedingWithDuplicateDomain(false);
  };

  const formik = useFormik({
    initialValues: getInitialValues(customer!, user?.id ? (typeof user.id === 'string' ? parseInt(user.id) : user.id) : undefined),
    validationSchema: CustomerSchema,
    enableReinitialize: true,
    onSubmit: async (values, { setSubmitting }) => {
      try {
        // Mapear los valores del formulario al tipo CustomerList
        let newCustomer: CustomerList = {
          FirstName: values.firstName,
          LastName: values.lastName,
          MiddleName: values.middleName,
          Name: values.firstName + ' ' + values.lastName,
          Email: values.email,
          Phone: values.phone,
          ClassCustomer: values.classCustomer,
          CompanyName: values.companyName,
          Status: values.status,
          Contact: values.contact, 
          About: values.about,
          SupportSales: values.supportSales ? { Id: Number(values.supportSales) } : undefined
        };
        
        // Si estamos editando, mantener el ID
        if (customer?.Id) {
          newCustomer.Id = customer.Id;
        }
        
        console.log("Datos new customer", newCustomer);

        if (customer) {
          // Actualizar cliente existente
          const result = await updateCustomer(newCustomer.Id!, newCustomer);
          
          if (result.success) {
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
          } else {
            openSnackbar({
              open: true,
              message: result.error || 'Error al actualizar el cliente.',
              variant: 'alert',
              alert: {
                color: 'error'
              }
            } as SnackbarProps);
            setSubmitting(false);
          }
        } else {
          // Crear nuevo cliente
          const validationResult = await validateCustomerDuplication(
            newCustomer.Email,
            newCustomer.Id,
            newCustomer.SupportSales?.Id
          );

          if (validationResult.success && validationResult.data) {
            const validationData = validationResult.data as DuplicationValidationState;

            if (validationData.hasEmailDuplication || validationData.hasDomainDuplication) {
              setDuplicationValidation(validationData);
              setPendingCustomer(newCustomer);
              setSubmitting(false);
              return;
            }
          }

          await handleCreateCustomer(newCustomer);
          setSubmitting(false);
        }
      } catch (error) {
        console.error('Error inesperado:', error);
        openSnackbar({
          open: true,
          message: 'Error inesperado. Por favor intente nuevamente.',
          variant: 'alert',
          alert: {
            color: 'error'
          }
        } as SnackbarProps);
        setSubmitting(false);
      }
    }
  });

  async function handleCreateCustomer(newCustomer: CustomerList) {
    try {
      setIsProceedingWithDuplicateDomain(true);

      const result = await insertCustomer(newCustomer);

      if (result.success) {
        clearDuplicationValidation();

        if (!result.warning) {
          openSnackbar({
            open: true,
            message: 'Cliente creado exitosamente.',
            variant: 'alert',
            alert: {
              color: 'success'
            }
          } as SnackbarProps);
        }

        closeModal();
      } else {
        openSnackbar({
          open: true,
          message: result.error || 'Error al crear el cliente.',
          variant: 'alert',
          alert: {
            color: 'error'
          }
        } as SnackbarProps);
      }
    } finally {
      setIsProceedingWithDuplicateDomain(false);
    }
  }

  const handleProceedWithDuplicateDomain = async () => {
    if (!pendingCustomer) {
      return;
    }

    await handleCreateCustomer(pendingCustomer);
  };

  const { errors, touched, handleSubmit, isSubmitting, getFieldProps, setFieldValue } = formik;
  const safeSupportSalesValue = useMemo(() => {
    const value = String(formik.values.supportSales ?? '');
    if (!value) {
      return '';
    }

    const existsInOptions = salesAdvisors.some((advisor) => String(advisor.value) === value);
    return existsInOptions ? value : '';
  }, [formik.values.supportSales, salesAdvisors]);

  // useEffect para establecer el usuario logueado como default cuando se cargan los asesores
  useEffect(() => {
    if (!customer && user?.id && salesAdvisors.length > 0 && !loadingAdvisors) {
      const currentUserId = typeof user.id === 'string' ? parseInt(user.id) : user.id;
      const userExists = salesAdvisors.find(advisor => advisor.value === currentUserId);
      
      // Solo establecer si no hay valor previo y el usuario existe en la lista
      if (userExists && (!formik.values.supportSales || formik.values.supportSales === '')) {
        setFieldValue('supportSales', currentUserId.toString());
      }
    }
  }, [salesAdvisors, loadingAdvisors, customer, user?.id, setFieldValue, formik.values.supportSales]);

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
              {duplicationValidation && (
                <CustomerDuplicationAlert
                  hasEmailDuplication={duplicationValidation.hasEmailDuplication}
                  hasDomainDuplication={duplicationValidation.hasDomainDuplication}
                  canProceed={duplicationValidation.canProceed}
                  message={duplicationValidation.message}
                  requiresDuplicatePermission={duplicationValidation.requiresDuplicatePermission}
                  details={duplicationValidation.details}
                  onClose={clearDuplicationValidation}
                  onProceed={handleProceedWithDuplicateDomain}
                  isProcessing={isProceedingWithDuplicateDomain}
                />
              )}

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
                        <InputLabel htmlFor="customer-middleName">Apellido Materno</InputLabel>
                        <TextField
                          fullWidth
                          id="customer-middleName"
                          placeholder="Ingrese el apellido materno"
                          {...getFieldProps('middleName')}
                          error={Boolean(touched.middleName && errors.middleName)}
                          helperText={touched.middleName && errors.middleName}
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
                          onChange={(e) => {
                            clearDuplicationValidation();
                            setFieldValue('email', e.target.value.trim());
                          }}
                          error={Boolean(touched.email && errors.email)}
                          helperText={touched.email && errors.email}
                        />
                      </Stack>
                    </Grid>
                    <Grid size={6}>
                      <Stack sx={{ gap: 1 }}>
                        <InputLabel htmlFor="customer-phone">Número de teléfono</InputLabel>
                        <TextField
                          fullWidth
                          id="customer-phone"
                          placeholder="Ingrese el número de teléfono"
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
                          placeholder="Ingrese el nombre de la empresa"
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
                        <InputLabel htmlFor="customer-supportSales">Asesor de ventas</InputLabel>
                        <FormControl fullWidth>
                          <Select
                            id="customer-supportSales"
                            displayEmpty
                            {...getFieldProps('supportSales')}
                            value={safeSupportSalesValue}
                            onChange={(event: SelectChangeEvent<string>) => setFieldValue('supportSales', event.target.value as string)}
                            input={<OutlinedInput id="select-supportSales" placeholder="Seleccionar un asesor" />}
                            renderValue={(selected) => {
                              if (!selected) {
                                return <Typography variant="subtitle1">Seleccionar un asesor</Typography>;
                              }

                              const selectedAdvisor = salesAdvisors.find((advisor) => advisor.value === Number(selected));
                              return (
                                <Typography variant="subtitle2">
                                  {selectedAdvisor ? selectedAdvisor.label : 'Asesor no encontrado'}
                                </Typography>
                              );
                            }}
                            disabled={loadingAdvisors}
                          >
                            {loadingAdvisors ? (
                              <MenuItem disabled>
                                <ListItemText primary="Cargando asesores..." />
                              </MenuItem>
                            ) : (
                              salesAdvisors.map((advisor) => (
                                <MenuItem key={advisor.value} value={advisor.value}>
                                  <ListItemText 
                                    primary={advisor.label} 
                                    secondary={advisor.profile}
                                  />
                                </MenuItem>
                              ))
                            )}
                          </Select>
                        </FormControl>
                        {touched.supportSales && errors.supportSales && (
                          <FormHelperText error id="standard-weight-helper-text-supportSales" sx={{ pl: 1.75 }}>
                            {errors.supportSales}
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
                  {customer && canDelete('customer') && (
                    <Tooltip title="Eliminar cliente" placement="top">
                      <IconButton onClick={() => setOpenAlert(true)} size="large" color="error">
                        <Trash variant="Bold" />
                      </IconButton>
                    </Tooltip>
                  )}
                </Grid>
                <Grid>
                  <Stack direction="row" sx={{ gap: 2, alignItems: 'center' }}>
                    <Button color="error" onClick={closeModal} disabled={isSubmitting || isProceedingWithDuplicateDomain}>
                      Cancelar
                    </Button>
                    <Button
                      type="submit"
                      variant="contained"
                      disabled={isSubmitting || isProceedingWithDuplicateDomain || (customer ? !canUpdate('customer') : !canCreate('customer'))}
                    >
                      {customer ? 'Editar' : 'Agregar'}
                    </Button>
                  </Stack>
                </Grid>
              </Grid>
            </DialogActions>
          </Form>
        </LocalizationProvider>
      </FormikProvider>
      {customer && canDelete('customer') && (
        <AlertCustomerDelete id={customer.Id!} title={customer.Name || customer.name || ''} open={openAlert} handleClose={handleAlertClose} />
      )}
    </>
  );
}
