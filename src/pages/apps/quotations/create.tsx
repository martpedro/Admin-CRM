import { useState, useEffect } from 'react';
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
  Grid,
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
  FormHelperText,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Tab,
  Tabs,
  Avatar
} from '@mui/material';

// third-party
import { enqueueSnackbar } from 'notistack';

// project-imports
import Breadcrumbs from 'components/@extended/Breadcrumbs';
import MainCard from 'components/MainCard';
import { useQuotationOperations } from 'hooks/useQuotations';
import { useCustomers } from 'hooks/useCustomers';
import { useUsers } from 'hooks/useUsers';
import { useCompanies, useCompanyOperations } from 'hooks/useCompanies';

// assets
import { Add, Trash, SearchNormal1, DocumentUpload } from 'iconsax-react';

// types
import { QuotationCreate, QuotationProduct } from 'api/quotations';

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
  const { createQuotation } = useQuotationOperations();
  const { customers } = useCustomers();
  const { users } = useUsers();
  const { companies } = useCompanies();
  const { getCompanyById } = useCompanyOperations();

  const [selectedCustomer, setSelectedCustomer] = useState<CustomerList | null>(null);
  const [customerAddresses, setCustomerAddresses] = useState<any[]>([]);
  const [selectedCompany, setSelectedCompany] = useState<any>(null);
  const [openProductDialog, setOpenProductDialog] = useState(false);
  const [productSearchMode, setProductSearchMode] = useState(0); // 0: Search API, 1: Manual
  const [searchCode, setSearchCode] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [productPushFunction, setProductPushFunction] = useState<((obj: any) => void) | null>(null);

  const initialValues: QuotationCreate = {
    CustomerId: 0,
    UserId: 0,
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

  const initialProduct: QuotationProduct = {
    Image: '',
    CodeVendor: '',
    Code: '',
    Description: '',
    Specifications: '',
    Inks: '',
    DeliveryTime: '',
    Quantity: 1,
    VendorCost: 0,
    PrintCost: 0,
    UnitPrice: 0,
    Total: 0,
    Revenue: 0,
    Commission: 0
  };

  const [manualProduct, setManualProduct] = useState<QuotationProduct>(initialProduct);

  const calculateProductTotal = (product: QuotationProduct) => {
    const total = product.Quantity * product.UnitPrice;
    const totalCost = (product.VendorCost * product.Quantity) + (product.PrintCost * product.Quantity);
    const revenue = total - totalCost;
    return {
      ...product,
      Total: total,
      Revenue: revenue,
      Commission: revenue * 0.1 // Assuming 10% commission
    };
  };

  const calculateTotals = (products: QuotationProduct[]) => {
    const subtotal = products.reduce((sum, product) => sum + product.Total, 0);
    const tax = subtotal * 0.19; // 19% IVA
    const total = subtotal + tax;
    
    return {
      SubTotal: subtotal,
      Tax: tax,
      Total: total
    };
  };

  const handleSubmit = async (values: QuotationCreate) => {
    try {
      const result = await createQuotation(values);
      if (result.success) {
        enqueueSnackbar('Cotización creada exitosamente', { variant: 'success' });
        navigate('/apps/quotations');
      } else {
        enqueueSnackbar(result.error || 'Error al crear la cotización', { variant: 'error' });
      }
    } catch (error) {
      enqueueSnackbar('Error inesperado al crear la cotización', { variant: 'error' });
    }
  };

  // Buscar producto por código en la API
  const searchProductByCode = async () => {
    if (!searchCode.trim()) {
      enqueueSnackbar('Ingrese un código para buscar', { variant: 'warning' });
      return;
    }

    setIsSearching(true);
    try {
      // Aquí debes reemplazar con tu endpoint real de búsqueda de productos
      // const response = await axios.get(`/api/products/search/${searchCode}`);
      // const productData = response.data;
      
      // Simulación de búsqueda por ahora
      const productData = {
        Image: 'https://via.placeholder.com/150',
        CodeVendor: 'VND001',
        Code: searchCode,
        Description: 'Producto encontrado - ' + searchCode,
        Specifications: 'Especificaciones del producto',
        Inks: 'CMYK',
        DeliveryTime: '5-7 días',
        Quantity: 1,
        VendorCost: 100,
        PrintCost: 50,
        UnitPrice: 200,
        Total: 200,
        Revenue: 50,
        Commission: 5
      };

      setManualProduct(productData);
      enqueueSnackbar('Producto encontrado', { variant: 'success' });
    } catch (error) {
      enqueueSnackbar('Producto no encontrado', { variant: 'error' });
    } finally {
      setIsSearching(false);
    }
  };

  // Resetear formulario de producto manual
  const resetManualProduct = () => {
    setManualProduct(initialProduct);
    setSearchCode('');
  };

  // Agregar producto desde el diálogo
  const addProductFromDialog = () => {
    if (!productPushFunction) return;

    if (productSearchMode === 0 && !manualProduct.Code) {
      enqueueSnackbar('Debe buscar un producto primero', { variant: 'warning' });
      return;
    }

    if (productSearchMode === 1) {
      // Validar campos obligatorios para modo manual
      if (!manualProduct.Code || !manualProduct.Description || manualProduct.UnitPrice <= 0) {
        enqueueSnackbar('Complete los campos obligatorios: Código, Descripción y Precio Unitario', { variant: 'warning' });
        return;
      }
    }

    const productToAdd = calculateProductTotal(manualProduct);
    productPushFunction(productToAdd);
    
    // Cerrar diálogo y resetear
    setOpenProductDialog(false);
    resetManualProduct();
    enqueueSnackbar('Producto agregado exitosamente', { variant: 'success' });
  };

  // Manejar carga de imagen
  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Aquí puedes implementar la subida real de la imagen
      // Por ahora, crear una URL temporal
      const imageUrl = URL.createObjectURL(file);
      setManualProduct(prev => ({ ...prev, Image: imageUrl }));
      enqueueSnackbar('Imagen cargada', { variant: 'success' });
    }
  };

  return (
    <>
      <Breadcrumbs
        title
      />

      <Formik
        initialValues={initialValues}
        validationSchema={validationSchema}
        onSubmit={handleSubmit}
      >
        {({ values, errors, touched, handleChange, handleBlur, setFieldValue }) => (
          <Form>
            <Grid container spacing={3}>
              {/* Company Selection */}
              <Grid item xs={12}>
                <MainCard title="Información de la Empresa">
                  <Grid container spacing={3}>
                    <Grid item xs={12} md={6}>
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
                          {Array.isArray(companies) && companies.map((company: any) => (
                            <MenuItem key={company.Id} value={company.Id}>
                              {company.Name || 'Sin nombre'}
                            </MenuItem>
                          ))}
                        </Select>
                        {touched.CompanyId && errors.CompanyId && (
                          <FormHelperText>{errors.CompanyId}</FormHelperText>
                        )}
                      </FormControl>
                    </Grid>

                    {selectedCompany && (
                      <Grid item xs={12} md={6}>
                        <Card variant="outlined">
                          <CardHeader
                            title="Resumen de la Empresa"
                            titleTypographyProps={{ variant: 'h6', fontSize: '1rem' }}
                          />
                          <CardContent sx={{ pt: 1 }}>
                            <Stack spacing={1.25}>
                              <Box>
                                <Typography variant="body2" color="textSecondary">Razón Social:</Typography>
                                <Typography variant="body2">{selectedCompany.LegalName || selectedCompany.Name || 'No disponible'}</Typography>
                              </Box>

                              <Box>
                                <Typography variant="body2" color="textSecondary">RFC:</Typography>
                                <Typography variant="body2">{selectedCompany.TaxId || 'No disponible'}</Typography>
                              </Box>

                              <Box>
                                <Typography variant="body2" color="textSecondary">Dirección:</Typography>
                                <Typography variant="body2">{selectedCompany.Address || 'No disponible'}</Typography>
                              </Box>

                              <Box>
                                <Typography variant="body2" color="textSecondary">Teléfonos:</Typography>
                                <Typography variant="body2">{selectedCompany.Phones || selectedCompany.Phone || 'No disponible'}</Typography>
                              </Box>

                              <Box>
                                <Typography variant="body2" color="textSecondary">WhatsApp:</Typography>
                                <Typography variant="body2">{selectedCompany.WhatsApp || 'No disponible'}</Typography>
                              </Box>

                              <Box>
                                <Typography variant="body2" color="textSecondary">Página:</Typography>
                                {selectedCompany.WebPage ? (
                                  <Typography variant="body2" color="primary">
                                    <a
                                      href={selectedCompany.WebPage.startsWith('http') ? selectedCompany.WebPage : `https://${selectedCompany.WebPage}`}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      style={{ color: 'inherit', textDecoration: 'none' }}
                                    >
                                      {selectedCompany.WebPage}
                                    </a>
                                  </Typography>
                                ) : (
                                  <Typography variant="body2">No disponible</Typography>
                                )}
                              </Box>
                            </Stack>
                          </CardContent>
                        </Card>
                      </Grid>
                    )}
                  </Grid>
                </MainCard>
              </Grid>

              {/* Customer Information */}
              <Grid item xs={12}>
                <MainCard title="Información del Cliente">
                  <Grid container spacing={3}>
                    <Grid item xs={12} md={6}>
                      <FormControl fullWidth error={Boolean(touched.CustomerId && errors.CustomerId)}>
                        <InputLabel>Cliente</InputLabel>
                        <Select
                          name="CustomerId"
                          value={values.CustomerId}
                          onChange={(e) => {
                            const customerId = e.target.value as number;
                            setFieldValue('CustomerId', customerId);
                            const customer = customers.find((c: CustomerList) => c.Id === customerId);
                            if (customer) {
                              setSelectedCustomer(customer);
                            }
                            // Here you would fetch customer addresses
                            // setCustomerAddresses(customer?.addresses || []);
                          }}
                          onBlur={handleBlur}
                        >
                          <MenuItem value={0}>Seleccionar cliente</MenuItem>
                          {Array.isArray(customers) && customers.map((customer: CustomerList) => (
                            <MenuItem key={customer.Id} value={customer.Id}>
                              {customer.Name} - {customer.Email || 'Sin email'}
                            </MenuItem>
                          ))}
                        </Select>
                        {touched.CustomerId && errors.CustomerId && (
                          <FormHelperText>{errors.CustomerId}</FormHelperText>
                        )}
                      </FormControl>
                    </Grid>

                    <Grid item xs={12} md={6}>
                      <FormControl fullWidth error={Boolean(touched.UserId && errors.UserId)}>
                        <InputLabel>Asesor</InputLabel>
                        <Select
                          name="UserId"
                          value={values.UserId}
                          onChange={handleChange}
                          onBlur={handleBlur}
                        >
                          <MenuItem value={0}>Seleccionar asesor</MenuItem>
                          {Array.isArray(users) && users.map((user: ApiUser) => (
                            <MenuItem key={user.Id} value={user.Id}>
                              {user.name || 'Sin nombre'} {user.LastName || ''}
                            </MenuItem>
                          ))}
                        </Select>
                        {touched.UserId && errors.UserId && (
                          <FormHelperText>{errors.UserId}</FormHelperText>
                        )}
                      </FormControl>
                    </Grid>

                    <Grid item xs={12} md={6}>
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

                    <Grid item xs={12} md={6}>
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

                    <Grid item xs={12} md={6}>
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

                    <Grid item xs={12} md={6}>
                      <TextField
                        fullWidth
                        name="TimeValidation"
                        label="Tiempo de Validación"
                        value={values.TimeValidation}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        error={Boolean(touched.TimeValidation && errors.TimeValidation)}
                        helperText={touched.TimeValidation && errors.TimeValidation}
                      />
                    </Grid>
                  </Grid>
                </MainCard>
              </Grid>

              {/* Products */}
              <Grid item xs={12}>
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
                              <TableCell>Código</TableCell>
                              <TableCell>Especificaciones</TableCell>
                              <TableCell>Tintas</TableCell>
                              <TableCell>Tiempo de Entrega</TableCell>
                              <TableCell>Cantidad</TableCell>
                              <TableCell>Costo</TableCell>
                              <TableCell>Impresión</TableCell>
                              <TableCell>Precio Unitario</TableCell>
                              <TableCell>Total</TableCell>
                              <TableCell>Utilidad</TableCell>
                              <TableCell align="center">Acciones</TableCell>
                            </TableRow>
                          </TableHead>
                          <TableBody>
                            {values.products.map((product, index) => (
                              <TableRow key={index}>
                                <TableCell>
                                  <Avatar
                                    src={product.Image}
                                    alt={product.Code}
                                    sx={{ width: 50, height: 50 }}
                                    variant="rounded"
                                  >
                                    {product.Code?.charAt(0) || 'P'}
                                  </Avatar>
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
                                    name={`products[${index}].Inks`}
                                    value={product.Inks || ''}
                                    onChange={handleChange}
                                    placeholder="Tintas"
                                    sx={{ minWidth: 100 }}
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
                                    inputProps={{ min: 0, step: 0.01 }}
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
                                    inputProps={{ min: 0, step: 0.01 }}
                                    sx={{ width: 100 }}
                                  />
                                </TableCell>
                                <TableCell>
                                  <TextField
                                    size="small"
                                    type="number"
                                    name={`products[${index}].UnitPrice`}
                                    value={product.UnitPrice || 0}
                                    onChange={(e) => {
                                      const unitPrice = parseFloat(e.target.value) || 0;
                                      const updatedProduct = calculateProductTotal({
                                        ...product,
                                        UnitPrice: unitPrice
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
                                    inputProps={{ min: 0, step: 0.01 }}
                                    sx={{ width: 120 }}
                                  />
                                </TableCell>
                                <TableCell>
                                  <Typography variant="body2" sx={{ minWidth: 80 }}>
                                    ${(product.Total || 0).toLocaleString('es-CO')}
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
                                    ${(product.Revenue || 0).toLocaleString('es-CO')}
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
                                <TableCell colSpan={12} align="center">
                                  <Typography color="textSecondary">
                                    No hay productos agregados
                                  </Typography>
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
              <Grid item xs={12}>
                <MainCard>
                  <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                    <Box sx={{ minWidth: 300 }}>
                      <Stack spacing={2}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                          <Typography>Subtotal:</Typography>
                          <Typography>${(values.SubTotal || 0).toLocaleString('es-CO')}</Typography>
                        </Box>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                          <Typography>IVA (19%):</Typography>
                          <Typography>${(values.Tax || 0).toLocaleString('es-CO')}</Typography>
                        </Box>
                        <Divider />
                        <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                          <Typography variant="h6">Total:</Typography>
                          <Typography variant="h6" color="primary">
                            ${(values.Total || 0).toLocaleString('es-CO')}
                          </Typography>
                        </Box>
                      </Stack>
                    </Box>
                  </Box>
                </MainCard>
              </Grid>

              {/* Actions */}
              <Grid item xs={12}>
                <Stack direction="row" spacing={2} justifyContent="flex-end">
                  <Button
                    variant="outlined"
                    onClick={() => navigate('/apps/quotations')}
                  >
                    Cancelar
                  </Button>
                  <Button
                    type="submit"
                    variant="contained"
                  >
                    Crear Cotización
                  </Button>
                </Stack>
              </Grid>
            </Grid>
          </Form>
        )}
      </Formik>

      {/* Dialog for Adding Products */}
      <Dialog open={openProductDialog} onClose={() => setOpenProductDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle>
          Agregar Producto
        </DialogTitle>
        <DialogContent>
          <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
            <Tabs value={productSearchMode} onChange={(e, newValue) => setProductSearchMode(newValue)}>
              <Tab icon={<SearchNormal1 />} label="Buscar por Código" />
              <Tab icon={<DocumentUpload />} label="Agregar Manualmente" />
            </Tabs>
          </Box>

          {productSearchMode === 0 ? (
            // Búsqueda por código API
            <Box>
              <Typography variant="h6" gutterBottom>
                Buscar Producto por Código
              </Typography>
              <Stack direction="row" spacing={2} sx={{ mb: 3 }}>
                <TextField
                  fullWidth
                  label="Código del Producto"
                  value={searchCode}
                  onChange={(e) => setSearchCode(e.target.value)}
                  placeholder="Ingrese el código del producto"
                  onKeyPress={(e) => e.key === 'Enter' && searchProductByCode()}
                />
                <Button
                  variant="contained"
                  onClick={searchProductByCode}
                  disabled={isSearching}
                  startIcon={<SearchNormal1 />}
                >
                  {isSearching ? 'Buscando...' : 'Buscar'}
                </Button>
              </Stack>

              {manualProduct.Code && (
                <Card variant="outlined">
                  <CardContent>
                    <Grid container spacing={2}>
                      <Grid item xs={12} md={3}>
                        <Avatar
                          src={manualProduct.Image}
                          sx={{ width: 100, height: 100 }}
                          variant="rounded"
                        >
                          {manualProduct.Code?.charAt(0)}
                        </Avatar>
                      </Grid>
                      <Grid item xs={12} md={9}>
                        <Typography variant="h6">{manualProduct.Description}</Typography>
                        <Typography color="textSecondary">Código: {manualProduct.Code}</Typography>
                        <Typography color="textSecondary">Especificaciones: {manualProduct.Specifications}</Typography>
                        <Typography color="textSecondary">Tiempo de entrega: {manualProduct.DeliveryTime}</Typography>
                        <Typography variant="h6" color="primary">
                          Precio: ${manualProduct.UnitPrice.toLocaleString('es-CO')}
                        </Typography>
                      </Grid>
                    </Grid>
                  </CardContent>
                </Card>
              )}
            </Box>
          ) : (
            // Modo manual
            <Box>
              <Typography variant="h6" gutterBottom>
                Agregar Producto Manualmente
              </Typography>
              <Grid container spacing={3}>
                <Grid item xs={12}>
                  <Stack direction="row" spacing={2} alignItems="center">
                    <Avatar
                      src={manualProduct.Image}
                      sx={{ width: 80, height: 80 }}
                      variant="rounded"
                    >
                      {manualProduct.Code?.charAt(0) || 'P'}
                    </Avatar>
                    <Box>
                      <input
                        accept="image/*"
                        style={{ display: 'none' }}
                        id="image-upload"
                        type="file"
                        onChange={handleImageUpload}
                      />
                      <label htmlFor="image-upload">
                        <Button variant="outlined" component="span" startIcon={<DocumentUpload />}>
                          Cargar Imagen
                        </Button>
                      </label>
                    </Box>
                  </Stack>
                </Grid>

                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Código *"
                    value={manualProduct.Code}
                    onChange={(e) => setManualProduct(prev => ({ ...prev, Code: e.target.value }))}
                  />
                </Grid>

                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Código del Proveedor"
                    value={manualProduct.CodeVendor}
                    onChange={(e) => setManualProduct(prev => ({ ...prev, CodeVendor: e.target.value }))}
                  />
                </Grid>

                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Descripción *"
                    value={manualProduct.Description}
                    onChange={(e) => setManualProduct(prev => ({ ...prev, Description: e.target.value }))}
                  />
                </Grid>

                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Especificaciones"
                    multiline
                    rows={3}
                    value={manualProduct.Specifications}
                    onChange={(e) => setManualProduct(prev => ({ ...prev, Specifications: e.target.value }))}
                  />
                </Grid>

                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Tintas"
                    value={manualProduct.Inks}
                    onChange={(e) => setManualProduct(prev => ({ ...prev, Inks: e.target.value }))}
                  />
                </Grid>

                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Tiempo de Entrega"
                    value={manualProduct.DeliveryTime}
                    onChange={(e) => setManualProduct(prev => ({ ...prev, DeliveryTime: e.target.value }))}
                  />
                </Grid>

                <Grid item xs={12} md={3}>
                  <TextField
                    fullWidth
                    label="Cantidad"
                    type="number"
                    value={manualProduct.Quantity}
                    onChange={(e) => setManualProduct(prev => ({ ...prev, Quantity: parseInt(e.target.value) || 1 }))}
                    inputProps={{ min: 1 }}
                  />
                </Grid>

                <Grid item xs={12} md={3}>
                  <TextField
                    fullWidth
                    label="Costo Proveedor"
                    type="number"
                    value={manualProduct.VendorCost}
                    onChange={(e) => setManualProduct(prev => ({ ...prev, VendorCost: parseFloat(e.target.value) || 0 }))}
                    inputProps={{ min: 0, step: 0.01 }}
                  />
                </Grid>

                <Grid item xs={12} md={3}>
                  <TextField
                    fullWidth
                    label="Costo Impresión"
                    type="number"
                    value={manualProduct.PrintCost}
                    onChange={(e) => setManualProduct(prev => ({ ...prev, PrintCost: parseFloat(e.target.value) || 0 }))}
                    inputProps={{ min: 0, step: 0.01 }}
                  />
                </Grid>

                <Grid item xs={12} md={3}>
                  <TextField
                    fullWidth
                    label="Precio Unitario *"
                    type="number"
                    value={manualProduct.UnitPrice}
                    onChange={(e) => setManualProduct(prev => ({ ...prev, UnitPrice: parseFloat(e.target.value) || 0 }))}
                    inputProps={{ min: 0, step: 0.01 }}
                  />
                </Grid>
              </Grid>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenProductDialog(false)}>
            Cancelar
          </Button>
          <Button onClick={resetManualProduct} variant="outlined">
            Limpiar
          </Button>
          <Button
            variant="contained"
            onClick={addProductFromDialog}
          >
            Agregar Producto
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default CreateQuotation;
