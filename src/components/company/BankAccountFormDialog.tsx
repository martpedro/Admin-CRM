import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Grid,
  MenuItem,
  FormControlLabel,
  Switch,
  Typography,
  Box
} from '@mui/material';
import { BankAccount, CreateBankAccountDto, UpdateBankAccountDto } from 'types/company';

interface BankAccountFormDialogProps {
  open: boolean;
  onClose: () => void;
  onSave: (data: CreateBankAccountDto | UpdateBankAccountDto) => void;
  account?: BankAccount | null;
  companyId: number;
}

const CURRENCIES = ['MXN', 'USD', 'EUR', 'CAD', 'GBP'];
const ACCOUNT_TYPES = ['Cheques', 'Ahorro', 'Inversión', 'Nómina', 'Empresarial'];

const initialFormData: CreateBankAccountDto = {
  CompanyId: 0,
  BankName: '',
  AccountNumber: '',
  ClaveInterbancaria: '',
  AccountHolder: '',
  BankBranch: '',
  SwiftCode: '',
  Currency: 'MXN',
  AccountType: '',
  IsPreferred: false,
  DisplayOrder: undefined,
  Notes: ''
};

export const BankAccountFormDialog = ({ open, onClose, onSave, account, companyId }: BankAccountFormDialogProps) => {
  const [formData, setFormData] = useState<CreateBankAccountDto>(initialFormData);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (open) {
      if (account) {
        // Modo edición
        setFormData({
          CompanyId: account.CompanyId,
          BankName: account.BankName,
          AccountNumber: account.AccountNumber || '',
          ClaveInterbancaria: account.ClaveInterbancaria || '',
          AccountHolder: account.AccountHolder || '',
          BankBranch: account.BankBranch || '',
          SwiftCode: account.SwiftCode || '',
          Currency: account.Currency || 'MXN',
          AccountType: account.AccountType || '',
          IsPreferred: account.IsPreferred || false,
          DisplayOrder: account.DisplayOrder,
          Notes: account.Notes || ''
        });
      } else {
        // Modo creación
        setFormData({
          ...initialFormData,
          CompanyId: companyId
        });
      }
      setErrors({});
    }
  }, [open, account, companyId]);

  const handleChange = (field: keyof CreateBankAccountDto, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    // Limpiar error del campo si existe
    if (errors[field]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.BankName || formData.BankName.trim() === '') {
      newErrors.BankName = 'El nombre del banco es requerido';
    } else if (formData.BankName.length > 100) {
      newErrors.BankName = 'El nombre del banco no puede exceder 100 caracteres';
    }

    if (formData.ClaveInterbancaria && formData.ClaveInterbancaria.length !== 18) {
      newErrors.ClaveInterbancaria = 'La CLABE debe tener exactamente 18 dígitos';
    }

    if (formData.AccountNumber && formData.AccountNumber.length > 20) {
      newErrors.AccountNumber = 'El número de cuenta no puede exceder 20 caracteres';
    }

    if (formData.AccountHolder && formData.AccountHolder.length > 200) {
      newErrors.AccountHolder = 'El beneficiario no puede exceder 200 caracteres';
    }

    if (formData.BankBranch && formData.BankBranch.length > 100) {
      newErrors.BankBranch = 'La sucursal no puede exceder 100 caracteres';
    }

    if (formData.SwiftCode && formData.SwiftCode.length > 11) {
      newErrors.SwiftCode = 'El código SWIFT no puede exceder 11 caracteres';
    }

    if (formData.Notes && formData.Notes.length > 500) {
      newErrors.Notes = 'Las notas no pueden exceder 500 caracteres';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (!validate()) {
      return;
    }

    if (account) {
      // Modo edición - enviar solo campos modificables
      const updateData: UpdateBankAccountDto = {
        BankName: formData.BankName,
        AccountNumber: formData.AccountNumber || undefined,
        ClaveInterbancaria: formData.ClaveInterbancaria || undefined,
        AccountHolder: formData.AccountHolder || undefined,
        BankBranch: formData.BankBranch || undefined,
        SwiftCode: formData.SwiftCode || undefined,
        Currency: formData.Currency,
        AccountType: formData.AccountType || undefined,
        IsPreferred: formData.IsPreferred,
        Notes: formData.Notes || undefined
      };
      onSave(updateData);
    } else {
      // Modo creación
      onSave(formData);
    }
  };

  return (
    <Dialog 
      open={open} 
      onClose={onClose} 
      maxWidth="md" 
      fullWidth
      PaperProps={{
        sx: { borderRadius: 2 }
      }}
    >
      <DialogTitle>
        <Typography variant="h4">
          {account ? 'Editar Cuenta Bancaria' : 'Nueva Cuenta Bancaria'}
        </Typography>
      </DialogTitle>
      
      <DialogContent dividers>
        <Box sx={{ pt: 2 }}>
          <Grid container spacing={2.5}>
            {/* Nombre del Banco */}
            <Grid item xs={12}>
              <TextField
                fullWidth
                required
                label="Nombre del Banco"
                value={formData.BankName}
                onChange={(e) => handleChange('BankName', e.target.value)}
                error={!!errors.BankName}
                helperText={errors.BankName}
                placeholder="Ej: BBVA México, Santander, Banamex"
              />
            </Grid>

            {/* Beneficiario */}
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Beneficiario"
                value={formData.AccountHolder}
                onChange={(e) => handleChange('AccountHolder', e.target.value)}
                error={!!errors.AccountHolder}
                helperText={errors.AccountHolder}
                placeholder="Nombre del titular de la cuenta"
              />
            </Grid>

            {/* Tipo de Cuenta */}
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                select
                label="Tipo de Cuenta"
                value={formData.AccountType}
                onChange={(e) => handleChange('AccountType', e.target.value)}
              >
                <MenuItem value="">
                  <em>Seleccionar tipo</em>
                </MenuItem>
                {ACCOUNT_TYPES.map((type) => (
                  <MenuItem key={type} value={type}>
                    {type}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>

            {/* Número de Cuenta */}
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Número de Cuenta"
                value={formData.AccountNumber}
                onChange={(e) => handleChange('AccountNumber', e.target.value)}
                error={!!errors.AccountNumber}
                helperText={errors.AccountNumber}
                placeholder="Hasta 20 caracteres"
              />
            </Grid>

            {/* CLABE Interbancaria */}
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="CLABE Interbancaria"
                value={formData.ClaveInterbancaria}
                onChange={(e) => handleChange('ClaveInterbancaria', e.target.value)}
                error={!!errors.ClaveInterbancaria}
                helperText={errors.ClaveInterbancaria || '18 dígitos para transferencias en México'}
                placeholder="123456789012345678"
                inputProps={{ maxLength: 18 }}
              />
            </Grid>

            {/* Sucursal */}
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Sucursal"
                value={formData.BankBranch}
                onChange={(e) => handleChange('BankBranch', e.target.value)}
                error={!!errors.BankBranch}
                helperText={errors.BankBranch}
                placeholder="Nombre o número de sucursal"
              />
            </Grid>

            {/* Código SWIFT */}
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Código SWIFT"
                value={formData.SwiftCode}
                onChange={(e) => handleChange('SwiftCode', e.target.value.toUpperCase())}
                error={!!errors.SwiftCode}
                helperText={errors.SwiftCode || 'Para transferencias internacionales'}
                placeholder="BBVAMXMM"
                inputProps={{ maxLength: 11 }}
              />
            </Grid>

            {/* Moneda */}
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                select
                label="Moneda"
                value={formData.Currency}
                onChange={(e) => handleChange('Currency', e.target.value)}
              >
                {CURRENCIES.map((curr) => (
                  <MenuItem key={curr} value={curr}>
                    {curr}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>

            {/* Cuenta Preferida */}
            <Grid item xs={12} md={6}>
              <FormControlLabel
                control={
                  <Switch
                    checked={formData.IsPreferred}
                    onChange={(e) => handleChange('IsPreferred', e.target.checked)}
                    color="primary"
                  />
                }
                label={
                  <Box>
                    <Typography variant="body2" fontWeight={500}>
                      Marcar como cuenta preferida
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Se mostrará con ★ en cotizaciones
                    </Typography>
                  </Box>
                }
              />
            </Grid>

            {/* Notas adicionales */}
            <Grid item xs={12}>
              <TextField
                fullWidth
                multiline
                rows={3}
                label="Notas adicionales"
                value={formData.Notes}
                onChange={(e) => handleChange('Notes', e.target.value)}
                error={!!errors.Notes}
                helperText={errors.Notes || 'Información adicional sobre esta cuenta (opcional)'}
                placeholder="Ej: Solo para pagos en USD, Cuenta exclusiva para clientes VIP, etc."
              />
            </Grid>
          </Grid>
        </Box>
      </DialogContent>

      <DialogActions sx={{ px: 3, py: 2 }}>
        <Button onClick={onClose} color="secondary" variant="outlined">
          Cancelar
        </Button>
        <Button onClick={handleSubmit} variant="contained" color="primary">
          {account ? 'Actualizar' : 'Crear'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default BankAccountFormDialog;
