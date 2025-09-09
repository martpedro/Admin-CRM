import { useEffect, useState } from 'react';

// material-ui
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
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
import Typography from '@mui/material/Typography';

// third-party
import * as Yup from 'yup';
import { useFormik, Form, FormikProvider } from 'formik';

// project-imports
import { openSnackbar } from 'api/snackbar';
import { 
  getCustomerAddresses, 
  createCustomerAddress, 
  updateCustomerAddress,
  deleteCustomerAddress 
} from 'api/customer';

// types
import { Address } from 'types/customer';
import { SnackbarProps } from 'types/snackbar';

interface AddressModalProps {
  open: boolean;
  onClose: () => void;
  customerId: number;
  customerName: string;
  addresses: Address[];
  onSave: (address: Address, isNew: boolean) => void;
  onRefresh?: () => void; // Para refrescar la lista después de cambios
}

// Validación schema para direcciones
const AddressSchema = Yup.object().shape({
  CustomerId: Yup.number(),
  Label: Yup.string().max(50, 'El identificador no puede exceder 50 caracteres').required('El identificador es requerido'),
  Street: Yup.string().max(255).required('La dirección es requerida'),
  City: Yup.string().max(100).required('La ciudad es requerida'),
  State: Yup.string().max(100).required('El estado/provincia es requerido'),
  PostalCode: Yup.string().max(20).required('El código postal es requerido'),
  Country: Yup.string().max(100).required('El país es requerido')
});

// Opciones predefinidas para el identificador de dirección
const addressLabels = [
  { value: 'Casa', label: 'Casa' },
  { value: 'Oficina', label: 'Oficina' },
  { value: 'Principal', label: 'Principal' },
  { value: 'Secundaria', label: 'Secundaria' },
  { value: 'Trabajo', label: 'Trabajo' },
  { value: 'Facturación', label: 'Facturación' },
  { value: 'Envío', label: 'Envío' },
  { value: 'Otro', label: 'Otro' }
];

// Función para validar que el label sea válido
const getValidLabel = (label?: string): string => {
  const validLabels = addressLabels.map(option => option.value);
  if (label && validLabels.includes(label)) {
    return label;
  }
  return 'Casa'; // Valor por defecto
};

const getInitialValues = (address?: Address, customerId?: number): Address => ({
  CustomerId: address?.CustomerId || customerId,
  Label: getValidLabel(address?.Label),
  Street: address?.Street || '',
  City: address?.City || '',
  State: address?.State || '',
  PostalCode: address?.PostalCode || '',
  Country: address?.Country || 'México'
});

