import { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Card,
  CardContent,
  Typography,
  IconButton,
  Chip,
  Stack,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Grid,
  Tooltip,
  Alert,
  AlertTitle
} from '@mui/material';
import {
  Add,
  Edit2,
  Trash,
  Star1,
  ArrowUp2,
  ArrowDown2
} from 'iconsax-react';
import { BankAccount, CreateBankAccountDto, UpdateBankAccountDto } from 'types/company';
import { bankAccountApi } from 'api/company';
import BankAccountFormDialog from './BankAccountFormDialog';

interface BankAccountsManagerProps {
  companyId: number;
}

export const BankAccountsManager = ({ companyId }: BankAccountsManagerProps) => {
  const [accounts, setAccounts] = useState<BankAccount[]>([]);
  const [loading, setLoading] = useState(false);
  const [formDialogOpen, setFormDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedAccount, setSelectedAccount] = useState<BankAccount | null>(null);
  const [accountToDelete, setAccountToDelete] = useState<BankAccount | null>(null);

  useEffect(() => {
    if (companyId) {
      loadAccounts();
    }
  }, [companyId]);

  const loadAccounts = async () => {
    setLoading(true);
    try {
      const data = await bankAccountApi.getByCompany(companyId);
      setAccounts(data);
    } catch (error) {
      console.error('Error al cargar cuentas bancarias:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = () => {
    setSelectedAccount(null);
    setFormDialogOpen(true);
  };

  const handleEdit = (account: BankAccount) => {
    setSelectedAccount(account);
    setFormDialogOpen(true);
  };

  const handleSave = async (data: CreateBankAccountDto | UpdateBankAccountDto) => {
    try {
      if (selectedAccount) {
        // Actualizar
        await bankAccountApi.update(companyId, selectedAccount.Id!, data as UpdateBankAccountDto);
      } else {
        // Crear
        await bankAccountApi.create(companyId, data as CreateBankAccountDto);
      }
      setFormDialogOpen(false);
      loadAccounts();
    } catch (error) {
      console.error('Error al guardar cuenta bancaria:', error);
    }
  };

  const handleDeleteClick = (account: BankAccount) => {
    setAccountToDelete(account);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (accountToDelete) {
      try {
        await bankAccountApi.delete(companyId, accountToDelete.Id!);
        setDeleteDialogOpen(false);
        setAccountToDelete(null);
        loadAccounts();
      } catch (error) {
        console.error('Error al eliminar cuenta bancaria:', error);
      }
    }
  };

  const handleSetPreferred = async (account: BankAccount) => {
    try {
      await bankAccountApi.setPreferred(companyId, account.Id!);
      loadAccounts();
    } catch (error) {
      console.error('Error al marcar como preferida:', error);
    }
  };

  const handleMoveUp = async (account: BankAccount, index: number) => {
    if (index === 0) return;

    const newAccounts = [...accounts];
    const temp = newAccounts[index - 1];
    newAccounts[index - 1] = newAccounts[index];
    newAccounts[index] = temp;

    // Actualizar DisplayOrder
    const updateData = newAccounts.map((acc, idx) => ({
      Id: acc.Id!,
      DisplayOrder: idx + 1
    }));

    try {
      await bankAccountApi.updateDisplayOrder(companyId, { accounts: updateData });
      setAccounts(newAccounts);
    } catch (error) {
      console.error('Error al reordenar cuentas:', error);
    }
  };

  const handleMoveDown = async (account: BankAccount, index: number) => {
    if (index === accounts.length - 1) return;

    const newAccounts = [...accounts];
    const temp = newAccounts[index + 1];
    newAccounts[index + 1] = newAccounts[index];
    newAccounts[index] = temp;

    // Actualizar DisplayOrder
    const updateData = newAccounts.map((acc, idx) => ({
      Id: acc.Id!,
      DisplayOrder: idx + 1
    }));

    try {
      await bankAccountApi.updateDisplayOrder(companyId, { accounts: updateData });
      setAccounts(newAccounts);
    } catch (error) {
      console.error('Error al reordenar cuentas:', error);
    }
  };

  const getCurrencyColor = (currency?: string) => {
    switch (currency) {
      case 'USD':
        return 'success';
      case 'EUR':
        return 'info';
      case 'CAD':
        return 'warning';
      case 'GBP':
        return 'secondary';
      default:
        return 'default';
    }
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h5">Cuentas Bancarias</Typography>
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={handleCreate}
          disabled={loading}
        >
          Agregar Cuenta
        </Button>
      </Box>

      {accounts.length === 0 && !loading && (
        <Alert severity="info">
          <AlertTitle>No hay cuentas bancarias registradas</AlertTitle>
          Agregue al menos una cuenta bancaria para mostrar información de pago en las cotizaciones.
        </Alert>
      )}

      <Grid container spacing={2}>
        {accounts.map((account, index) => (
          <Grid item xs={12} md={6} lg={4} key={account.Id}>
            <Card 
              variant="outlined" 
              sx={{ 
                height: '100%',
                borderColor: account.IsPreferred ? 'primary.main' : 'divider',
                borderWidth: account.IsPreferred ? 2 : 1,
                position: 'relative'
              }}
            >
              {account.IsPreferred && (
                <Box
                  sx={{
                    position: 'absolute',
                    top: 8,
                    left: 8,
                    zIndex: 1
                  }}
                >
                  <Chip
                    icon={<Star1 size={14} variant="Bold" />}
                    label="Principal"
                    color="primary"
                    size="small"
                  />
                </Box>
              )}

              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 1, gap: 0.5 }}>
                  <Tooltip title="Mover arriba">
                    <span>
                      <IconButton
                        size="small"
                        onClick={() => handleMoveUp(account, index)}
                        disabled={index === 0}
                      >
                        <ArrowUp2 size={16} />
                      </IconButton>
                    </span>
                  </Tooltip>
                  <Tooltip title="Mover abajo">
                    <span>
                      <IconButton
                        size="small"
                        onClick={() => handleMoveDown(account, index)}
                        disabled={index === accounts.length - 1}
                      >
                        <ArrowDown2 size={16} />
                      </IconButton>
                    </span>
                  </Tooltip>
                  <Tooltip title={account.IsPreferred ? 'Ya es preferida' : 'Marcar como preferida'}>
                    <span>
                      <IconButton
                        size="small"
                        onClick={() => handleSetPreferred(account)}
                        disabled={account.IsPreferred}
                        color={account.IsPreferred ? 'primary' : 'default'}
                      >
                        <Star1 size={16} variant={account.IsPreferred ? 'Bold' : 'Outline'} />
                      </IconButton>
                    </span>
                  </Tooltip>
                  <Tooltip title="Editar">
                    <IconButton
                      size="small"
                      onClick={() => handleEdit(account)}
                      color="primary"
                    >
                      <Edit2 size={16} />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Eliminar">
                    <IconButton
                      size="small"
                      onClick={() => handleDeleteClick(account)}
                      color="error"
                    >
                      <Trash size={16} />
                    </IconButton>
                  </Tooltip>
                </Box>

                <Stack spacing={1.5} sx={{ mt: account.IsPreferred ? 4 : 0 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
                    <Typography variant="h6" sx={{ flexGrow: 1 }}>
                      {account.BankName}
                    </Typography>
                    {account.Currency && account.Currency !== 'MXN' && (
                      <Chip
                        label={account.Currency}
                        color={getCurrencyColor(account.Currency)}
                        size="small"
                      />
                    )}
                  </Box>

                  {account.AccountHolder && (
                    <Box>
                      <Typography variant="caption" color="text.secondary" display="block">
                        Beneficiario
                      </Typography>
                      <Typography variant="body2" fontWeight={500}>
                        {account.AccountHolder}
                      </Typography>
                    </Box>
                  )}

                  {account.AccountType && (
                    <Box>
                      <Typography variant="caption" color="text.secondary" display="block">
                        Tipo de Cuenta
                      </Typography>
                      <Typography variant="body2">
                        {account.AccountType}
                      </Typography>
                    </Box>
                  )}

                  {account.AccountNumber && (
                    <Box>
                      <Typography variant="caption" color="text.secondary" display="block">
                        Número de Cuenta
                      </Typography>
                      <Typography variant="body2" fontFamily="monospace">
                        {account.AccountNumber}
                      </Typography>
                    </Box>
                  )}

                  {account.ClaveInterbancaria && (
                    <Box>
                      <Typography variant="caption" color="text.secondary" display="block">
                        CLABE Interbancaria
                      </Typography>
                      <Typography variant="body2" fontFamily="monospace" fontSize={11}>
                        {account.ClaveInterbancaria}
                      </Typography>
                    </Box>
                  )}

                  {account.BankBranch && (
                    <Box>
                      <Typography variant="caption" color="text.secondary" display="block">
                        Sucursal
                      </Typography>
                      <Typography variant="body2">
                        {account.BankBranch}
                      </Typography>
                    </Box>
                  )}

                  {account.SwiftCode && (
                    <Box>
                      <Typography variant="caption" color="text.secondary" display="block">
                        SWIFT
                      </Typography>
                      <Typography variant="body2" fontFamily="monospace">
                        {account.SwiftCode}
                      </Typography>
                    </Box>
                  )}

                  {account.Notes && (
                    <Box
                      sx={{
                        mt: 1,
                        pt: 1,
                        borderTop: 1,
                        borderColor: 'divider'
                      }}
                    >
                      <Typography variant="caption" color="text.secondary" display="block">
                        Notas
                      </Typography>
                      <Typography variant="body2" fontSize={11} fontStyle="italic">
                        {account.Notes}
                      </Typography>
                    </Box>
                  )}
                </Stack>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Formulario de Crear/Editar */}
      <BankAccountFormDialog
        open={formDialogOpen}
        onClose={() => setFormDialogOpen(false)}
        onSave={handleSave}
        account={selectedAccount}
        companyId={companyId}
      />

      {/* Diálogo de Confirmación de Eliminación */}
      <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
        <DialogTitle>Confirmar Eliminación</DialogTitle>
        <DialogContent>
          <Typography>
            ¿Está seguro que desea eliminar la cuenta bancaria de <strong>{accountToDelete?.BankName}</strong>?
          </Typography>
          {accountToDelete?.IsPreferred && (
            <Alert severity="warning" sx={{ mt: 2 }}>
              Esta es la cuenta preferida. Al eliminarla, ninguna cuenta será marcada como preferida.
            </Alert>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)} color="secondary">
            Cancelar
          </Button>
          <Button onClick={handleDeleteConfirm} variant="contained" color="error">
            Eliminar
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default BankAccountsManager;
