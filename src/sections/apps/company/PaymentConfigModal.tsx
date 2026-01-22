import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Grid,
  TextField,
  FormGroup,
  FormControlLabel,
  Checkbox,
  Typography,
  Box,
  Chip,
  Stack,
  Switch,
  Divider,
  Tabs,
  Tab,
  Alert
} from '@mui/material';
import { Formik, Form } from 'formik';
import * as Yup from 'yup';
import { PaymentConfiguration, AcceptedPaymentMethods, AcceptedCards } from 'types/company';

interface PaymentConfigModalProps {
  open: boolean;
  onClose: () => void;
  companyId: number;
  companyName: string;
  initial?: PaymentConfiguration;
  onSubmit: (values: Partial<PaymentConfiguration>) => Promise<void>;
}

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;
  return (
    <div role="tabpanel" hidden={value !== index} {...other}>
      {value === index && <Box sx={{ pt: 3 }}>{children}</Box>}
    </div>
  );
}

const validationSchema = Yup.object({
  BankName: Yup.string().max(150, 'Máximo 150 caracteres'),
  AccountNumber: Yup.string().max(50, 'Máximo 50 caracteres'),
  ClaveInterbancaria: Yup.string()
    .max(18, 'La CLABE debe tener exactamente 18 dígitos')
    .matches(/^\d{0,18}$/, 'La CLABE solo debe contener números'),
  AccountHolder: Yup.string().max(200, 'Máximo 200 caracteres'),
  BankBranch: Yup.string().max(150, 'Máximo 150 caracteres'),
  SwiftCode: Yup.string().max(20, 'Máximo 20 caracteres'),
  PaymentNotes: Yup.string()
});

const AVAILABLE_DEBIT_CARDS = ['BBVA', 'Banamex', 'Santander', 'HSBC', 'Scotiabank', 'Inbursa'];
const AVAILABLE_CREDIT_CARDS = ['Visa', 'Mastercard', 'AMEX'];

