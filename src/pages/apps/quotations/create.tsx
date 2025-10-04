import { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { Formik, Form, FieldArray } from 'formik';
import * as Yup from 'yup';

// types
import { CustomerList } from 'types/customer';
import { ApiUser } from 'types/user';

// material-ui
import {
  Box,
  Button,
  Card,
  CardContent,
  CardHeader,
  Divider,
  IconButton,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
  FormControl,
  FormControlLabel,
  FormHelperText,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Tab,
  Tabs,
  Avatar,
  Switch,
  CircularProgress
} from '@mui/material';
import Grid from '@mui/material/Grid2';

// third-party
import { useSnackbar } from 'notistack';

// project-imports
import Breadcrumbs from 'components/@extended/Breadcrumbs';
import MainCard from 'components/MainCard';
import { useQuotationOperations } from 'hooks/useQuotations';
import { useCustomers } from 'hooks/useCustomers';
// import { useUsers } from 'hooks/useUsers';
import { useCompanies, useCompanyOperations } from 'hooks/useCompanies';
import quotationsApi, { sendQuotationEmail } from 'api/quotations';
import JWTContext from 'contexts/JWTContext';

// assets
import { Add, Trash, SearchNormal1, DocumentUpload } from 'iconsax-react';
import Autocomplete from '@mui/material/Autocomplete';
import ProductAddDialog, { ProductWithOrigin } from 'components/quotations/ProductAddDialog';
import { getAddressesByCustomer } from 'api/customer';

// types
import { QuotationCreate, QuotationProduct } from 'api/quotations';
import { calculateProductTotal, calculateTotals, formatCurrencyMXN } from 'utils/quotation';
import Chip from '@mui/material/Chip';

// ProductWithOrigin ahora viene del componente reutilizable ProductAddDialog

const validationSchema = Yup.object({
  CustomerId: Yup.number().required('El cliente es requerido'),
  UserId: Yup.number().required('El asesor es requerido'),
  AddressId: Yup.number().required('La dirección es requerida'),
  CompanyId: Yup.number().required('La empresa es requerida'),
  AdvancePayment: Yup.string().required('El anticipo es requerido'),
  LiquidationPayment: Yup.string().required('La liquidación es requerida'),
  TimeCredit: Yup.string().required('El tiempo de crédito es requerido'),
  TimeValidation: Yup.string().required('El tiempo de validación es requerido'),
  products: Yup.array().min(1, 'Debe agregar al menos un producto')
});

const CreateQuotation = () => {
  const navigate = useNavigate();
  const auth = useContext(JWTContext);
  const currentUserId = (auth?.user as any)?.Id || (auth?.user as any)?.id || 0;
  const { createQuotation } = useQuotationOperations();
  const { enqueueSnackbar } = useSnackbar();
  const { customers } = useCustomers();
  const [advisors, setAdvisors] = useState<ApiUser[]>([]);
  const [loadingAdvisors, setLoadingAdvisors] = useState(false);
  const [advisorsError, setAdvisorsError] = useState<string | null>(null);
  const [initialUserId, setInitialUserId] = useState<number>(currentUserId || 0);
  // Cargar asesores según permisos del usuario
  useEffect(() => {
    let active = true;
    const load = async () => {
      setLoadingAdvisors(true);
      setAdvisorsError(null);
      try {
        const list = await quotationsApi.getAdvisors();
        if (!active) return;
        // El endpoint ya devuelve estructura mapUser; asegurar tipado mínimo
        const mapped = Array.isArray(list) ? list.map((u: any) => ({
          Id: u.Id,
            name: u.name || u.Name || '',
            LastName: u.LastName || '',
            MotherLastName: u.MotherLastName || '',
            email: u.email || u.Email || '',
            isActive: u.isActive !== false,
            profile: u.profile || '',
            Phone: u.Phone || '',
            LetterAsign: u.LetterAsign || '',
            password: u.password || ''
        })) : [];
        setAdvisors(mapped);
      } catch (e: any) {
        if (!active) return;
        setAdvisorsError(e?.message || 'Error cargando asesores');
      } finally {
        if (active) setLoadingAdvisors(false);
      }
    };
    load();
    return () => { active = false; };
  }, []);
  const { companies } = useCompanies();
  const { getCompanyById } = useCompanyOperations();

  const [selectedCustomer, setSelectedCustomer] = useState<CustomerList | null>(null);
  const [customerAddresses, setCustomerAddresses] = useState<any[]>([]);
  const [selectedCompany, setSelectedCompany] = useState<any>(null);
  const [openProductDialog, setOpenProductDialog] = useState(false);

  const [productPushFunction, setProductPushFunction] = useState<((obj: any) => void) | null>(null);
  const [emissionDate, setEmissionDate] = useState<string>(() => new Date().toISOString().slice(0, 10));
  const [creatingAndSending, setCreatingAndSending] = useState(false);

  // Actualizar initialUserId cuando cambie usuario logueado
  useEffect(() => {
    if (currentUserId && currentUserId !== initialUserId) {
      setInitialUserId(currentUserId);
    }
  }, [currentUserId]);

  const initialValues: QuotationCreate = {
    CustomerId: customers.length > 0 ? 0 : 0,
    UserId: advisors.length > 0 ? initialUserId || 0 : 0,
    AddressId: 0,
    CompanyId: 0,
    AdvancePayment: '',
    LiquidationPayment: '',
    TimeCredit: '',
    TimeValidation: '',
    SubTotal: 0,
    Tax: 0,
    Total: 0,
    products: []
  };

  // Extendemos el tipo en runtime (si la interface original no lo tiene no afecta)
  // Eliminado: ahora se gestiona dentro del diálogo reutilizable

  // Funciones movidas a utils/quotation.ts

  const handleSubmit = async (values: QuotationCreate) => {
    try {
      const result = await createQuotation(values);
      if (result.success) {
        const created = result.data;
        enqueueSnackbar('Cotización creada exitosamente', { variant: 'success' });
        // Redirigir a la pantalla de edición con el Id devuelto
        if (created && created.Id) {
          navigate(`/quotations/edit/${created.Id}`);
        } else {
          // Fallback: volver al listado
          navigate('/quotations');
        }
      } else {
        enqueueSnackbar(result.error || 'Error al crear la cotización', { variant: 'error' });
      }
    } catch (error: any) {
      enqueueSnackbar(error?.message || 'Error inesperado al crear la cotización', { variant: 'error' });
    }
  };

  const handleCreateAndSendEmail = async (values: QuotationCreate) => {
    const selectedCustomer = customers.find((c: any) => c.Id === values.CustomerId);
    if (!selectedCustomer?.Email) {
      enqueueSnackbar('El cliente no tiene email registrado', { variant: 'warning' });
      return;
    }

    setCreatingAndSending(true);
    try {
      // Primero crear la cotización usando la API
      const createResult = await createQuotation(values);
      if (!createResult.success) {
        enqueueSnackbar(createResult.error || 'Error al crear la cotización', { variant: 'error' });
        return;
      }
      
      const created = createResult.data;
      
      // Luego enviar por correo si se creó exitosamente
      if (created && created.Id) {
        await sendQuotationEmail({
          quotationId: created.Id,
          to: selectedCustomer.Email,
          cc: '',
          message: `Estimado/a ${selectedCustomer.Name},\n\nEsperamos que se encuentre bien. Adjunto encontrará la cotización #${created.NumberQuotation} solicitada.\n\nQuedamos a la espera de sus comentarios.\n\nSaludos cordiales.`
        });
        
        enqueueSnackbar('Cotización creada y enviada por correo exitosamente', { variant: 'success' });
        navigate(`/quotations/edit/${created.Id}`);
      } else {
        enqueueSnackbar('Error al crear la cotización', { variant: 'error' });
      }
    } catch (error: any) {
      enqueueSnackbar(error?.message || 'Error al crear y enviar la cotización', { variant: 'error' });
    } finally {
      setCreatingAndSending(false);
    }
  };

  // Buscar producto por código en la API
  // Lógica de agregar producto delegada al componente reutilizable

  return (
    <>
      <Breadcrumbs title />

  <Formik enableReinitialize initialValues={initialValues} validationSchema={validationSchema} onSubmit={handleSubmit}>
        {({ values, errors, touched, handleChange, handleBlur, setFieldValue }) => (
          <Form>
            <Grid container spacing={3}>
              {/* Company Selection */}
              <Grid size={12}>
                <MainCard title="Información de la Empresa">
                  <Grid container spacing={3}>
                    <Grid size={{ xs: 12, md: 6 }}>
                      <FormControl fullWidth error={Boolean(touched.CompanyId && errors.CompanyId)}>
                        <InputLabel>Empresa</InputLabel>
                        <Select
                          name="CompanyId"
                          value={values.CompanyId}
                          onChange={async (e) => {
                            const companyId = e.target.value as number;
                            setFieldValue('CompanyId', companyId);
                            if (companyId > 0) {
                              try {
                                const company = await getCompanyById(companyId);
                                setSelectedCompany(company);
                              } catch (error) {
                                console.error('Error fetching company:', error);
                                setSelectedCompany(null);
                              }
                            } else {
                              setSelectedCompany(null);
                            }
                          }}
                          onBlur={handleBlur}
                        >
                          <MenuItem value={0}>Seleccionar empresa</MenuItem>
                          {Array.isArray(companies) &&
                            companies.map((company: any) => (
                              <MenuItem key={company.Id} value={company.Id}>
                                {company.Name || 'Sin nombre'}
                              </MenuItem>
                            ))}
                        </Select>
                        {touched.CompanyId && errors.CompanyId && <FormHelperText>{errors.CompanyId}</FormHelperText>}
                      </FormControl>
                    </Grid>

                    {selectedCompany && (
                      <Grid size={{ xs: 12, md: 6 }}>
                        <Card variant="outlined">
                          <CardHeader title="Resumen de la Empresa" titleTypographyProps={{ variant: 'h6', fontSize: '1rem' }} />
                          <CardContent sx={{ pt: 0.5, pb: 1 }}>
                            <Grid container spacing={1}>
                              {/* Razón Social - full width */}
                              <Grid size={12}>
                                <Typography variant="caption" color="textSecondary" sx={{ fontWeight: 600, mr: 0.5 }} component="span">
                                  Razón Social:
                                </Typography>
                                <Typography variant="body2" component="span">
                                  {selectedCompany.LegalName || selectedCompany.Name || 'No disponible'}
                                </Typography>
                              </Grid>

                              {/* RFC */}
                              <Grid size={{ xs: 12, sm: 6 }}>
                                <Typography variant="caption" color="textSecondary" sx={{ fontWeight: 600, mr: 0.5 }} component="span">
                                  RFC:
                                </Typography>
                                <Typography variant="body2" component="span">
                                  {selectedCompany.TaxId || 'No disponible'}
                                </Typography>
                              </Grid>

                              {/* Teléfonos */}
                              <Grid size={{ xs: 12, sm: 6 }}>
                                <Typography variant="caption" color="textSecondary" sx={{ fontWeight: 600, mr: 0.5 }} component="span">
                                  Teléfonos:
                                </Typography>
                                <Typography variant="body2" component="span">
                                  {selectedCompany.Phones || selectedCompany.Phone || 'No disponible'}
                                </Typography>
                              </Grid>

                              {/* WhatsApp */}
                              <Grid size={{ xs: 12, sm: 6 }}>
                                <Typography variant="caption" color="textSecondary" sx={{ fontWeight: 600, mr: 0.5 }} component="span">
                                  WhatsApp:
                                </Typography>
                                <Typography variant="body2" component="span">
                                  {selectedCompany.WhatsApp || 'No disponible'}
                                </Typography>
                              </Grid>

                              {/* Página */}
                              <Grid size={{ xs: 12, sm: 6 }}>
                                <Typography variant="caption" color="textSecondary" sx={{ fontWeight: 600, mr: 0.5 }} component="span">
                                  Página:
                                </Typography>
                                {selectedCompany.WebPage ? (
                                  <Typography variant="body2" component="span" color="primary">
                                    <a
                                      href={
                                        selectedCompany.WebPage.startsWith('http')
                                          ? selectedCompany.WebPage
                                          : `https://${selectedCompany.WebPage}`
                                      }
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      style={{ color: 'inherit', textDecoration: 'none' }}
                                    >
                                      {selectedCompany.WebPage}
                                    </a>
                                  </Typography>
                                ) : (
                                  <Typography variant="body2" component="span">
                                    No disponible
                                  </Typography>
                                )}
                              </Grid>

                              {/* Dirección - full width */}
                              <Grid size={12}>
                                <Typography variant="caption" color="textSecondary" sx={{ fontWeight: 600, mr: 0.5 }} component="span">
                                  Dirección:
                                </Typography>
                                <Typography variant="body2" component="span">
                                  {selectedCompany.Address || 'No disponible'}
                                </Typography>
                              </Grid>
                            </Grid>
                          </CardContent>
                        </Card>
                      </Grid>
                    )}

                    {/* Campos debajo de Empresa */}
                    <Grid size={{ xs: 12, md: 4 }}>
                      <TextField
                        fullWidth
                        size="small"
                        type="date"
                        label="Fecha de Emisión"
                        InputLabelProps={{ shrink: true }}
                        value={emissionDate}
                        onChange={(e) => setEmissionDate(e.target.value)}
                      />
                    </Grid>
                    <Grid size={{ xs: 12, md: 4 }}>
                      <TextField
                        fullWidth
                        size="small"
                        name="TimeValidation"
                        label="Validez"
                        value={values.TimeValidation}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        error={Boolean(touched.TimeValidation && errors.TimeValidation)}
                        helperText={touched.TimeValidation && (errors.TimeValidation as any)}
                      />
                    </Grid>
                    <Grid size={{ xs: 12, md: 4 }}>
                      <TextField
                        fullWidth
                        size="small"
                        label="Cotización #"
                        value={selectedCompany?.QuotationLetter ? `${selectedCompany.QuotationLetter}-` : 'Se generará al crear'}
                        InputProps={{ readOnly: true }}
                      />
                    </Grid>
                  </Grid>
                </MainCard>
              </Grid>

              {/* Customer Information */}
              <Grid size={12}>
                <MainCard title="Información del Cliente">
                  <Grid container spacing={3}>
                    <Grid size={{ xs: 12, md: 6 }}>
                      <FormControl fullWidth error={Boolean(touched.CustomerId && errors.CustomerId)}>
                        <InputLabel>Cliente</InputLabel>
                        <Select
                          name="CustomerId"
                          value={values.CustomerId}
                          onChange={async (e) => {
                            const customerId = e.target.value as number;
                            setFieldValue('CustomerId', customerId);
                            const customer = customers.find((c: CustomerList) => c.Id === customerId);
                            if (customer) {
                              setSelectedCustomer(customer);
                            }
                            // Cargar direcciones del cliente y setear AddressId
                            try {
                              if (customerId > 0) {
                                const addresses = await getAddressesByCustomer(customerId);
                                setCustomerAddresses(addresses);
                                const firstId = addresses[0]?.Id || 0;
                                setFieldValue('AddressId', firstId);
                              } else {
                                setCustomerAddresses([]);
                                setFieldValue('AddressId', 0);
                              }
                            } catch (err) {
                              console.error('Error fetching customer addresses', err);
                              setCustomerAddresses([]);
                              setFieldValue('AddressId', 0);
                            }
                          }}
                          onBlur={handleBlur}
                        >
                          <MenuItem value={0}>Seleccionar cliente</MenuItem>
                          {Array.isArray(customers) &&
                            customers.map((customer: CustomerList) => (
                              <MenuItem key={customer.Id} value={customer.Id}>
                                {customer.Name} - {customer.Email || 'Sin email'}
                              </MenuItem>
                            ))}
                        </Select>
                        {touched.CustomerId && errors.CustomerId && <FormHelperText>{errors.CustomerId}</FormHelperText>}
                      </FormControl>
                    </Grid>

                    {/* Datos del cliente autocompletados */}
                    {selectedCustomer && (
                      <>
                        <Grid size={{ xs: 12, md: 4 }}>
                          <TextField
                            fullWidth
                            size="small"
                            label="CLIENTE"
                            value={selectedCustomer.Name || ''}
                            InputProps={{ readOnly: true }}
                          />
                        </Grid>
                        <Grid size={{ xs: 12, md: 4 }}>
                          {customerAddresses.length > 0 ? (
                            <FormControl fullWidth size="small" error={Boolean(touched.AddressId && errors.AddressId)}>
                              <InputLabel>DIRECCIÓN</InputLabel>
                              <Select
                                label="DIRECCIÓN"
                                name="AddressId"
                                value={values.AddressId}
                                onChange={(e) => setFieldValue('AddressId', e.target.value)}
                              >
                                {customerAddresses.map((addr: any) => (
                                  <MenuItem key={addr.Id} value={addr.Id}>
                                    {`${addr.Label ? addr.Label + ' - ' : ''}${addr.Street || ''}${addr.City ? ', ' + addr.City : ''}${addr.State ? ', ' + addr.State : ''}${addr.PostalCode ? ' ' + addr.PostalCode : ''}${addr.Country ? ' - ' + addr.Country : ''}`}
                                  </MenuItem>
                                ))}
                              </Select>
                              {touched.AddressId && errors.AddressId && <FormHelperText>{errors.AddressId as any}</FormHelperText>}
                            </FormControl>
                          ) : (
                            <TextField
                              fullWidth
                              size="small"
                              label="DIRECCIÓN"
                              value={'Sin direcciones registradas'}
                              InputProps={{ readOnly: true }}
                              error={Boolean(touched.AddressId && errors.AddressId)}
                              helperText={touched.AddressId && (errors.AddressId as any)}
                            />
                          )}
                        </Grid>
                        <Grid size={{ xs: 12, md: 4 }}>
                          <TextField
                            fullWidth
                            size="small"
                            label="TELÉFONOS"
                            value={selectedCustomer.Phone || ''}
                            InputProps={{ readOnly: true }}
                          />
                        </Grid>
                      </>
                    )}

                    <Grid size={{ xs: 12, md: 6 }}>
                      <FormControl fullWidth error={Boolean(touched.UserId && errors.UserId)}>
                        <InputLabel>Asesor</InputLabel>
                        <Select name="UserId" value={values.UserId} onChange={handleChange} onBlur={handleBlur}>
                          <MenuItem value={0}>Seleccionar asesor</MenuItem>
                          {/* Opción temporal para evitar el warning de MUI cuando el valor actual (usuario logueado) aún no está en la lista cargada */}
                          {!loadingAdvisors && !advisorsError && values.UserId !== 0 && !advisors.some(a => a.Id === values.UserId) && (
                            <MenuItem value={values.UserId} disabled>
                              {(auth?.user as any)?.name || 'Usuario actual'} (cargando permisos)
                            </MenuItem>
                          )}
                          {loadingAdvisors && <MenuItem disabled>Cargando asesores...</MenuItem>}
                          {advisorsError && <MenuItem disabled>{advisorsError}</MenuItem>}
                          {!loadingAdvisors && !advisorsError && advisors.length === 0 && (
                            <MenuItem disabled>No hay asesores disponibles</MenuItem>
                          )}
                          {advisors.map((user: ApiUser) => (
                            <MenuItem key={user.Id} value={user.Id}>
                              {user.name || 'Sin nombre'} {user.LastName || ''}
                            </MenuItem>
                          ))}
                        </Select>
                        {touched.UserId && errors.UserId && <FormHelperText>{errors.UserId}</FormHelperText>}
                      </FormControl>
                    </Grid>

                    <Grid size={{ xs: 12, md: 6 }}>
                      <TextField
                        fullWidth
                        name="AdvancePayment"
                        label="Anticipo"
                        value={values.AdvancePayment}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        error={Boolean(touched.AdvancePayment && errors.AdvancePayment)}
                        helperText={touched.AdvancePayment && errors.AdvancePayment}
                      />
                    </Grid>

                    <Grid size={{ xs: 12, md: 6 }}>
                      <TextField
                        fullWidth
                        name="LiquidationPayment"
                        label="Liquidación"
                        value={values.LiquidationPayment}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        error={Boolean(touched.LiquidationPayment && errors.LiquidationPayment)}
                        helperText={touched.LiquidationPayment && errors.LiquidationPayment}
                      />
                    </Grid>

                    <Grid size={{ xs: 12, md: 6 }}>
                      <TextField
                        fullWidth
                        name="TimeCredit"
                        label="Tiempo de Crédito"
                        value={values.TimeCredit}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        error={Boolean(touched.TimeCredit && errors.TimeCredit)}
                        helperText={touched.TimeCredit && errors.TimeCredit}
                      />
                    </Grid>

                    {/* Campo de Validez movido arriba, debajo de Empresa */}
                  </Grid>
                </MainCard>
              </Grid>

              {/* Products */}
              <Grid size={12}>
                <MainCard
                  title="Productos"
                  secondary={
                    <FieldArray name="products">
                      {({ push }) => (
                        <Button
                          variant="contained"
                          startIcon={<Add />}
                          onClick={() => {
                            setProductPushFunction(() => push);
                            setOpenProductDialog(true);
                          }}
                          size="small"
                        >
                          Agregar Producto
                        </Button>
                      )}
                    </FieldArray>
                  }
                >
                  <FieldArray name="products">
                    {({ push, remove }) => (
                      <TableContainer>
                        <Table>
                          <TableHead>
                            <TableRow>
                              <TableCell>Imagen</TableCell>
                              <TableCell>Código Proveedor</TableCell>
                              <TableCell>Código</TableCell>
                              <TableCell>Especificaciones</TableCell>
                              <TableCell>Detalle de Impresión</TableCell>
                              <TableCell>Tiempo de Entrega</TableCell>
                              <TableCell>Cantidad</TableCell>
                              <TableCell>Costo</TableCell>
                              <TableCell>Costo de Impresión</TableCell>
                              <TableCell>% de Utilidad</TableCell>
                              <TableCell>Precio Unitario</TableCell>
                              <TableCell>Total</TableCell>
                              <TableCell>Utilidad</TableCell>
                              <TableCell align="center">Acciones</TableCell>
                            </TableRow>
                          </TableHead>
                          <TableBody>
                            {(values.products as ProductWithOrigin[]).map((product, index) => (
                              <TableRow key={index} data-origin={product.Origin || 'manual'}>
                                <TableCell>
                                  <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 0.5 }}>
                                    <Avatar src={product.Image} alt={product.Code} sx={{ width: 50, height: 50 }} variant="rounded">
                                      {product.Code?.charAt(0) || 'P'}
                                    </Avatar>
                                    <Chip size="small" label={product.Origin === 'catalog' ? 'Catálogo' : 'Manual'} color={product.Origin === 'catalog' ? 'primary' : 'default'} />
                                  </Box>
                                </TableCell>
                                <TableCell>
                                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                                    <TextField
                                      size="small"
                                      name={`products[${index}].CodeVendor`}
                                      value={product.CodeVendor || ''}
                                      onChange={handleChange}
                                      placeholder="Código proveedor"
                                      sx={{ minWidth: 120 }}
                                    />
                                    <FormControlLabel
                                      control={
                                        <Switch
                                          size="small"
                                          name={`products[${index}].ExtraProfit`}
                                          checked={(product as any).ExtraProfit || false}
                                          onChange={(e) => {
                                            const updatedProduct = calculateProductTotal({
                                              ...product,
                                              ExtraProfit: e.target.checked
                                            });
                                            setFieldValue(`products[${index}]`, updatedProduct);
                                            const updatedProducts = [...values.products];
                                            updatedProducts[index] = updatedProduct;
                                            const totals = calculateTotals(updatedProducts as any);
                                            setFieldValue('SubTotal', totals.SubTotal);
                                            setFieldValue('Tax', totals.Tax);
                                            setFieldValue('Total', totals.Total);
                                          }}
                                        />
                                      }
                                      label="Utilidad extra"
                                      sx={{ 
                                        fontSize: '0.75rem',
                                        '& .MuiFormControlLabel-label': { 
                                          fontSize: '0.75rem' 
                                        }
                                      }}
                                    />
                                  </Box>
                                </TableCell>
                                <TableCell>
                                  <TextField
                                    size="small"
                                    name={`products[${index}].Code`}
                                    value={product.Code || ''}
                                    onChange={handleChange}
                                    placeholder="Código"
                                    sx={{ minWidth: 100 }}
                                  />
                                </TableCell>
                                <TableCell>
                                  <TextField
                                    size="small"
                                    name={`products[${index}].Specifications`}
                                    value={product.Specifications || ''}
                                    onChange={handleChange}
                                    placeholder="Especificaciones"
                                    multiline
                                    rows={2}
                                    sx={{ minWidth: 200 }}
                                  />
                                </TableCell>
                                <TableCell>
                                  <TextField
                                    size="small"
                                    name={`products[${index}].PrintDetails`}
                                    value={(product as any).PrintDetails || ''}
                                    onChange={handleChange}
                                    placeholder="Detalle de impresión"
                                    multiline
                                    rows={2}
                                    sx={{ minWidth: 180 }}
                                  />
                                </TableCell>
                                <TableCell>
                                  <TextField
                                    size="small"
                                    name={`products[${index}].DeliveryTime`}
                                    value={product.DeliveryTime || ''}
                                    onChange={handleChange}
                                    placeholder="Tiempo entrega"
                                    sx={{ minWidth: 120 }}
                                  />
                                </TableCell>
                                <TableCell>
                                  <TextField
                                    size="small"
                                    type="number"
                                    name={`products[${index}].Quantity`}
                                    value={product.Quantity || 1}
                                    onChange={(e) => {
                                      const quantity = parseInt(e.target.value) || 0;
                                      const updatedProduct = calculateProductTotal({
                                        ...product,
                                        Quantity: quantity
                                      });
                                      setFieldValue(`products[${index}]`, updatedProduct);

                                      // Recalculate totals
                                      const updatedProducts = [...values.products];
                                      updatedProducts[index] = updatedProduct;
                                      const totals = calculateTotals(updatedProducts);
                                      setFieldValue('SubTotal', totals.SubTotal);
                                      setFieldValue('Tax', totals.Tax);
                                      setFieldValue('Total', totals.Total);
                                    }}
                                    inputProps={{ min: 1 }}
                                    sx={{ width: 80 }}
                                  />
                                </TableCell>
                                <TableCell>
                                  <TextField
                                    size="small"
                                    type="number"
                                    name={`products[${index}].VendorCost`}
                                    value={product.VendorCost || 0}
                                    onChange={(e) => {
                                      const vendorCost = parseFloat(e.target.value) || 0;
                                      const updatedProduct = calculateProductTotal({
                                        ...product,
                                        VendorCost: vendorCost
                                      });
                                      setFieldValue(`products[${index}]`, updatedProduct);

                                      // Recalculate totals
                                      const updatedProducts = [...values.products];
                                      updatedProducts[index] = updatedProduct;
                                      const totals = calculateTotals(updatedProducts);
                                      setFieldValue('SubTotal', totals.SubTotal);
                                      setFieldValue('Tax', totals.Tax);
                                      setFieldValue('Total', totals.Total);
                                    }}
                                    inputProps={{ min: 0, step: 1 }}
                                    sx={{ width: 100 }}
                                  />
                                </TableCell>
                                <TableCell>
                                  <TextField
                                    size="small"
                                    type="number"
                                    name={`products[${index}].PrintCost`}
                                    value={product.PrintCost || 0}
                                    onChange={(e) => {
                                      const printCost = parseFloat(e.target.value) || 0;
                                      const updatedProduct = calculateProductTotal({
                                        ...product,
                                        PrintCost: printCost
                                      });
                                      setFieldValue(`products[${index}]`, updatedProduct);

                                      // Recalculate totals
                                      const updatedProducts = [...values.products];
                                      updatedProducts[index] = updatedProduct;
                                      const totals = calculateTotals(updatedProducts);
                                      setFieldValue('SubTotal', totals.SubTotal);
                                      setFieldValue('Tax', totals.Tax);
                                      setFieldValue('Total', totals.Total);
                                    }}
                                    inputProps={{ min: 0, step: 1 }}
                                    sx={{ width: 100 }}
                                  />
                                </TableCell>
                                <TableCell>
                                  <TextField
                                    size="small"
                                    type="number"
                                    name={`products[${index}].ProfitMargin`}
                                    value={(product as any).ProfitMargin !== undefined ? (product as any).ProfitMargin : 30}
                                    onChange={(e) => {
                                      const profitMargin = e.target.value === '' ? 30 : parseFloat(e.target.value);
                                      const updatedProduct = calculateProductTotal({
                                        ...product,
                                        ProfitMargin: profitMargin
                                      });
                                      setFieldValue(`products[${index}]`, updatedProduct);

                                      // Recalculate totals
                                      const updatedProducts = [...values.products];
                                      updatedProducts[index] = updatedProduct;
                                      const totals = calculateTotals(updatedProducts);
                                      setFieldValue('SubTotal', totals.SubTotal);
                                      setFieldValue('Tax', totals.Tax);
                                      setFieldValue('Total', totals.Total);
                                    }}
                                    placeholder="30"
                                    inputProps={{ min: 0, step: 1 }}
                                    sx={{ width: 80 }}
                                    InputProps={{
                                      endAdornment: '%'
                                    }}
                                  />
                                </TableCell>
                                <TableCell>
                                  <Typography variant="body2" sx={{ minWidth: 80, fontWeight: 'bold' }}>
                                    {formatCurrencyMXN(product.UnitPrice || 0)}
                                  </Typography>
                                </TableCell>
                                <TableCell>
                                  <Typography variant="body2" sx={{ minWidth: 80 }}>
                                    {formatCurrencyMXN(product.Total || 0)}
                                  </Typography>
                                </TableCell>
                                <TableCell>
                                  <Typography
                                    variant="body2"
                                    sx={{
                                      minWidth: 80,
                                      color: (product.Revenue || 0) >= 0 ? 'success.main' : 'error.main'
                                    }}
                                  >
                                    {formatCurrencyMXN(product.Revenue || 0)}
                                  </Typography>
                                </TableCell>
                                <TableCell align="center">
                                  <IconButton
                                    color="error"
                                    onClick={() => {
                                      remove(index);
                                      // Recalculate totals after removing product
                                      const updatedProducts = values.products.filter((_, i) => i !== index);
                                      const totals = calculateTotals(updatedProducts);
                                      setFieldValue('SubTotal', totals.SubTotal);
                                      setFieldValue('Tax', totals.Tax);
                                      setFieldValue('Total', totals.Total);
                                    }}
                                  >
                                    <Trash />
                                  </IconButton>
                                </TableCell>
                              </TableRow>
                            ))}
                            {values.products.length === 0 && (
                              <TableRow>
                                <TableCell colSpan={14} align="center">
                                  <Typography color="textSecondary">No hay productos agregados</Typography>
                                </TableCell>
                              </TableRow>
                            )}
                          </TableBody>
                        </Table>
                      </TableContainer>
                    )}
                  </FieldArray>
                </MainCard>
              </Grid>

              {/* Totals */}
              <Grid size={12}>
                <MainCard>
                  <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                    <Box sx={{ minWidth: 300 }}>
                      <Stack spacing={2}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                          <Typography>Subtotal:</Typography>
                          <Typography>{formatCurrencyMXN(values.SubTotal || 0)}</Typography>
                        </Box>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                          <Typography>IVA (16%):</Typography>
                          <Typography>{formatCurrencyMXN(values.Tax || 0)}</Typography>
                        </Box>
                        <Divider />
                        <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                          <Typography variant="h6">Total:</Typography>
                          <Typography variant="h6" color="primary">
                            {formatCurrencyMXN(values.Total || 0)}
                          </Typography>
                        </Box>
                        {/* Métricas adicionales */}
                        
                      </Stack>
                    </Box>
                  </Box>
                </MainCard>
              </Grid>

              {/* Actions */}
              <Grid size={12}>
                <Stack direction="row" spacing={2} justifyContent="flex-end">
                  <Button variant="outlined" onClick={() => navigate('/apps/quotations')}>
                    Cancelar
                  </Button>
                  <Button type="submit" variant="contained">
                    Crear Cotización
                  </Button>
                  <Button 
                    variant="contained" 
                    color="secondary"
                    disabled={creatingAndSending || !customers.find((c: any) => c.Id === values.CustomerId)?.Email}
                    onClick={() => handleCreateAndSendEmail(values)}
                    startIcon={creatingAndSending ? <CircularProgress size={20} /> : undefined}
                  >
                    {creatingAndSending ? 'Creando y Enviando...' : 'Crear y Enviar por Correo'}
                  </Button>
                </Stack>
              </Grid>
            </Grid>
          </Form>
        )}
      </Formik>

      <ProductAddDialog
        open={openProductDialog}
        onClose={() => setOpenProductDialog(false)}
        onAdd={(prod) => {
          if (productPushFunction) {
            const pCalc = calculateProductTotal(prod);
            productPushFunction(pCalc);
            // Recalcular totales (Formik no está accesible aquí directamente; se recalcula en el grid al editar cantidades)
          }
          setOpenProductDialog(false);
        }}
      />
    </>
  );
};

export default CreateQuotation;
