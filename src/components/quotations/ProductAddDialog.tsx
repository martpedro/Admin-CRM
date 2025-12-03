import { useState, useEffect } from 'react';
import dayjs from 'dayjs';
import { saveProductImageLocally } from '../../utils/saveProductImageLocally';
import {
  Box,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Tabs,
  Tab,
  Stack,
  Typography,
  Avatar,
  Card,
  CardContent,
  TextField,
  Grid
} from '@mui/material';
import Autocomplete from '@mui/material/Autocomplete';
import { SearchNormal1, DocumentUpload } from 'iconsax-react';
import { openSnackbar } from 'api/snackbar';
import quotationsApi from 'api/quotations';
import { QuotationProduct } from 'api/quotations';
import { calculateProductTotal, formatCurrencyMXN } from 'utils/quotation';

export type ProductWithOrigin = QuotationProduct & { Origin?: 'manual' | 'catalog' };

interface ProductAddDialogProps {
  open: boolean;
  onClose: () => void;
  onAdd: (product: ProductWithOrigin) => void;
}

const initialProduct: ProductWithOrigin = {
  Image: '',
  ImageFile: undefined as any,
  CodeVendor: '',
  Code: '',
  Description: '',
  Specifications: '',
  Inks: '',
  PrintDetails: '', // Agregar campo para detalle de impresión
  DeliveryTime: '',
  Quantity: 1,
  VendorCost: 0,
  PrintCost: 0,
  UnitPrice: 0,
  Total: 0,
  Revenue: 0,
  Commission: 0,
  Origin: 'manual'
};