export default function AddressModal({ open, onClose, customerId, customerName, addresses, onSave, onRefresh }: AddressModalProps) {
  const [selectedAddressIndex, setSelectedAddressIndex] = useState<number>(-1); // -1 = nueva dirección
  const [isNewAddress, setIsNewAddress] = useState<boolean>(true);
  const [currentAddresses, setCurrentAddresses] = useState<Address[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [loadingAddresses, setLoadingAddresses] = useState<boolean>(false);

  // Cargar direcciones del cliente cuando se abre el modal
  useEffect(() => {
    if (open && customerId) {
      loadCustomerAddresses();
    }
    // Resetear el índice seleccionado cuando se abre el modal
    if (open) {
      setSelectedAddressIndex(-1);
      setIsNewAddress(true);
    }
  }, [open, customerId]);

  const loadCustomerAddresses = async () => {
    try {
      setLoadingAddresses(true);
      const result = await getCustomerAddresses(customerId);
      
      if (result.success) {
        setCurrentAddresses(result.data.Message || []);
      } else {
        openSnackbar({
          open: true,
          message: result.error || 'Error al cargar las direcciones',
          variant: 'alert',
          alert: {
            color: 'error'
          }
        } as SnackbarProps);
        setCurrentAddresses([]);
      }
    } catch (error: any) {
      openSnackbar({
        open: true,
        message: 'Error al cargar las direcciones del cliente',
        variant: 'alert',
        alert: {
          color: 'error'
        }
      } as SnackbarProps);
      setCurrentAddresses([]);
    } finally {
      setLoadingAddresses(false);
    }
  };

  const formik = useFormik({
    initialValues: getInitialValues(undefined, customerId),
    validationSchema: AddressSchema,
    enableReinitialize: false, // Cambiado a false para evitar reinicializaciones automáticas
    onSubmit: async (values, { setSubmitting, resetForm }) => {
      try {
        setLoading(true);
        let result;
        
        if (isNewAddress) {
          // Crear nueva dirección
          result = await createCustomerAddress(customerId, values);
        } else {
          // Actualizar dirección existente
          const selectedAddress = currentAddresses[selectedAddressIndex];
          if (selectedAddress?.Id) {
            result = await updateCustomerAddress(customerId, selectedAddress.Id, values);
          } else {
            throw new Error('ID de dirección no encontrado');
          }
        }

        if (result.success) {
          await onSave(values, isNewAddress);
          
          openSnackbar({
            open: true,
            message: isNewAddress ? 'Dirección agregada exitosamente.' : 'Dirección actualizada exitosamente.',
            variant: 'alert',
            alert: {
              color: 'success'
            }
          } as SnackbarProps);
          
          // Recargar direcciones del API
          await loadCustomerAddresses();
          
          // Refrescar la lista de direcciones del componente padre
          if (onRefresh) {
            onRefresh();
          }
          
          // Resetear a nueva dirección después de guardar
          setValues(getInitialValues(undefined, customerId));
          setSelectedAddressIndex(-1);
          setIsNewAddress(true);
          handleClose();
        } else {
          openSnackbar({
            open: true,
            message: result.error,
            variant: 'alert',
            alert: {
              color: 'error'
            }
          } as SnackbarProps);
        }
      } catch (error: any) {
        openSnackbar({
          open: true,
          message: error.message || 'Error al guardar la dirección.',
          variant: 'alert',
          alert: {
            color: 'error'
          }
        } as SnackbarProps);
      } finally {
        setLoading(false);
        setSubmitting(false);
      }
    }
  });

  const { errors, touched, handleSubmit, isSubmitting, getFieldProps, setFieldValue, setValues } = formik;

  // Manejar cambio de selección de dirección
  const handleAddressSelect = (event: SelectChangeEvent<string>) => {
    const index = parseInt(event.target.value);
    setSelectedAddressIndex(index);
    console.log("Índice de dirección seleccionada:", index);
    
    if (index === -1) {
      // Nueva dirección
      setIsNewAddress(true);
      const newValues = getInitialValues(undefined, customerId);
      setValues(newValues);
      console.log("Valores para nueva dirección:", newValues);
    } else {
      // Dirección existente
      setIsNewAddress(false);
      const selectedAddress = currentAddresses[index];
      console.log("Dirección seleccionada:", selectedAddress);
      
      const addressValues = getInitialValues(selectedAddress, customerId);
      setValues(addressValues);
      console.log("Valores cargados:", addressValues);
    }
  };

  const handleClose = () => {
    setValues(getInitialValues(undefined, customerId));
    setSelectedAddressIndex(-1);
    setIsNewAddress(true);
    setCurrentAddresses([]);
    onClose();
  };

  // Generar opciones para el select
  const addressOptions = [
    { value: -1, label: '+ Nueva Dirección', isNew: true },
    ...currentAddresses.map((address, index) => ({
      value: index,
      label: address.Label 
        ? `${address.Label} - ${address.Street}, ${address.City}`
        : `${address.Street}, ${address.City}`,
      isNew: false
    }))
  ];

  // Asegurarse de que el valor seleccionado es válido
  const getValidSelectedValue = () => {
    const validValues = addressOptions.map(option => option.value);
    if (validValues.includes(selectedAddressIndex)) {
      return selectedAddressIndex.toString();
    }
    return "-1"; // Valor por defecto
  };
  return (
    <Dialog 
      open={open} 
      onClose={handleClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: { borderRadius: 2 }
      }}
    >
      <FormikProvider value={formik}>
        <Form autoComplete="off" noValidate onSubmit={handleSubmit}>
          <DialogTitle>
            <Typography variant="h5" component="span">
              Administrar Direcciones - {customerName}
            </Typography>
          </DialogTitle>
          <Divider />
          
          <DialogContent sx={{ p: 3 }}>
            <Grid container spacing={3}>
              {/* Selector de direcciones */}
              <Grid size={12}>
                <Stack sx={{ gap: 1 }}>
                  <InputLabel htmlFor="address-select">Seleccionar Dirección</InputLabel>
                  <FormControl fullWidth>
                    <Select
                      id="address-select"
                      value={getValidSelectedValue()}
                      onChange={handleAddressSelect}
                      input={<OutlinedInput />}
                      disabled={loadingAddresses}
                      renderValue={(selected) => {
                        if (loadingAddresses) {
                          return (
                            <Typography variant="subtitle2" sx={{ color: 'text.secondary' }}>
                              Cargando direcciones...
                            </Typography>
                          );
                        }
                        const selectedOption = addressOptions.find(option => option.value === parseInt(selected));
                        return (
                          <Typography 
                            variant="subtitle2" 
                            sx={{ 
                              color: selectedOption?.isNew ? 'primary.main' : 'text.primary',
                              fontWeight: selectedOption?.isNew ? 600 : 400 
                            }}
                          >
                            {selectedOption?.label || '+ Nueva Dirección'}
                          </Typography>
                        );
                      }}
                    >
                      {addressOptions.map((option) => (
                        <MenuItem key={option.value} value={option.value}>
                          <ListItemText 
                            primary={option.label}
                            sx={{
                              '& .MuiListItemText-primary': {
                                color: option.isNew ? 'primary.main' : 'text.primary',
                                fontWeight: option.isNew ? 600 : 400
                              }
                            }}
                          />
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Stack>
              </Grid>

              <Grid size={12}>
                <Divider sx={{ my: 1 }} />
                <Typography variant="h6" sx={{ mb: 2 }}>
                  {isNewAddress ? 'Nueva Dirección' : 'Editar Dirección'}
                </Typography>
              </Grid>

              {/* Campo identificador */}
              <Grid size={{ xs: 12, sm: 6 }}>
                <Stack sx={{ gap: 1 }}>
                  <InputLabel htmlFor="address-label">Identificador *</InputLabel>
                  <FormControl fullWidth>
                    <Select
                      id="address-label"
                      value={formik.values.Label || 'Casa'}
                      onChange={(event: SelectChangeEvent<string>) => setFieldValue('Label', event.target.value as string)}
                      input={<OutlinedInput />}
                      renderValue={(selected) => {
                        const selectedLabel = addressLabels.find(item => item.value === selected);
                        return (
                          <Typography variant="subtitle2">
                            {selectedLabel ? selectedLabel.label : selected}
                          </Typography>
                        );
                      }}
                      error={Boolean(touched.Label && errors.Label)}
                    >
                      {addressLabels.map((option) => (
                        <MenuItem key={option.value} value={option.value}>
                          <ListItemText primary={option.label} />
                        </MenuItem>
                      ))}
                    </Select>
                    {touched.Label && errors.Label && (
                      <FormHelperText error>
                        {errors.Label}
                      </FormHelperText>
                    )}
                  </FormControl>
                </Stack>
              </Grid>

              {/* Espacio para alineación */}
              <Grid size={{ xs: 12, sm: 6 }}></Grid>

              {/* Campos del formulario */}
              <Grid size={12}>
                <Stack sx={{ gap: 1 }}>
                  <InputLabel htmlFor="address-street">Dirección / Calle *</InputLabel>
                  <TextField
                    fullWidth
                    id="address-street"
                    placeholder="Ej: Av. Reforma 123, Col. Centro"
                    {...getFieldProps('Street')}
                    error={Boolean(touched.Street && errors.Street)}
                    helperText={touched.Street && errors.Street}
                  />
                </Stack>
              </Grid>

              <Grid size={{ xs: 12, sm: 6 }}>
                <Stack sx={{ gap: 1 }}>
                  <InputLabel htmlFor="address-city">Ciudad *</InputLabel>
                  <TextField
                    fullWidth
                    id="address-city"
                    placeholder="Ej: Ciudad de México"
                    {...getFieldProps('City')}
                    error={Boolean(touched.City && errors.City)}
                    helperText={touched.City && errors.City}
                  />
                </Stack>
              </Grid>

              <Grid size={{ xs: 12, sm: 6 }}>
                <Stack sx={{ gap: 1 }}>
                  <InputLabel htmlFor="address-state">Estado / Provincia *</InputLabel>
                  <TextField
                    fullWidth
                    id="address-state"
                    placeholder="Ej: CDMX"
                    {...getFieldProps('State')}
                    error={Boolean(touched.State && errors.State)}
                    helperText={touched.State && errors.State}
                  />
                </Stack>
              </Grid>

              <Grid size={{ xs: 12, sm: 6 }}>
                <Stack sx={{ gap: 1 }}>
                  <InputLabel htmlFor="address-postalCode">Código Postal *</InputLabel>
                  <TextField
                    fullWidth
                    id="address-postalCode"
                    placeholder="Ej: 06000"
                    {...getFieldProps('PostalCode')}
                    error={Boolean(touched.PostalCode && errors.PostalCode)}
                    helperText={touched.PostalCode && errors.PostalCode}
                  />
                </Stack>
              </Grid>

              <Grid size={{ xs: 12, sm: 6 }}>
                <Stack sx={{ gap: 1 }}>
                  <InputLabel htmlFor="address-country">País *</InputLabel>
                  <TextField
                    fullWidth
                    id="address-country"
                    placeholder="Ej: México"
                    {...getFieldProps('Country')}
                    error={Boolean(touched.Country && errors.Country)}
                    helperText={touched.Country && errors.Country}
                  />
                </Stack>
              </Grid>
            </Grid>
          </DialogContent>

          <Divider />
          <DialogActions sx={{ p: 2.5 }}>
            <Grid container sx={{ justifyContent: 'flex-end', alignItems: 'center', width: 1 }}>
              <Grid>
                <Stack direction="row" sx={{ gap: 2, alignItems: 'center' }}>
                  <Button color="error" onClick={handleClose}>
                    Cancelar
                  </Button>
                  <Button type="submit" variant="contained" disabled={isSubmitting || loading}>
                    {isNewAddress ? 'Agregar Dirección' : 'Actualizar Dirección'}
                  </Button>
                </Stack>
              </Grid>
            </Grid>
          </DialogActions>
        </Form>
      </FormikProvider>
    </Dialog>
  );
}
