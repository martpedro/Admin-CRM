import { useEffect, useContext, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Formik, Form, FieldArray } from 'formik';
import * as Yup from 'yup';
import {
  Box,
  Button,
  Card,
  CardContent,
  CardHeader,
  Divider,
  FormControl,
  FormControlLabel,
  FormHelperText,
  IconButton,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  Switch,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
  Avatar,
  CircularProgress
} from '@mui/material';
import Grid from '@mui/material/Grid2';
import { Add, Trash } from 'iconsax-react';
import ProductAddDialog, { ProductWithOrigin } from 'components/quotations/ProductAddDialog';
import Breadcrumbs from 'components/@extended/Breadcrumbs';
import MainCard from 'components/MainCard';
import { useQuotation, useQuotationOperations } from 'hooks/useQuotations';
import { useCustomers } from 'hooks/useCustomers';
import { useCompanies, useCompanyOperations } from 'hooks/useCompanies';
import { QuotationProduct } from 'api/quotations';
import { calculateProductTotal, calculateTotals, formatCurrencyMXN } from 'utils/quotation';
import Chip from '@mui/material/Chip';
import JWTContext from 'contexts/JWTContext';
import { getAddressesByCustomer } from 'api/customer';
import QuotationPdfViewer from 'components/quotations/QuotationPdfViewer';
import Loader from 'components/Loader';
import SendQuotationEmailDialog from 'components/quotations/SendQuotationEmailDialog';
import axiosServices from 'utils/axios';
import { sendQuotationEmail, refreshQuotationsCache } from 'api/quotations';
import { useNotifications } from 'utils/notifications';

const validationSchema = Yup.object({
  CustomerId: Yup.number().required('El cliente es requerido'),
  UserId: Yup.number().required('El asesor es requerido'),
  AddressId: Yup.number().required('La dirección es requerida'),
  CompanyId: Yup.number().required('La empresa es requerida'),
  AdvancePayment: Yup.string().required('El anticipo es requerido'),
  LiquidationPayment: Yup.string().required('La liquidación es requerida'),
  TimeCredit: Yup.string().required('El tiempo de crédito es requerido'),
  TimeValidation: Yup.string().required('El tiempo de validación es requerido'),
  products: Yup.array().min(1, 'Debe haber al menos un producto')
});