export const ProductAddDialog = ({ open, onClose, onAdd }: ProductAddDialogProps) => {
  const [imagePreview, setImagePreview] = useState<string>('');
  const [productSearchMode, setProductSearchMode] = useState(0); // 0: search, 1: manual
  const [searchOptions, setSearchOptions] = useState<any[]>([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [searchCode, setSearchCode] = useState('');
  const [manualProduct, setManualProduct] = useState<ProductWithOrigin>(initialProduct);
  const searchDebounceRef = (global as any).productSearchDebounceRef || { current: null };
  (global as any).productSearchDebounceRef = searchDebounceRef;

  useEffect(() => {
    if (!open) {
      // Reset al cerrar
      setProductSearchMode(0);
      setSearchOptions([]);
      setSearchCode('');
      setManualProduct(initialProduct);
    }
  }, [open]);

  const fetchPredictiveProducts = async (term: string) => {
    if (!term || term.trim().length < 2) {
      setSearchOptions([]);
      return;
    }
    setSearchLoading(true);
    try {
      // Usar función de API
      const list = await quotationsApi.searchProducts(term, 10);
      setSearchOptions(list);
    } catch (e) {
      console.error('Error predictive search', e);
      setSearchOptions([]);
    } finally {
      setSearchLoading(false);
    }
  };
  

  const handleAdd = async () => {
    if (productSearchMode === 0 && !manualProduct.Code) {
      openSnackbar({
        open: true,
        message: 'Debe seleccionar un producto',
        variant: 'alert',
        alert: { color: 'warning', variant: 'filled' },
        anchorOrigin: { vertical: 'bottom', horizontal: 'right' },
        transition: 'Fade',
        close: false,
        action: false,
        actionButton: false,
        dense: false,
        maxStack: 3,
        iconVariant: 'usedefault'
      });
      return;
    }
    let imageUrl = manualProduct.Image;
    if (productSearchMode === 1) {
      if (!manualProduct.Code || manualProduct.VendorCost <= 0) {
        openSnackbar({
          open: true,
          message: 'Complete Código y Precio de Proveedor',
          variant: 'alert',
          alert: { color: 'warning', variant: 'filled' },
          anchorOrigin: { vertical: 'bottom', horizontal: 'right' },
          transition: 'Fade',
          close: false,
          action: false,
          actionButton: false,
          dense: false,
          maxStack: 3,
          iconVariant: 'usedefault'
        });
        return;
      }
      // Subir imagen a upload-image.php si existe
      if (manualProduct.ImageFile instanceof File) {
        try {
          imageUrl = await quotationsApi.uploadProductImage(manualProduct.ImageFile);
          manualProduct.Image = imageUrl;
          manualProduct.ImageFile = undefined;
        } catch (err) {
          openSnackbar({
            open: true,
            message: 'Error subiendo imagen',
            variant: 'alert',
            alert: { color: 'error', variant: 'filled' },
            anchorOrigin: { vertical: 'bottom', horizontal: 'right' },
            transition: 'Fade',
            close: false,
            action: false,
            actionButton: false,
            dense: false,
            maxStack: 3,
            iconVariant: 'usedefault'
          });
          return;
        }
      }
    }
    const productToAdd = calculateProductTotal({ ...manualProduct, Image: imageUrl });
    onAdd(productToAdd);
    openSnackbar({
      open: true,
      message: 'Producto agregado',
      variant: 'alert',
      alert: { color: 'success', variant: 'filled' },
      anchorOrigin: { vertical: 'bottom', horizontal: 'right' },
      transition: 'Fade',
      close: false,
      action: false,
      actionButton: false,
      dense: false,
      maxStack: 3,
      iconVariant: 'usedefault'
    });
    onClose();
    setImagePreview('');
  };

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Validar tamaño del archivo (máximo 5MB)
      if (file.size > 5 * 1024 * 1024) {
        openSnackbar({
          open: true,
          message: 'La imagen es muy grande. Máximo 5MB.',
          variant: 'alert',
          alert: { color: 'warning', variant: 'filled' },
          anchorOrigin: { vertical: 'bottom', horizontal: 'right' },
          transition: 'Fade',
          close: false,
          action: false,
          actionButton: false,
          dense: false,
          maxStack: 3,
          iconVariant: 'usedefault'
        });
        return;
      }
      
      // Mostrar vista previa de forma optimizada
      const reader = new FileReader();
      reader.onloadend = () => {
        // Usar requestAnimationFrame para evitar bloqueo del hilo principal
        requestAnimationFrame(() => {
          setImagePreview(reader.result as string);
        });
      };
      reader.onerror = () => {
        openSnackbar({
          open: true,
          message: 'Error al cargar la imagen',
          variant: 'alert',
          alert: { color: 'error', variant: 'filled' },
          anchorOrigin: { vertical: 'bottom', horizontal: 'right' },
          transition: 'Fade',
          close: false,
          action: false,
          actionButton: false,
          dense: false,
          maxStack: 3,
          iconVariant: 'usedefault'
        });
      };
      reader.readAsDataURL(file);
      setManualProduct(prev => ({ ...prev, ImageFile: file, Origin: 'manual' }));
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>Agregar Producto</DialogTitle>
      <DialogContent>
        <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
          <Tabs value={productSearchMode} onChange={(e, v) => setProductSearchMode(v)}>
            <Tab icon={<SearchNormal1 />} label="Buscar por Código" />
            <Tab icon={<DocumentUpload />} label="Agregar Manualmente" />
          </Tabs>
        </Box>

        {productSearchMode === 0 ? (
          <Box>
            <Stack spacing={2} sx={{ mb: 3 }}>
              <Autocomplete
                freeSolo
                loading={searchLoading}
                options={searchOptions}
                filterOptions={(opts) => opts}
                getOptionLabel={(o: any) => (typeof o === 'string' ? o : (o?.Code || o?.CodeVendor || o?.Description || ''))}
                isOptionEqualToValue={(option: any, value: any) => {
                  if (!option || !value) return false;
                  return option.Id === value.Id || option.Code === value.Code || option.CodeVendor === value.CodeVendor;
                }}
                noOptionsText={searchCode.trim().length < 2 ? 'Escribe al menos 2 caracteres' : 'Sin resultados'}
                loadingText="Buscando..."
                onInputChange={(e, value) => {
                  setSearchCode(value);
                  if (searchDebounceRef.current) clearTimeout(searchDebounceRef.current);
                  
                  // Solo buscar si hay al menos 2 caracteres
                  if (value.trim().length >= 2) {
                    searchDebounceRef.current = setTimeout(() => {
                      // Usar requestIdleCallback si está disponible, sino setTimeout
                      if (window.requestIdleCallback) {
                        window.requestIdleCallback(() => fetchPredictiveProducts(value));
                      } else {
                        fetchPredictiveProducts(value);
                      }
                    }, 500); // Aumentar debounce a 500ms
                  } else {
                    // Limpiar resultados si hay menos de 2 caracteres
                    setSearchOptions([]);
                  }
                }}
                onChange={(e, value: any) => {
                  if (value) {
                    setManualProduct(prev => ({
                      ...prev,
                      Image: value.Image || '',
                      CodeVendor: value.CodeVendor || '',
                      Code: value.Code || '',
                      Description: value.Description || '',
                      Specifications: value.Specifications || '',
                      Inks: value.Inks || '',
                      PrintDetails: value.Inks || '', // Mapear Inks a PrintDetails para compatibilidad con la tabla
                      DeliveryTime: value.DeliveryTime || '',
                      Quantity: 1,
                      VendorCost: Number(value.VendorCost) || 0,
                      PrintCost: Number(value.PrintCost) || 0,
                      UnitPrice: Number(value.UnitPrice) || 0,
                      Total: Number(value.Total) || 0,
                      Revenue: Number(value.Revenue) || 0,
                      Commission: Number(value.Commission) || 0,
                      Origin: 'catalog'
                    }));
                  }
                }}
                renderInput={(params) => (
                  <TextField {...params} label="Código del Producto" placeholder="Escribe al menos 2 caracteres" />
                )}
                renderOption={(props, option: any) => (
                  <li {...props} key={option.Id || option.Code || option.CodeVendor}>
                    <Stack direction="row" spacing={1} alignItems="center" sx={{ width: '100%' }}>
                      <Avatar src={option.Image} variant="rounded" sx={{ width: 32, height: 32 }}>
                        {(option.Code || option.CodeVendor || 'P').charAt(0)}
                      </Avatar>
                      <Box sx={{ flex: 1, overflow: 'hidden' }}>
                        <Typography variant="body2" noWrap>{option.Code || option.CodeVendor}</Typography>
                        <Typography variant="caption" color="text.secondary" noWrap>{option.Description || ''}</Typography>
                      </Box>
                      <Typography variant="caption" color="primary">${Number(option.UnitPrice || 0).toLocaleString('es-CO')}</Typography>
                    </Stack>
                  </li>
                )}
              />
              <Button variant="outlined" onClick={() => fetchPredictiveProducts(searchCode)} startIcon={<SearchNormal1 />}>Forzar búsqueda</Button>
            </Stack>

            {manualProduct.Code && (
              <Card variant="outlined">
                <CardContent>
                  <Stack direction="row" spacing={2}>
                    <Avatar src={manualProduct.Image} sx={{ width: 80, height: 80 }} variant="rounded">
                      {manualProduct.Code.charAt(0)}
                    </Avatar>
                    <Box>
                      <Typography variant="h6">{manualProduct.Description}</Typography>
                      <Typography color="textSecondary">Código: {manualProduct.Code}</Typography>
                      <Typography color="textSecondary">Especificaciones: {manualProduct.Specifications}</Typography>
                      <Typography variant="subtitle1" color="primary">Precio: {formatCurrencyMXN(manualProduct.UnitPrice)}</Typography>
                    </Box>
                  </Stack>
                </CardContent>
              </Card>
            )}
          </Box>
        ) : (
          <Box>
            <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 2 }}>
              <Avatar src={imagePreview || manualProduct.Image} sx={{ width: 80, height: 80 }} variant="rounded">
                {manualProduct.Code?.charAt(0) || 'P'}
              </Avatar>
              <div>
                <input accept="image/*" style={{ display: 'none' }} id="image-upload" type="file" onChange={handleImageUpload} />
                <label htmlFor="image-upload">
                  <Button variant="outlined" component="span" startIcon={<DocumentUpload />}>Cargar Imagen</Button>
                </label>
              </div>
            </Stack>
            <Grid container spacing={2}>
              {/* Campos manuales */}
            </Grid>
            <Box sx={{ mt: 2 }}>
              <TextField fullWidth label="Código *" value={manualProduct.Code} onChange={(e) => setManualProduct(p => ({ ...p, Code: e.target.value }))} sx={{ mb: 2 }} />
              <TextField fullWidth label="Código Proveedor" value={manualProduct.CodeVendor} onChange={(e) => setManualProduct(p => ({ ...p, CodeVendor: e.target.value }))} sx={{ mb: 2 }} />
              <TextField fullWidth label="Especificaciones" multiline rows={3} value={manualProduct.Specifications} onChange={(e) => setManualProduct(p => ({ ...p, Specifications: e.target.value }))} sx={{ mb: 2 }} />
              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{ mb: 2 }}>
                <TextField label="Tintas / Detalle de Impresión" fullWidth value={manualProduct.Inks} onChange={(e) => setManualProduct(p => ({ ...p, Inks: e.target.value, PrintDetails: e.target.value }))} />
                <TextField label="Tiempo Entrega" fullWidth value={manualProduct.DeliveryTime} onChange={(e) => setManualProduct(p => ({ ...p, DeliveryTime: e.target.value }))} />
              </Stack>
              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                <TextField label="Cantidad" type="number" fullWidth value={manualProduct.Quantity} onChange={(e) => setManualProduct(p => ({ ...p, Quantity: parseInt(e.target.value) || 1 }))} />
                <TextField label="Costo Prov." type="number" fullWidth value={manualProduct.VendorCost} onChange={(e) => setManualProduct(p => ({ ...p, VendorCost: parseFloat(e.target.value) || 0 }))} />
                <TextField label="Costo Impresión" type="number" fullWidth value={manualProduct.PrintCost} onChange={(e) => setManualProduct(p => ({ ...p, PrintCost: parseFloat(e.target.value) || 0 }))} />
              </Stack>
            </Box>
          </Box>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancelar</Button>
        <Button variant="contained" onClick={handleAdd}>Agregar</Button>
      </DialogActions>
    </Dialog>
  );
};

export default ProductAddDialog;
