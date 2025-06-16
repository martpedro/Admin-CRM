import { SyntheticEvent, useId, useState } from 'react';
import { useNavigate } from 'react-router';

// material-ui
import Autocomplete from '@mui/material/Autocomplete';
import Button from '@mui/material/Button';
import CardMedia from '@mui/material/CardMedia';
import Divider from '@mui/material/Divider';
import FormControl from '@mui/material/FormControl';
import FormHelperText from '@mui/material/FormHelperText';
import Grid from '@mui/material/Grid2';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import Select from '@mui/material/Select';
import Stack from '@mui/material/Stack';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';

import { DatePicker, LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFnsV3';

// third-party
import { format } from 'date-fns';
import { FieldArray, Form, Formik } from 'formik';
import * as yup from 'yup';

// project-imports
import Breadcrumbs from 'components/@extended/Breadcrumbs';
import CircularLoader from 'components/CircularLoader';
import MainCard from 'components/MainCard';
import InvoiceItem from 'sections/apps/invoice/InvoiceItem';
import AddressModal from 'sections/apps/invoice/AddressModal';
import InvoiceModal from 'sections/apps/invoice/InvoiceModal';

import {
  handlerCustomerTo,
  handlerCustomerFrom,
  handlerPreview,
  insertInvoice,
  useGetInvoice,
  useGetInvoiceMaster,
  selectCountry
} from 'api/invoice';

import { openSnackbar } from 'api/snackbar';
import { APP_DEFAULT_PATH } from 'config';
import incrementer from 'utils/incrementer';

// assets
import { Add, Edit } from 'iconsax-react';

// types
import { CountryType, InvoiceList, InvoiceProps } from 'types/invoice';
import { SnackbarProps } from 'types/snackbar';

const validationSchema = yup.object({
  date: yup.date().required('La fecha de la venta es obligatoria'),
  due_date: yup
    .date()
    .when('date', (date, schema) => date && schema.min(date, 'La fecha de vencimiento no puede ser anterior a la fecha de la venta'))
    .nullable()
    .required('La fecha de vencimiento es obligatoria'),
  customerInfo: yup
    .object({
      name: yup.string().required('La información del receptor es obligatoria')
    })
    .required('La información del receptor es obligatoria'),
  country: yup.object().nullable().required('Por favor selecciona una moneda'),
  status: yup.string().required('El estado es obligatorio'),
  invoice_detail: yup
    .array()
    .required('Los detalles de la factura son obligatorios')
    .of(
      yup.object().shape({
        name: yup.string().required('El nombre del producto es obligatorio')
      })
    )
    .min(1, 'La factura debe tener al menos 1 artículo')
});

function ItemAdd({ push }: { push: (item: any) => void }) {
  const baseId = useId(); // Genera un ID base
  const [idCounter, setIdCounter] = useState(0); // Contador para IDs únicos

  const handleAddItem = () => {
    const newId = `${baseId}-${idCounter}`; // Crea un ID único combinando baseId y contador
    setIdCounter((prev) => prev + 1); // Incrementa el contador
    push({
      id: newId,
      name: '',
      description: '',
      qty: 1,
      price: '1.00'
    });
  };

  return (
    <Button color="primary" startIcon={<Add />} onClick={handleAddItem} variant="dashed" sx={{ bgcolor: 'transparent !important' }}>
      Agregar artículo
    </Button>
  );
}

interface FormProps {
  lists: InvoiceList[];
  invoiceMaster: InvoiceProps;
}

// ==============================|| INVOICE - CREATE ||============================== //

function CreateForm({ lists, invoiceMaster }: FormProps) {
  const navigation = useNavigate();
  const [country, setCountry] = useState<CountryType | null>(invoiceMaster.country || invoiceMaster.countries[2] || null);

  const notesLimit: number = 500;

  const handlerCreate = (values: any) => {
    const newList: InvoiceList = {
      id: Number(incrementer(lists.length)),
      invoice_id: Number(values.invoice_id),
      customer_name: values.cashierInfo?.name,
      email: values.cashierInfo?.email,
      avatar: Number(Math.round(Math.random() * 10)),
      discount: Number(values.discount),
      tax: Number(values.tax),
      date: format(new Date(values.date), 'MM/dd/yyyy'),
      due_date: format(new Date(values.due_date), 'MM/dd/yyyy'),
      quantity: Number(
        values.invoice_detail?.reduce((sum: any, i: any) => {
          return sum + i.qty;
        }, 0)
      ),
      status: values.status,
      cashierInfo: values.cashierInfo,
      customerInfo: values.customerInfo,
      invoice_detail: values.invoice_detail,
      notes: values.notes
    };
    insertInvoice(newList);
    openSnackbar({
      open: true,
      message: 'Factura agregada exitosamente',
      anchorOrigin: { vertical: 'top', horizontal: 'right' },
      variant: 'alert',
      alert: {
        color: 'success'
      }
    } as SnackbarProps);
    navigation('/apps/invoice/list');
  };

  const invoiceDetailsID = useId();

  return (
    <Formik
      initialValues={{
        id: 120,
        invoice_id: Date.now(),
        status: '',
        date: new Date(),
        due_date: null,
        liquidacion: '',
        anticipo: '',
        credito: '',
        cashierInfo: {
          name: 'Belle J. Richter',
          address: '1300 Cooks Mine, NM 87829',
          phone: '305-829-7809',
          email: 'belljrc23@gmail.com'
        },
        customerInfo: {
          address: '',
          email: '',
          name: '',
          phone: ''
        },
        invoice_detail: [
          {
            id: invoiceDetailsID,
            name: '',
            description: '',
            qty: 1,
            price: '12.00',
            image: '',
            supplier_code: '',
            code: '',
            specifications: '',
            inks: '',
            delivery_time: '',
            cost: '',
            print: '',
            unit_price: '',

          }
        ],
        discount: 0,
        tax: 0,
        notes: '',
        country: invoiceMaster.countries[0]
      }}
      validationSchema={validationSchema}
      onSubmit={(values) => {
        handlerCreate(values);
      }}
    >
      {({ handleBlur, errors, handleChange, handleSubmit, values, isValid, setFieldValue, touched }) => {
        const subtotal = values?.invoice_detail.reduce((prev, curr: any) => {
          if (curr.name.trim().length > 0) return prev + Number(curr.price * Math.floor(curr.qty));
          else return prev;
        }, 0);
        const taxRate = (values.tax * subtotal) / 100;
        const discountRate = (values.discount * subtotal) / 100;
        const total = subtotal - discountRate + taxRate;
        return (
          <Form onSubmit={handleSubmit}>
            <Grid container spacing={2}>
              <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                <Stack sx={{ gap: 1 }}>
                  <InputLabel># Cotización</InputLabel>
                  <FormControl sx={{ width: '100%' }}>
                    <TextField
                      required
                      disabled
                      type="number"
                      name="invoice_id"
                      id="invoice_id"
                      value={values.invoice_id}
                      onChange={handleChange}
                    />
                  </FormControl>
                </Stack>
              </Grid>
              <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                <Stack sx={{ gap: 1 }}>
                  <InputLabel>Estado</InputLabel>
                  <FormControl sx={{ width: '100%' }}>
                    <Select
                      value={values.status}
                      displayEmpty
                      name="status"
                      renderValue={(selected) => {
                        if (selected.length === 0) {
                          return <Box sx={{ color: 'secondary.400' }}>Selecciona estado</Box>;
                        }
                        return selected;
                      }}
                      onChange={handleChange}
                      error={Boolean(errors.status && touched.status)}
                    >
                      <MenuItem disabled value="">
                        Selecciona estado
                      </MenuItem>
                      <MenuItem value="start">Iniciando</MenuItem>
                        <MenuItem value="followup">En seguimiento</MenuItem>
                      <MenuItem value="win">Terminada</MenuItem>
                      <MenuItem value="Cancelled">Cancelada</MenuItem>
                    </Select>
                  </FormControl>
                </Stack>
                {touched.status && errors.status && <FormHelperText error={true}>{errors.status}</FormHelperText>}
              </Grid>
              <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                <Stack sx={{ gap: 1 }}>
                  <InputLabel>Fecha de emisión</InputLabel>
                  <FormControl sx={{ width: '100%' }} error={Boolean(touched.date && errors.date)}>
                    <LocalizationProvider dateAdapter={AdapterDateFns}>
                      <DatePicker format="dd/MM/yyyy" value={values.date} onChange={(newValue) => setFieldValue('date', newValue)} />
                    </LocalizationProvider>
                  </FormControl>
                </Stack>
                {touched.date && errors.date && <FormHelperText error={true}>{errors.date as string}</FormHelperText>}
              </Grid>
              <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                <Stack sx={{ gap: 1 }}>
                  <InputLabel>Fecha de validez</InputLabel>
                  <FormControl sx={{ width: '100%' }} error={Boolean(touched.due_date && errors.due_date)}>
                    <LocalizationProvider dateAdapter={AdapterDateFns}>
                      <DatePicker
                        format="dd/MM/yyyy"
                        value={values.due_date}
                        onChange={(newValue) => setFieldValue('due_date', newValue)}
                      />
                    </LocalizationProvider>
                  </FormControl>
                </Stack>
                {touched.due_date && errors.due_date && <FormHelperText error={true}>{errors.due_date as string}</FormHelperText>}
              </Grid>

              <Grid size={{ xs: 12, sm: 6 }}>
                <MainCard sx={{ minHeight: 168 }}>
                  <Grid container spacing={2}>
                    <Grid size={{ xs: 12, sm: 8 }}>
                      <Stack sx={{ gap: 2 }}>
                        <Typography variant="h5">De:</Typography>
                        <Stack sx={{ width: 1 }}>
                          <Typography variant="subtitle1">{values?.cashierInfo?.name}</Typography>
                          <Typography color="secondary">{values?.cashierInfo?.address}</Typography>
                          <Typography color="secondary">{values?.cashierInfo?.phone}</Typography>
                          <Typography color="secondary">{values?.cashierInfo?.email}</Typography>
                        </Stack>
                      </Stack>
                    </Grid>
                    <Grid size={{ xs: 12, sm: 4 }}>
                      <Box sx={{ textAlign: { xs: 'left', sm: 'right' }, color: 'grey.200' }}>
                        <Button
                          variant="outlined"
                          startIcon={<Edit />}
                          color="secondary"
                          onClick={() => handlerCustomerFrom(true)}
                          size="small"
                        >
                          Cambiar
                        </Button>
                        <AddressModal
                          open={invoiceMaster.open}
                          setOpen={(value) => handlerCustomerFrom(value as boolean)}
                          handlerAddress={(address) => setFieldValue('cashierInfo', address)}
                        />
                      </Box>
                    </Grid>
                  </Grid>
                </MainCard>
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <MainCard sx={{ minHeight: 168 }}>
                  <Grid container spacing={2}>
                    <Grid size={{ xs: 12, sm: 8 }}>
                      <Stack sx={{ gap: 2 }}>
                        <Typography variant="h5">Para:</Typography>
                        <Stack sx={{ width: 1 }}>
                          <Typography variant="subtitle1">{values?.customerInfo?.name}</Typography>
                          <Typography color="secondary">{values?.customerInfo?.address}</Typography>
                          <Typography color="secondary">{values?.customerInfo?.phone}</Typography>
                          <Typography color="secondary">{values?.customerInfo?.email}</Typography>
                        </Stack>
                      </Stack>
                    </Grid>
                    <Grid size={{ xs: 12, sm: 4 }}>
                      <Box sx={{ textAlign: 'right', color: 'grey.200' }}>
                        <Button
                          size="small"
                          startIcon={<Add />}
                          color="secondary"
                          variant="outlined"
                          onClick={() => handlerCustomerTo(true)}
                        >
                          Agregar
                        </Button>
                        <AddressModal
                          open={invoiceMaster.isCustomerOpen}
                          setOpen={(value) => handlerCustomerTo(value as boolean)}
                          handlerAddress={(value) => setFieldValue('customerInfo', value)}
                        />
                      </Box>
                    </Grid>
                  </Grid>
                </MainCard>
                {touched.customerInfo && errors.customerInfo && (
                  <FormHelperText error={true}>{errors?.customerInfo?.name as string}</FormHelperText>
                )}
              </Grid>
              <Grid size={{ xs: 12 }}>
                <Stack direction="row" spacing={2}>
                  <Stack sx={{ gap: 1, flex: 1 }}>
                    <InputLabel>Anticipo</InputLabel>
                    <TextField
                      name="anticipo"
                      value={values.anticipo || ''}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      variant="outlined"
                      fullWidth
                      type="text"
                    />
                  </Stack>
                  <Stack sx={{ gap: 1, flex: 1 }}>
                    <InputLabel>Liquidación</InputLabel>
                    <TextField
                      name="liquidacion"
                      value={values.liquidacion || ''}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      variant="outlined"
                      fullWidth
                      type="text"
                    />
                  </Stack>
                  <Stack sx={{ gap: 1, flex: 1 }}>
                    <InputLabel>Crédito</InputLabel>
                    <TextField
                      name="credito"
                      value={values.credito || ''}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      variant="outlined"
                      fullWidth
                      type="text"
                    />
                  </Stack>
                </Stack>
              </Grid>

              <Grid size={12}>
                <Typography variant="h5">Detalle</Typography>
              </Grid>
              <Grid size={12}>
                <FieldArray
                  name="invoice_detail"
                  render={({ remove, push }) => {
                    return (
                      <>
                        <TableContainer>
                          <Table sx={{ minWidth: 650 }}>
                            <TableHead>
                              <TableRow>
                                <TableCell>#</TableCell>
                                <TableCell>Imagen</TableCell>
                                <TableCell>Código de proveedor</TableCell>
                                <TableCell>Código</TableCell>
                                <TableCell>Especificaciones</TableCell>
                                <TableCell>Tintas</TableCell>
                                <TableCell>Tiempo de entrega</TableCell>
                                <TableCell align="right">Cantidad</TableCell>
                                <TableCell align="right">Costo</TableCell>
                                <TableCell align="right">Impresión</TableCell>
                                <TableCell align="right">Precio Unitario</TableCell>
                                <TableCell align="right">Importe</TableCell>
                                <TableCell align="center">Acción</TableCell>
                              </TableRow>
                            </TableHead>
                            <TableBody>
                              {values.invoice_detail?.map((item: any, index: number) => (
                                <TableRow key={item.id}>
                                  <TableCell>{values.invoice_detail.indexOf(item) + 1}</TableCell>
                                  <InvoiceItem
                                    key={item.id}
                                    id={item.id}
                                    index={index}
                                    name={item.name}
                                    country={country}
                                    description={item.description}
                                    qty={item.qty}
                                    price={item.price}
                                    image= {item.image}
                                    supplier_code= {item.supplier_code}
                                    code= {item.code}
                                    specifications= {item.specifications}
                                    inks= {item.inks}
                                    delivery_time= {item.delivery_time}
                                    cost= {item.cost}
                                    print= {item.print}
                                    unit_price= {item.unit_price}
                                    onDeleteItem={(index: number) => remove(index)}
                                    onEditItem={handleChange}
                                    Blur={handleBlur}
                                    errors={errors}
                                    touched={touched}
                                    lastItem={values?.invoice_detail?.length === 1}
                                  />
                                </TableRow>
                              ))}
                            </TableBody>
                          </Table>
                        </TableContainer>
                        <Divider />
                        {touched.invoice_detail && errors.invoice_detail && !Array.isArray(errors?.invoice_detail) && (
                          <Stack direction="row" sx={{ justifyContent: 'center', p: 1.5 }}>
                            <FormHelperText error={true}>{errors.invoice_detail as string}</FormHelperText>
                          </Stack>
                        )}
                        <Grid container sx={{ justifyContent: 'space-between' }}>
                          <Grid size={{ xs: 12, md: 8 }}>
                            <Box sx={{ pt: 2.5, pr: 2.5, pb: 2.5, pl: 0 }}>
                              <ItemAdd push={push} />
                            </Box>
                          </Grid>
                          <Grid size={{ xs: 12, md: 4 }}>
                            <Grid container spacing={2} sx={{ justifyContent: 'space-between', pt: 2.5, pb: 2.5 }}>
                              <Grid size={6}>
                                <Stack sx={{ gap: 1 }}>
                                  <InputLabel>Descuento (%)</InputLabel>
                                  <TextField
                                    type="number"
                                    fullWidth
                                    name="discount"
                                    id="discount"
                                    placeholder="0.0"
                                    value={values.discount}
                                    onChange={handleChange}
                                    slotProps={{ htmlInput: { step: 'any', min: 0 } }}
                                  />
                                </Stack>
                              </Grid>
                              <Grid size={6}>
                                <Stack sx={{ gap: 1 }}>
                                  <InputLabel>Impuesto (%)</InputLabel>
                                  <TextField
                                    type="number"
                                    fullWidth
                                    name="tax"
                                    id="tax"
                                    placeholder="0.0"
                                    value={values.tax}
                                    onChange={handleChange}
                                    slotProps={{ htmlInput: { step: 'any', min: 0 } }}
                                  />
                                </Stack>
                              </Grid>
                            </Grid>
                            <Grid size={12}>
                              <Stack sx={{ gap: 2 }}>
                                <Stack direction="row" sx={{ justifyContent: 'space-between' }}>
                                  <Typography sx={{ color: 'secondary.main' }}>Subtotal:</Typography>
                                  <Typography>{`${country?.prefix} ${subtotal ? subtotal.toFixed(2) : 1}`}</Typography>
                                </Stack>
                                <Stack direction="row" sx={{ justifyContent: 'space-between' }}>
                                  <Typography sx={{ color: 'secondary.main' }}>Descuento:</Typography>
                                  <Typography variant="h6" sx={{ color: 'success.main' }}>
                                    {`${country?.prefix} ${discountRate.toFixed(2)}`}
                                  </Typography>
                                </Stack>
                                <Stack direction="row" sx={{ justifyContent: 'space-between' }}>
                                  <Typography sx={{ color: 'secondary.main' }}>Impuesto:</Typography>
                                  <Typography>{`${country?.prefix} ${taxRate.toFixed(2)}`}</Typography>
                                </Stack>
                                <Stack direction="row" sx={{ justifyContent: 'space-between' }}>
                                  <Typography variant="subtitle1">Total:</Typography>
                                  <Typography variant="subtitle1">
                                    {total === undefined || total === null || total === 0
                                      ? `${country?.prefix} 1`
                                      : `${country?.prefix} ${total % 1 === 0 ? total : total.toFixed(2)}`}
                                  </Typography>
                                </Stack>
                              </Stack>
                            </Grid>
                          </Grid>
                        </Grid>
                      </>
                    );
                  }}
                />
              </Grid>
              <Grid size={12}>
                <Stack sx={{ gap: 1 }}>
                  <InputLabel>Notas</InputLabel>
                  <TextField
                    placeholder="Notas"
                    rows={3}
                    value={values.notes}
                    multiline
                    name="notes"
                    onChange={handleChange}
                    helperText={`${values.notes.length} / ${notesLimit}`}
                    sx={{ width: '100%', '& .MuiFormHelperText-root': { mr: 0, display: 'flex', justifyContent: 'flex-end' } }}
                    slotProps={{ htmlInput: { maxLength: notesLimit } }}
                  />
                </Stack>
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <Stack sx={{ gap: 1 }}>
                  <InputLabel>Selecciona moneda*</InputLabel>
                  <FormControl sx={{ width: { xs: '100%', sm: 250 } }}>
                    <Autocomplete
                      id="country-select"
                      options={invoiceMaster.countries}
                      defaultValue={invoiceMaster.country}
                      onChange={(event: SyntheticEvent, value: CountryType | null) => {
                        setCountry(value);
                        setFieldValue('country', value);
                        selectCountry(value);
                      }}
                      getOptionLabel={(option) => option.label}
                      value={country}
                      autoHighlight
                      clearIcon={null}
                      renderOption={({ key, ...props }, option) => (
                        <Stack component="li" direction="row" key={key} sx={{ gap: 1, alignItems: 'center' }} {...props}>
                          {option.code && (
                            <CardMedia
                              component="img"
                              loading="lazy"
                              className="flagImg"
                              sx={{ width: 20, height: 14 }}
                              alt={`${option.code.toLowerCase()}.png`}
                              src={`https://flagcdn.com/w20/${option.code.toLowerCase()}.png`}
                            />
                          )}
                          {option.label}
                        </Stack>
                      )}
                      renderInput={(params) => {
                        const selected = invoiceMaster.countries.find((option: CountryType) => option.code === country?.code);
                        return (
                          <TextField
                            {...params}
                            name="country"
                            placeholder="Selecciona"
                            value={values.country?.label || ''} // Controlled value for the TextField
                            error={touched.country && Boolean(errors.country)}
                            helperText={
                              touched.country &&
                              (Array.isArray(errors.country)
                                ? errors.country.join(', ')
                                : typeof errors.country === 'string' && errors.country)
                            }
                            sx={{ '.flagImg': { objectFit: 'contain' } }}
                            slotProps={{
                              input: {
                                ...params.InputProps,
                                startAdornment: (
                                  <>
                                    {selected && selected.code && (
                                      <CardMedia
                                        component="img"
                                        style={{ marginRight: 6 }}
                                        loading="lazy"
                                        sx={{ width: 20, height: 14 }}
                                        className="flagImg"
                                        alt={`${selected.code.toLowerCase()}.png`}
                                        src={`https://flagcdn.com/w20/${selected.code.toLowerCase()}.png`}
                                      />
                                    )}
                                  </>
                                )
                              }
                            }}
                          />
                        );
                      }}
                    />
                  </FormControl>
                </Stack>
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <Stack direction="row" sx={{ gap: 2, justifyContent: 'flex-end', alignItems: 'flex-end', height: 1 }}>
                  <Button
                    variant="outlined"
                    color="secondary"
                    disabled={values.status === '' || !isValid}
                    sx={{
                      '&:disabled:hover': {
                        color: 'secondary.light',
                        bgcolor: 'secondary.200',
                        borderColor: 'secondary.light'
                      },
                      '&:disabled': {
                        boxShadow: 'none',
                        '&:after': {
                          boxShadow: 'none'
                        }
                      },
                      color: 'secondary.dark'
                    }}
                    onClick={() => handlerPreview(true)}
                  >
                    Vista previa
                  </Button>
                  <Button variant="outlined" color="secondary" sx={{ color: 'secondary.dark' }}>
                    Guardar
                  </Button>
                  <Button color="primary" variant="contained" type="submit">
                    Crear y enviar
                  </Button>
                  <InvoiceModal
                    isOpen={invoiceMaster.isOpen}
                    setIsOpen={(value: any) => handlerPreview(value)}
                    key={values.invoice_id}
                    invoiceMaster={invoiceMaster}
                    invoiceInfo={{
                      ...values,
                      subtotal,
                      taxRate,
                      discountRate,
                      total
                    }}
                    items={values?.invoice_detail}
                    onAddNextInvoice={() => handlerPreview(false)}
                  />
                </Stack>
              </Grid>
            </Grid>
          </Form>
        );
      }}
    </Formik>
  );
}

// ==============================|| INVOICE - CREATE ||============================== //

export default function Create() {
  const { invoice } = useGetInvoice();
  const { invoiceMasterLoading, invoiceMaster } = useGetInvoiceMaster();

  const isLoader = invoiceMasterLoading || invoiceMaster === undefined;
  const loader = (
    <Box sx={{ height: 'calc(100vh - 310px)' }}>
      <CircularLoader />
    </Box>
  );

  let breadcrumbLinks = [
    { title: 'home', to: APP_DEFAULT_PATH },
    { title: 'invoice', to: '/apps/invoice/dashboard' },
    { title: 'create invoice' }
  ];

  return (
    <>
      <Breadcrumbs custom heading="new invoice" links={breadcrumbLinks} />
      <MainCard>{isLoader ? loader : <CreateForm {...{ lists: invoice, invoiceMaster }} />}</MainCard>
    </>
  );
}