const EditQuotation = () => {
  const notifications = useNotifications();
  const [openSendEmail, setOpenSendEmail] = useState(false);
  const [sendingEmail, setSendingEmail] = useState(false);
  const [savingAndSending, setSavingAndSending] = useState(false);
  const { id } = useParams();
  const quotationId = Number(id);
  const navigate = useNavigate();
  const { quotation, isLoading } = useQuotation(!isNaN(quotationId) ? quotationId : null);
  const { updateQuotation } = useQuotationOperations();
  const { customers } = useCustomers();
  const { companies } = useCompanies();
  const { getCompanyById } = useCompanyOperations();
  const auth = useContext(JWTContext);

  const [selectedCompany, setSelectedCompany] = useState<any>(null);
  const [selectedCustomer, setSelectedCustomer] = useState<any>(null);
  const [customerAddresses, setCustomerAddresses] = useState<any[]>([]);
  const [advisors, setAdvisors] = useState<any[]>([]);
  const [loadingAdvisors, setLoadingAdvisors] = useState(false);
  const [advisorsError, setAdvisorsError] = useState<string | null>(null);
  const [emissionDate, setEmissionDate] = useState<string>(() => new Date().toISOString().slice(0, 10));
  const [openProductDialog, setOpenProductDialog] = useState(false);
  const [productPushFunction, setProductPushFunction] = useState<((obj: any) => void) | null>(null);
  // Estados PDF removidos: se utiliza componente reutilizable

  // Cargar asesores
  useEffect(() => {
    let active = true;
    const load = async () => {
      setLoadingAdvisors(true);
      setAdvisorsError(null);
      try {
        const list = await (await import('api/quotations')).default.getAdvisors();
        if (!active) return;
        const mapped = Array.isArray(list)
          ? list.map((u: any) => ({
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
            }))
          : [];
        setAdvisors(mapped);
      } catch (e: any) {
        if (!active) return;
        setAdvisorsError(e?.message || 'Error cargando asesores');
      } finally {
        if (active) setLoadingAdvisors(false);
      }
    };
    load();
    return () => {
      active = false;
    };
  }, []);

  // Preparar valores iniciales cuando la cotización esté cargada
  const initialValues = quotation
    ? {
        Id: quotation.Id,
        CustomerId: customers.length > 0 ? quotation.Customer?.Id || 0 : 0,
        UserId: advisors.length > 0 ? quotation.User?.Id || (auth?.user as any)?.Id || 0 : 0,
        AddressId: quotation.address?.Id || 0,
        CompanyId: quotation.Company?.Id || 0,
        AdvancePayment: quotation.AdvancePayment || '',
        LiquidationPayment: quotation.LiquidationPayment || '',
        TimeCredit: quotation.TimeCredit || '',
        TimeValidation: quotation.TimeValidation || '',
        SubTotal: quotation.SubTotal || 0,
        Tax: quotation.Tax || 0,
        Total: quotation.Total || 0,
        products: (quotation.products || []).map((p: QuotationProduct) => ({ ...p }))
      }
    : null;

  // Set selected entities once quotation loaded
  useEffect(() => {
    if (quotation) {
      setSelectedCompany(quotation.Company || null);
      setSelectedCustomer(quotation.Customer || null);
    }
  }, [quotation]);

  // Cargar direcciones cliente si existe
  useEffect(() => {
    const loadAddresses = async () => {
      if (initialValues?.CustomerId) {
        try {
          const list = await getAddressesByCustomer(initialValues.CustomerId);
          setCustomerAddresses(Array.isArray(list) ? list : []);
        } catch {
          setCustomerAddresses([]);
        }
      }
    };
    loadAddresses();
  }, [initialValues?.CustomerId]);

  // Funciones movidas a utils/quotation

  const handleSubmit = async (values: any) => {
    try {
      const result = await updateQuotation(values);
      console.log('Resultado de actualización:', result);

      if (result.success) {
        console.log('Resultado mensaje de actualización:', result);

        notifications.success('Cotización actualizada');
        // Usar función centralizada para refrescar cache
        await refreshQuotationsCache(quotationId);
      } else {
        notifications.error(result.error || 'Error al actualizar');
      }
    } catch (e: any) {
      notifications.error(e?.message || 'Error al actualizar');
    }
  };

  const handleSaveAndSendEmail = async (values: any) => {
    if (!selectedCustomer?.Email) {
      notifications.warning('El cliente no tiene email registrado');
      return;
    }

    setSavingAndSending(true);
    try {
      // Primero guardar la cotización usando la API
      const updateResult = await updateQuotation(values);
      if (!updateResult.success) {
        notifications.error(updateResult.error || 'Error al guardar la cotización');
        return;
      }

      // Luego enviar por correo
      if (quotation?.Id) {
        await sendQuotationEmail({
          quotationId: quotation.Id,
          to: selectedCustomer.Email,
          cc: '',
          message: `Estimado/a ${selectedCustomer.Name},\n\nEsperamos que se encuentre bien. Adjunto encontrará la cotización #${quotation.NumberQuotation} solicitada.\n\nQuedamos a la espera de sus comentarios.\n\nSaludos cordiales.`
        });
      }

      // Usar función centralizada para refrescar cache
      await refreshQuotationsCache(quotationId);

      notifications.success('Cotización guardada y enviada por correo exitosamente');
    } catch (e: any) {
      notifications.error(e?.message || 'Error al guardar y enviar');
    } finally {
      setSavingAndSending(false);
    }
  };

  if (isLoading || !initialValues) {
    return <Loader message="Cargando cotización..." />;
  }

  return (
    <>
      <Breadcrumbs title />
      <Formik enableReinitialize initialValues={initialValues} validationSchema={validationSchema} onSubmit={handleSubmit}>
        {({ values, errors, touched, handleChange, handleBlur, setFieldValue }) => (
          <Form>
            <Grid container spacing={3}>
              {/* Empresa */}
              <Grid size={12}>
                <MainCard title={`Editar Cotización #${quotation?.NumberQuotation || ''}`}>
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
                              } catch {
                                setSelectedCompany(null);
                              }
                            } else {
                              setSelectedCompany(null);
                            }
                          }}
                          onBlur={handleBlur}
                        >
                          <MenuItem value={0}>Seleccionar empresa</MenuItem>
                          {companies.map((company: any) => (
                            <MenuItem key={company.Id} value={company.Id}>
                              {company.Name || 'Sin nombre'}
                            </MenuItem>
                          ))}
                        </Select>
                        {touched.CompanyId && errors.CompanyId && <FormHelperText>{String(errors.CompanyId)}</FormHelperText>}
                      </FormControl>
                      <Button variant="outlined" color="secondary" onClick={() => setOpenSendEmail(true)}>
                        Enviar por correo
                      </Button>
                    </Grid>
                    {selectedCompany && (
                      <Grid size={{ xs: 12, md: 6 }}>
                        <Card variant="outlined">
                          <CardHeader title="Resumen de la Empresa" titleTypographyProps={{ variant: 'h6', fontSize: '1rem' }} />
                          <CardContent sx={{ pt: 0.5, pb: 1 }}>
                            <SendQuotationEmailDialog
                              open={openSendEmail}
                              onClose={() => setOpenSendEmail(false)}
                              loading={sendingEmail}
                              defaultTo={selectedCustomer?.Email || ''}
                              onSend={async ({ to, cc, message }) => {
                                setSendingEmail(true);
                                try {
                                  if (!quotation?.Id) throw new Error('ID de cotización no disponible');
                                  await sendQuotationEmail({
                                    quotationId: quotation.Id,
                                    to,
                                    cc,
                                    message
                                  });
                                  notifications.success('Correo enviado correctamente');
                                  setOpenSendEmail(false);
                                } catch (err: any) {
                                  notifications.error('Error al enviar el correo');
                                } finally {
                                  setSendingEmail(false);
                                }
                              }}
                            />
                            <Grid container spacing={1}>
                              <Grid size={12}>
                                <Typography variant="caption" fontWeight={600} component="span" sx={{ mr: 0.5 }}>
                                  Razón Social:
                                </Typography>
                                <Typography variant="body2" component="span">
                                  {selectedCompany.LegalName || selectedCompany.Name || 'No disponible'}
                                </Typography>
                              </Grid>
                              <Grid size={{ xs: 12, sm: 6 }}>
                                <Typography variant="caption" fontWeight={600} component="span" sx={{ mr: 0.5 }}>
                                  RFC:
                                </Typography>
                                <Typography variant="body2" component="span">
                                  {selectedCompany.TaxId || 'No disponible'}
                                </Typography>
                              </Grid>
                              <Grid size={{ xs: 12, sm: 6 }}>
                                <Typography variant="caption" fontWeight={600} component="span" sx={{ mr: 0.5 }}>
                                  Teléfonos:
                                </Typography>
                                <Typography variant="body2" component="span">
                                  {selectedCompany.Phones || selectedCompany.Phone || 'No disponible'}
                                </Typography>
                              </Grid>
                              <Grid size={{ xs: 12, sm: 6 }}>
                                <Typography variant="caption" fontWeight={600} component="span" sx={{ mr: 0.5 }}>
                                  WhatsApp:
                                </Typography>
                                <Typography variant="body2" component="span">
                                  {selectedCompany.WhatsApp || 'No disponible'}
                                </Typography>
                              </Grid>
                              <Grid size={{ xs: 12, sm: 6 }}>
                                <Typography variant="caption" fontWeight={600} component="span" sx={{ mr: 0.5 }}>
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
                              <Grid size={12}>
                                <Typography variant="caption" fontWeight={600} component="span" sx={{ mr: 0.5 }}>
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
                        value={quotation?.NumberQuotation || 'Generado previamente'}
                        InputProps={{ readOnly: true }}
                      />
                    </Grid>
                  </Grid>
                </MainCard>
              </Grid>

              {/* Cliente */}
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
                            const customer = customers.find((c: any) => c.Id === customerId);
                            if (customer) setSelectedCustomer(customer);
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
                            } catch {
                              setCustomerAddresses([]);
                              setFieldValue('AddressId', 0);
                            }
                          }}
                          onBlur={handleBlur}
                        >
                          <MenuItem value={0}>Seleccionar cliente</MenuItem>
                          {customers.map((customer: any) => (
                            <MenuItem key={customer.Id} value={customer.Id}>
                              {customer.Name} - {customer.Email || 'Sin email'}
                            </MenuItem>
                          ))}
                        </Select>
                        {touched.CustomerId && errors.CustomerId && <FormHelperText>{String(errors.CustomerId)}</FormHelperText>}
                      </FormControl>
                    </Grid>
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
                              {touched.AddressId && errors.AddressId && <FormHelperText>{String(errors.AddressId as any)}</FormHelperText>}
                            </FormControl>
                          ) : (
                            <TextField
                              fullWidth
                              size="small"
                              label="DIRECCIÓN"
                              value={'Sin direcciones registradas'}
                              InputProps={{ readOnly: true }}
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
                          {!loadingAdvisors && !advisorsError && values.UserId !== 0 && !advisors.some((a) => a.Id === values.UserId) && (
                            <MenuItem value={values.UserId} disabled>
                              {(auth?.user as any)?.name || 'Usuario actual'} (cargando permisos)
                            </MenuItem>
                          )}
                          {loadingAdvisors && <MenuItem disabled>Cargando asesores...</MenuItem>}
                          {advisorsError && <MenuItem disabled>{advisorsError}</MenuItem>}
                          {!loadingAdvisors && !advisorsError && advisors.length === 0 && (
                            <MenuItem disabled>No hay asesores disponibles</MenuItem>
                          )}
                          {advisors.map((user: any) => (
                            <MenuItem key={user.Id} value={user.Id}>
                              {user.name || 'Sin nombre'} {user.LastName || ''}
                            </MenuItem>
                          ))}
                        </Select>
                        {touched.UserId && errors.UserId && <FormHelperText>{String(errors.UserId)}</FormHelperText>}
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
                  </Grid>
                </MainCard>
              </Grid>

              {/* Productos */}
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
                    {({ remove }) => (
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
                                    <Chip
                                      size="small"
                                      label={product.Origin === 'catalog' ? 'Catálogo' : 'Manual'}
                                      color={product.Origin === 'catalog' ? 'primary' : 'default'}
                                    />
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
                                      const updatedProducts = [...values.products];
                                      updatedProducts[index] = updatedProduct;
                                      const totals = calculateTotals(updatedProducts as any);
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
                                      const updatedProducts = [...values.products];
                                      updatedProducts[index] = updatedProduct;
                                      const totals = calculateTotals(updatedProducts as any);
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
                                      const updatedProducts = [...values.products];
                                      updatedProducts[index] = updatedProduct;
                                      const totals = calculateTotals(updatedProducts as any);
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
                                      const updatedProducts = [...values.products];
                                      updatedProducts[index] = updatedProduct;
                                      const totals = calculateTotals(updatedProducts as any);
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
                                      const updatedProducts = values.products.filter((_, i) => i !== index) as any;
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

              {/* Totales */}
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
                        <Divider />
                      </Stack>
                    </Box>
                  </Box>
                </MainCard>
              </Grid>

              {/* Acciones */}
              <Grid size={12}>
                <Stack direction="row" spacing={2} justifyContent="flex-end">
                  {quotation?.Id && <QuotationPdfViewer quotationId={quotation.Id} quotationNumber={quotation.NumberQuotation} />}
                  <Button variant="outlined" onClick={() => navigate('/quotations')}>
                    Volver
                  </Button>
                  <Button type="submit" variant="contained">
                    Guardar Cambios
                  </Button>
                  <Button
                    variant="contained"
                    color="secondary"
                    disabled={savingAndSending || !selectedCustomer?.Email}
                    onClick={() => handleSaveAndSendEmail(values)}
                    startIcon={savingAndSending ? <CircularProgress size={20} /> : undefined}
                  >
                    {savingAndSending ? 'Guardando y Enviando...' : 'Guardar y Enviar por Correo'}
                  </Button>
                </Stack>
              </Grid>
            </Grid>
            <ProductAddDialog
              open={openProductDialog}
              onClose={() => setOpenProductDialog(false)}
              onAdd={(prod) => {
                if (productPushFunction) {
                  const pCalc = calculateProductTotal(prod);
                  productPushFunction(pCalc as any);
                  const updatedProducts = [...values.products, pCalc as any];
                  const totals = calculateTotals(updatedProducts as any);
                  setFieldValue('SubTotal', totals.SubTotal);
                  setFieldValue('Tax', totals.Tax);
                  setFieldValue('Total', totals.Total);
                }
                setOpenProductDialog(false);
              }}
            />
            {/* Dialog PDF reemplazado por componente reutilizable */}
          </Form>
        )}
      </Formik>
    </>
  );
};

export default EditQuotation;