export default function PaymentConfigModal({ open, onClose, companyId, companyName, initial, onSubmit }: PaymentConfigModalProps) {
  console.log('🟡 Modal recibió props - initial:', initial, 'open:', open, 'companyId:', companyId);
  const [tabValue, setTabValue] = useState(0);
  const [debitCards, setDebitCards] = useState<string[]>([]);
  const [creditCards, setCreditCards] = useState<string[]>([]);

  useEffect(() => {
    console.log('🟣 useEffect ejecutado - open:', open, 'initial:', initial);
    if (open) {
      // Reiniciar tab al abrir
      setTabValue(0);
      
      // Cargar tarjetas
      if (initial?.AcceptedCards) {
        console.log('✅ Cargando tarjetas:', initial.AcceptedCards);
        setDebitCards(initial.AcceptedCards.debit || []);
        setCreditCards(initial.AcceptedCards.credit || []);
      } else {
        console.log('❌ No hay tarjetas en initial');
        setDebitCards([]);
        setCreditCards([]);
      }
    }
  }, [initial, open]);

  const initialValues: Partial<PaymentConfiguration> = {
    CompanyId: companyId,
    BankName: initial?.BankName || '',
    AccountNumber: initial?.AccountNumber || '',
    ClaveInterbancaria: initial?.ClaveInterbancaria || '',
    AccountHolder: initial?.AccountHolder || '',
    BankBranch: initial?.BankBranch || '',
    SwiftCode: initial?.SwiftCode || '',
    AcceptedPaymentMethods: initial?.AcceptedPaymentMethods || {
      transferencia: false,
      efectivo: false,
      cheque: false,
      tarjetaDebito: false,
      tarjetaCredito: false,
      paypal: false,
      openpay: false,
      mercadopago: false
    },
    PaymentNotes: initial?.PaymentNotes || '',
    ShowInQuotation: initial?.ShowInQuotation ?? true
  };
  
  console.log('🔶 initialValues para Formik:', initialValues);

  const handleSubmit = async (values: Partial<PaymentConfiguration>, { setSubmitting }: any) => {
    try {
      const payload = {
        ...values,
        AcceptedCards: {
          debit: debitCards,
          credit: creditCards
        }
      };
      await onSubmit(payload);
    } catch (error) {
      console.error('Error en submit:', error);
    } finally {
      setSubmitting(false);
    }
  };

  const toggleDebitCard = (card: string) => {
    setDebitCards(prev => 
      prev.includes(card) ? prev.filter(c => c !== card) : [...prev, card]
    );
  };

  const toggleCreditCard = (card: string) => {
    setCreditCards(prev => 
      prev.includes(card) ? prev.filter(c => c !== card) : [...prev, card]
    );
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>
        Configuración de Métodos de Pago
        <Typography variant="body2" color="text.secondary">
          Empresa: {companyName}
        </Typography>
      </DialogTitle>
      <Formik
        key={`${companyId}-${initial?.Id || 'new'}-${open}`}
        initialValues={initialValues}
        validationSchema={validationSchema}
        enableReinitialize
        onSubmit={handleSubmit}
      >
        {({ values, errors, touched, handleChange, handleBlur, setFieldValue, isSubmitting }) => (
          <Form>
            <DialogContent dividers>
              <Alert severity="info" sx={{ mb: 2 }}>
                Esta información aparecerá al final de las cotizaciones en PDF si está activada.
              </Alert>

              <Tabs value={tabValue} onChange={(_, newValue) => setTabValue(newValue)} sx={{ mb: 2 }}>
                <Tab label="Datos Bancarios" />
                <Tab label="Métodos de Pago" />
                <Tab label="Tarjetas Aceptadas" />
              </Tabs>

              {/* Tab 1: Datos Bancarios */}
              <TabPanel value={tabValue} index={0}>
                <Grid container spacing={2}>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Nombre del Banco"
                      name="BankName"
                      value={values.BankName}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      error={touched.BankName && Boolean(errors.BankName)}
                      helperText={touched.BankName && errors.BankName}
                      placeholder="Ej: BBVA México"
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Número de Cuenta"
                      name="AccountNumber"
                      value={values.AccountNumber}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      error={touched.AccountNumber && Boolean(errors.AccountNumber)}
                      helperText={touched.AccountNumber && errors.AccountNumber}
                      placeholder="0123456789"
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="CLABE Interbancaria"
                      name="ClaveInterbancaria"
                      value={values.ClaveInterbancaria}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      error={touched.ClaveInterbancaria && Boolean(errors.ClaveInterbancaria)}
                      helperText={touched.ClaveInterbancaria && errors.ClaveInterbancaria}
                      placeholder="012345678901234567"
                      inputProps={{ maxLength: 18 }}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Beneficiario"
                      name="AccountHolder"
                      value={values.AccountHolder}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      error={touched.AccountHolder && Boolean(errors.AccountHolder)}
                      helperText={touched.AccountHolder && errors.AccountHolder}
                      placeholder="Nombre completo del beneficiario"
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Sucursal"
                      name="BankBranch"
                      value={values.BankBranch}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      error={touched.BankBranch && Boolean(errors.BankBranch)}
                      helperText={touched.BankBranch && errors.BankBranch}
                      placeholder="Sucursal Centro"
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Código SWIFT (Opcional)"
                      name="SwiftCode"
                      value={values.SwiftCode}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      error={touched.SwiftCode && Boolean(errors.SwiftCode)}
                      helperText={touched.SwiftCode && errors.SwiftCode}
                      placeholder="Para transferencias internacionales"
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      multiline
                      rows={3}
                      label="Notas Adicionales"
                      name="PaymentNotes"
                      value={values.PaymentNotes}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      error={touched.PaymentNotes && Boolean(errors.PaymentNotes)}
                      helperText={touched.PaymentNotes && errors.PaymentNotes}
                      placeholder="Ej: Descuento del 3% en pagos por transferencia"
                    />
                  </Grid>
                </Grid>
              </TabPanel>

              {/* Tab 2: Métodos de Pago */}
              <TabPanel value={tabValue} index={1}>
                <Typography variant="subtitle2" gutterBottom>
                  Selecciona los métodos de pago que aceptas:
                </Typography>
                <FormGroup>
                  <Grid container spacing={1}>
                    <Grid item xs={12} sm={6}>
                      <FormControlLabel
                        control={
                          <Checkbox
                            checked={values.AcceptedPaymentMethods?.transferencia || false}
                            onChange={(e) => setFieldValue('AcceptedPaymentMethods.transferencia', e.target.checked)}
                          />
                        }
                        label="Transferencia Bancaria"
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <FormControlLabel
                        control={
                          <Checkbox
                            checked={values.AcceptedPaymentMethods?.efectivo || false}
                            onChange={(e) => setFieldValue('AcceptedPaymentMethods.efectivo', e.target.checked)}
                          />
                        }
                        label="Efectivo"
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <FormControlLabel
                        control={
                          <Checkbox
                            checked={values.AcceptedPaymentMethods?.cheque || false}
                            onChange={(e) => setFieldValue('AcceptedPaymentMethods.cheque', e.target.checked)}
                          />
                        }
                        label="Cheque"
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <FormControlLabel
                        control={
                          <Checkbox
                            checked={values.AcceptedPaymentMethods?.tarjetaDebito || false}
                            onChange={(e) => setFieldValue('AcceptedPaymentMethods.tarjetaDebito', e.target.checked)}
                          />
                        }
                        label="Tarjeta de Débito"
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <FormControlLabel
                        control={
                          <Checkbox
                            checked={values.AcceptedPaymentMethods?.tarjetaCredito || false}
                            onChange={(e) => setFieldValue('AcceptedPaymentMethods.tarjetaCredito', e.target.checked)}
                          />
                        }
                        label="Tarjeta de Crédito"
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <FormControlLabel
                        control={
                          <Checkbox
                            checked={values.AcceptedPaymentMethods?.paypal || false}
                            onChange={(e) => setFieldValue('AcceptedPaymentMethods.paypal', e.target.checked)}
                          />
                        }
                        label="PayPal"
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <FormControlLabel
                        control={
                          <Checkbox
                            checked={values.AcceptedPaymentMethods?.openpay || false}
                            onChange={(e) => setFieldValue('AcceptedPaymentMethods.openpay', e.target.checked)}
                          />
                        }
                        label="OpenPay"
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <FormControlLabel
                        control={
                          <Checkbox
                            checked={values.AcceptedPaymentMethods?.mercadopago || false}
                            onChange={(e) => setFieldValue('AcceptedPaymentMethods.mercadopago', e.target.checked)}
                          />
                        }
                        label="Mercado Pago"
                      />
                    </Grid>
                  </Grid>
                </FormGroup>
              </TabPanel>

              {/* Tab 3: Tarjetas Aceptadas */}
              <TabPanel value={tabValue} index={2}>
                <Grid container spacing={3}>
                  <Grid item xs={12}>
                    <Typography variant="subtitle2" gutterBottom>
                      Tarjetas de Débito Aceptadas:
                    </Typography>
                    <Stack direction="row" spacing={1} flexWrap="wrap" gap={1}>
                      {AVAILABLE_DEBIT_CARDS.map((card) => (
                        <Chip
                          key={card}
                          label={card}
                          onClick={() => toggleDebitCard(card)}
                          color={debitCards.includes(card) ? 'primary' : 'default'}
                          variant={debitCards.includes(card) ? 'filled' : 'outlined'}
                        />
                      ))}
                    </Stack>
                  </Grid>
                  <Grid item xs={12}>
                    <Divider />
                  </Grid>
                  <Grid item xs={12}>
                    <Typography variant="subtitle2" gutterBottom>
                      Tarjetas de Crédito Aceptadas:
                    </Typography>
                    <Stack direction="row" spacing={1} flexWrap="wrap" gap={1}>
                      {AVAILABLE_CREDIT_CARDS.map((card) => (
                        <Chip
                          key={card}
                          label={card}
                          onClick={() => toggleCreditCard(card)}
                          color={creditCards.includes(card) ? 'secondary' : 'default'}
                          variant={creditCards.includes(card) ? 'filled' : 'outlined'}
                        />
                      ))}
                    </Stack>
                  </Grid>
                </Grid>
              </TabPanel>

              <Box sx={{ mt: 3 }}>
                <Divider sx={{ mb: 2 }} />
                <FormControlLabel
                  control={
                    <Switch
                      checked={values.ShowInQuotation || false}
                      onChange={(e) => setFieldValue('ShowInQuotation', e.target.checked)}
                    />
                  }
                  label="Mostrar en cotizaciones PDF"
                />
              </Box>
            </DialogContent>
            <DialogActions>
              <Button onClick={onClose} disabled={isSubmitting}>
                Cancelar
              </Button>
              <Button type="submit" variant="contained" disabled={isSubmitting}>
                {isSubmitting ? 'Guardando...' : 'Guardar Configuración'}
              </Button>
            </DialogActions>
          </Form>
        )}
      </Formik>
    </Dialog>
  );
}
