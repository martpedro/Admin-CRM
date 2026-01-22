import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';

// material-ui
import {
  Box,
  Button,
  Chip,
  IconButton,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Tooltip,
  Typography,
  useTheme,
  alpha,
  OutlinedInput,
  InputAdornment,
  Tab,
  Tabs,
  Badge
} from '@mui/material';

// third-party
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { FormattedMessage, useIntl } from 'react-intl';
import { openSnackbar } from 'api/snackbar';
import { mutate } from 'swr';

// project-imports
import Breadcrumbs from 'components/@extended/Breadcrumbs';
import MainCard from 'components/MainCard';
import { useQuotations, useQuotationOperations } from 'hooks/useQuotations';
import QuotationStatusChip from 'components/quotations/QuotationStatusChip';

// assets
import { Add, Edit, Trash, Eye, SearchNormal1, DocumentDownload, Copy, Clock } from 'iconsax-react';
import { downloadQuotationExcel } from 'api/quotations';
import QuotationPdfViewer from 'components/quotations/QuotationPdfViewer';
import QuotationCatalogViewer from 'components/quotations/QuotationCatalogViewer';
import SendQuotationEmailDialog from 'components/quotations/SendQuotationEmailDialog';
import DeleteQuotationDialog from 'components/quotations/DeleteQuotationDialog';
import VersionsHistoryDialog from 'components/quotations/VersionsHistoryDialog';
import Loader from 'components/Loader';
import { sendQuotationEmail, quotationsApi } from 'api/quotations';
import AdvisorFilter from 'components/AdvisorFilter';
import { useQuotationDataScope } from 'hooks/useDataScope';

// types
import { Quotation } from 'api/quotations';
import { SnackbarProps } from 'types/snackbar';

// types for status
type StatusKey = 'todas' | 'Nueva' | 'En proceso' | 'Cerrada';

interface StatusTab {
  key: StatusKey;
  label: string;
  count: number;
}

const QuotationsList = () => {
  const { showAdvisorFilter, canViewAll, dataScope } = useQuotationDataScope();
  
  const [openSendEmail, setOpenSendEmail] = useState(false);
  const [sendingEmail, setSendingEmail] = useState(false);
  const [quotationToSend, setQuotationToSend] = useState<null | Quotation>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [quotationToDelete, setQuotationToDelete] = useState<Quotation | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [selectedQuotation, setSelectedQuotation] = useState<number | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState<StatusKey>('todas');
  const [statusChangeLoading, setStatusChangeLoading] = useState<number | null>(null);
  const [selectedAdvisor, setSelectedAdvisor] = useState<string | number | 'all'>('all');
  const [versionsDialogOpen, setVersionsDialogOpen] = useState(false);
  const [selectedQuotationForHistory, setSelectedQuotationForHistory] = useState<number | null>(null);
  
  const theme = useTheme();
  const navigate = useNavigate();
  const intl = useIntl();
  
  const statusFilter = activeTab === 'todas' ? undefined : activeTab;
  const { quotations, isLoading, error } = useQuotations(statusFilter);
  const { deleteQuotation, updateQuotationStatus } = useQuotationOperations();

  // Función para cambiar estado de cotización
  const handleStatusChange = async (quotationId: number, newStatus: 'Nueva' | 'En proceso' | 'Cerrada') => {
    setStatusChangeLoading(quotationId);
    try {
      await updateQuotationStatus(quotationId, newStatus);
      // Refrescar todas las listas de cotizaciones usando las claves correctas de SWR
      mutate('quotation:list');
      mutate('quotation:list:Nueva');
      mutate('quotation:list:En proceso');
      mutate('quotation:list:Cerrada');
  openSnackbar({ open: true, message: 'Estado actualizado correctamente', variant: 'alert', alert: { color: 'success' } } as SnackbarProps);
    } catch (error) {
      console.error('Error updating status:', error);
  openSnackbar({ open: true, message: 'Error al actualizar el estado', variant: 'alert', alert: { color: 'error' } } as SnackbarProps);
    } finally {
      setStatusChangeLoading(null);
    }
  };

  const handleDelete = (quotation: Quotation) => {
    setQuotationToDelete(quotation);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (!quotationToDelete) return;

    setDeleting(true);
    const result = await deleteQuotation(quotationToDelete.Id);
    setDeleting(false);

    if (result.success) {
      setDeleteDialogOpen(false);
      setQuotationToDelete(null);
  openSnackbar({ open: true, message: 'Cotización eliminada correctamente', variant: 'alert', alert: { color: 'success' } } as SnackbarProps);
    } else {
  openSnackbar({ open: true, message: result.error || 'Error al eliminar la cotización', variant: 'alert', alert: { color: 'error' } } as SnackbarProps);
    }
  };

  const handleCloseDeleteDialog = () => {
    if (!deleting) {
      setDeleteDialogOpen(false);
      setQuotationToDelete(null);
    }
  };

  // Función para copiar cotización
  const handleCopyQuotation = async (quotationId: number) => {
    try {
      const copyData = await quotationsApi.getQuotationForCopy(quotationId);
      localStorage.setItem('quotationCopyData', JSON.stringify(copyData));
      navigate('/quotations/create?mode=copy');
      openSnackbar({ 
        open: true, 
        message: 'Cotización copiada. Rellena los datos del cliente.', 
        variant: 'alert', 
        alert: { color: 'info' } 
      } as SnackbarProps);
    } catch (error) {
      console.error('Error al copiar cotización:', error);
      openSnackbar({ 
        open: true, 
        message: 'Error al copiar la cotización', 
        variant: 'alert', 
        alert: { color: 'error' } 
      } as SnackbarProps);
    }
  };

  const quotationsData = useMemo(() => {
    return quotations.map((quotation: Quotation) => ({
      ...quotation,
      customerName: `${quotation.Customer?.Name || ''} ${quotation.Customer?.LastName || ''}`.trim(),
      advisorName: `${quotation.User?.Name || ''} ${quotation.User?.LastNAme || ''}`.trim(),
      companyName: quotation.Company?.Name || '',
      formattedDate: format(new Date(quotation.CreatedAt), 'dd/MM/yyyy', { locale: es })
    }));
  }, [quotations]);

  // Calcular conteos para tabs usando hook separado para cada estado
  const { quotations: allQuotations } = useQuotations();
  const { quotations: newQuotations } = useQuotations('Nueva');
  const { quotations: inProcessQuotations } = useQuotations('En proceso'); 
  const { quotations: closedQuotations } = useQuotations('Cerrada');

  const statusCounts = useMemo(() => ({
    todas: allQuotations.length,
    Nueva: newQuotations.length,
    'En proceso': inProcessQuotations.length,
    Cerrada: closedQuotations.length
  }), [allQuotations.length, newQuotations.length, inProcessQuotations.length, closedQuotations.length]);

  // Crear tabs con conteos
  const statusTabs: StatusTab[] = [
    { key: 'todas', label: 'Todas', count: statusCounts.todas },
    { key: 'Nueva', label: 'Nuevas', count: statusCounts.Nueva },
    { key: 'En proceso', label: 'En Proceso', count: statusCounts['En proceso'] },
    { key: 'Cerrada', label: 'Cerradas', count: statusCounts.Cerrada }
  ];

  // Filtrar cotizaciones por búsqueda y asesor
  const filteredQuotations = useMemo(() => {
    // Primero filtrar solo las últimas versiones (IsLatestVersion !== false)
    // Esto evita mostrar versiones anteriores en el listado principal
    let filtered = quotationsData.filter(q => q.IsLatestVersion !== false);

    // Aplicar filtro por asesor según permisos
    if (showAdvisorFilter && selectedAdvisor !== 'all') {
      filtered = filtered.filter(quotation => {
        const advisorId = quotation.User?.Id;
        return advisorId === selectedAdvisor;
      });
    }

    // Filtrar por búsqueda
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (quotation) =>
          quotation.NumberQuotation?.toLowerCase().includes(term) ||
          quotation.customerName.toLowerCase().includes(term) ||
          quotation.advisorName.toLowerCase().includes(term) ||
          quotation.companyName.toLowerCase().includes(term) ||
          quotation.Customer?.Email?.toLowerCase().includes(term)
      );
    }

    return filtered;
  }, [quotationsData, searchTerm, showAdvisorFilter, selectedAdvisor]);

  if (error) {
    return (
      <MainCard>
        <Typography color="error">
          <FormattedMessage id="error-loading-quotations" />: {error.message}
        </Typography>
      </MainCard>
    );
  }
  if (isLoading) {
    return <Loader message="Cargando cotizaciones..." />;
  }

  return (
    <>
      <Breadcrumbs
        links={[{ title: intl.formatMessage({ id: 'home' }), to: '/' }, { title: intl.formatMessage({ id: 'quotations' }) }]}
        title
        rightAlign
      />

      {/* Header con búsqueda y botón crear */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Stack direction={{ xs: 'column', sm: 'row' }} sx={{ gap: 2, flex: 1 }}>
          <OutlinedInput
            id="search-quotations"
            startAdornment={
              <InputAdornment position="start">
                <SearchNormal1 size={16} color={theme.palette.grey[500]} />
              </InputAdornment>
            }
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder={intl.formatMessage({ id: 'search-placeholder' })}
            sx={{ flex: 1, minWidth: 200 }}
          />
          
          <AdvisorFilter
            module="quotation"
            selectedAdvisor={selectedAdvisor}
            onAdvisorChange={setSelectedAdvisor}
          />
        </Stack>

        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={() => navigate('/quotations/create')}
          sx={{ textTransform: 'none', ml: 2 }}
        >
          <FormattedMessage id="new-quotation" />
        </Button>
      </Box>

      <MainCard content={false}>
        {/* Tabs para filtrar por estado */}
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs
            value={activeTab}
            onChange={(_, newValue) => setActiveTab(newValue)}
            aria-label={intl.formatMessage({ id: 'quotation-filters' })}
            sx={{ px: 2 }}
          >
            {statusTabs.map((tab) => (
              <Tab
                key={tab.key}
                value={tab.key}
                label={
                  <Badge badgeContent={tab.count} color="primary" showZero>
                    {tab.label}
                  </Badge>
                }
                sx={{ textTransform: 'none' }}
              />
            ))}
          </Tabs>
        </Box>

        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>#</TableCell>
                <TableCell>
                  <FormattedMessage id="quotation-number" />
                </TableCell>
                <TableCell>
                  <FormattedMessage id="customer" />
                </TableCell>
                <TableCell>
                  <FormattedMessage id="advisor" />
                </TableCell>
                <TableCell>
                  <FormattedMessage id="company" />
                </TableCell>
                <TableCell align="right">
                  <FormattedMessage id="subtotal" />
                </TableCell>
                <TableCell align="right">
                  <FormattedMessage id="taxes" />
                </TableCell>
                <TableCell align="right">
                  <FormattedMessage id="total" />
                </TableCell>
                <TableCell>
                  <FormattedMessage id="date" />
                </TableCell>
                <TableCell>
                  <FormattedMessage id="status" />
                </TableCell>
                <TableCell align="center">
                  <FormattedMessage id="actions" />
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={11} align="center">
                    <Typography>
                      <FormattedMessage id="loading-quotations" />
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : filteredQuotations.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={11} align="center">
                    <Typography>
                      {searchTerm || activeTab !== 'todas' ? (
                        <FormattedMessage id="no-quotations-found" />
                      ) : (
                        <FormattedMessage id="no-quotations-registered" />
                      )}
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                filteredQuotations.map((quotation, index) => (
                  <TableRow
                    key={quotation.Id}
                    hover
                    sx={{
                      backgroundColor: selectedQuotation === quotation.Id ? alpha(theme.palette.primary.main, 0.1) : 'inherit'
                    }}
                  >
                    <TableCell>{index + 1}</TableCell>
                    <TableCell>
                      <Stack direction="row" spacing={1} alignItems="center">
                        <Typography variant="subtitle2" color="primary">
                          {quotation.NumberQuotation}
                        </Typography>
                        {quotation.Version && quotation.Version > 1 && (
                          <Chip 
                            label={`v${quotation.Version}`} 
                            size="small" 
                            color="secondary" 
                            sx={{ height: 20, fontSize: '0.7rem' }}
                          />
                        )}
                        {quotation.IsLatestVersion === false && (
                          <Chip 
                            label="Anterior" 
                            size="small" 
                            variant="outlined"
                            color="default"
                            sx={{ height: 20, fontSize: '0.7rem' }}
                          />
                        )}
                      </Stack>
                    </TableCell>
                    <TableCell>
                      <Box>
                        <Typography variant="subtitle2">{quotation.customerName}</Typography>
                        <Typography variant="caption" color="textSecondary">
                          {quotation.Customer?.Email}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">{quotation.advisorName}</Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">{quotation.companyName}</Typography>
                    </TableCell>
                    <TableCell align="right">
                      <Typography variant="body2">${quotation.SubTotal?.toLocaleString('es-CO') || '0'}</Typography>
                    </TableCell>
                    <TableCell align="right">
                      <Typography variant="body2">${quotation.Tax?.toLocaleString('es-CO') || '0'}</Typography>
                    </TableCell>
                    <TableCell align="right">
                      <Typography variant="subtitle2" color="primary">
                        ${quotation.Total?.toLocaleString('es-CO') || '0'}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">{quotation.formattedDate}</Typography>
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <QuotationStatusChip status={quotation.Status || 'Nueva'} />
                        {/* Botón para cambiar estado hacia adelante (Nueva -> En proceso -> Cerrada) */}
                        {quotation.Status !== 'Cerrada' && (
                          <Tooltip title="Cambiar estado">
                            <IconButton 
                              size="small" 
                              onClick={() => {
                                const nextStatus = quotation.Status === 'Nueva' ? 'En proceso' : 'Cerrada';
                                handleStatusChange(quotation.Id, nextStatus);
                              }}
                              disabled={statusChangeLoading === quotation.Id}
                            >
                              {statusChangeLoading === quotation.Id ? (
                                <svg width="16" height="16" viewBox="0 0 24 24">
                                  <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" fill="none" strokeDasharray="31.416" strokeDashoffset="31.416">
                                    <animate attributeName="stroke-dashoffset" dur="2s" values="31.416;0" repeatCount="indefinite"/>
                                  </circle>
                                </svg>
                              ) : (
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                                  <path d="M7 13l3 3 7-7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                </svg>
                              )}
                            </IconButton>
                          </Tooltip>
                        )}
                        {/* Botón para regresar de Cerrada a En proceso */}
                        {quotation.Status === 'Cerrada' && (
                          <Tooltip title="Regresar a En proceso">
                            <IconButton
                              size="small"
                              color="warning"
                              onClick={() => handleStatusChange(quotation.Id, 'En proceso')}
                              disabled={statusChangeLoading === quotation.Id}
                            >
                              <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                                <path d="M17 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H17v-2z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                              </svg>
                            </IconButton>
                          </Tooltip>
                        )}
                        {/* Icono para descargar Excel si está Cerrada */}
                        {quotation.Status === 'Cerrada' && (
                          <Tooltip title="Descargar Excel">
                            <IconButton
                              size="small"
                              color="success"
                              onClick={() => downloadQuotationExcel(quotation.Id)}
                            >
                              <DocumentDownload />
                            </IconButton>
                          </Tooltip>
                        )}
                      </Box>
                    </TableCell>
                    <TableCell align="center">
                      <Stack direction="row" spacing={0.5} justifyContent="center">
                        <QuotationPdfViewer
                          quotationId={quotation.Id}
                          quotationNumber={quotation.NumberQuotation}
                          variant="icon"
                          label={intl.formatMessage({ id: 'view-pdf' }) || 'Ver PDF'}
                        />
                        <QuotationCatalogViewer
                          quotationId={quotation.Id}
                          quotationNumber={quotation.NumberQuotation}
                          variant="icon"
                          label="Ver Catálogo"
                        />
                        {/* Mostrar botón "Ver Historial" solo si tiene versiones */}
                        {(quotation.Version > 1 || quotation.BaseQuotationId) && (
                          <Tooltip title="Ver historial de versiones">
                            <IconButton 
                              color="warning" 
                              onClick={() => {
                                setSelectedQuotationForHistory(quotation.Id);
                                setVersionsDialogOpen(true);
                              }}
                            >
                              <Clock />
                            </IconButton>
                          </Tooltip>
                        )}
                        <Tooltip title={intl.formatMessage({ id: 'edit' })}>
                          <IconButton color="primary" onClick={() => navigate(`/quotations/edit/${quotation.Id}`)}>
                            <Edit />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Copiar cotización">
                          <IconButton color="secondary" onClick={() => handleCopyQuotation(quotation.Id)}>
                            <Copy />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Enviar por correo">
                          <IconButton
                            color="info"
                            onClick={() => {
                              setQuotationToSend(quotation);
                              setOpenSendEmail(true);
                            }}
                          >
                            <svg width="20" height="20" fill="none" viewBox="0 0 24 24">
                              <path
                                d="M2 6.5V17.5C2 19.43 3.57 21 5.5 21H18.5C20.43 21 22 19.43 22 17.5V6.5C22 4.57 20.43 3 18.5 3H5.5C3.57 3 2 4.57 2 6.5ZM4.5 6.5L12 13.5L19.5 6.5"
                                stroke="#1976d2"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                              />
                            </svg>
                          </IconButton>
                        </Tooltip>

                        <Tooltip title={intl.formatMessage({ id: 'delete' })}>
                          <IconButton color="error" onClick={() => handleDelete(quotation)}>
                            <Trash />
                          </IconButton>
                        </Tooltip>
                      </Stack>
                      <SendQuotationEmailDialog
                        open={openSendEmail}
                        onClose={() => {
                          setOpenSendEmail(false);
                          setQuotationToSend(null);
                        }}
                        loading={sendingEmail}
                        defaultTo={quotationToSend?.Customer?.Email || ''}
                        quotation={quotationToSend || undefined}
                        onSend={async ({ to, cc, message }) => {
                          if (!quotationToSend) return;
                          setSendingEmail(true);
                          try {
                            await sendQuotationEmail({
                              quotationId: quotationToSend.Id,
                              to,
                              cc,
                              message,
                              quotation: quotationToSend
                            });
                            setOpenSendEmail(false);
                            setQuotationToSend(null);
                            
                            // Refrescar todas las listas de cotizaciones usando las claves correctas de SWR
                            mutate('quotation:list');
                            mutate('quotation:list:Nueva');
                            mutate('quotation:list:En proceso');
                            mutate('quotation:list:Cerrada');
                            
                            openSnackbar({ open: true, message: 'Correo enviado correctamente', variant: 'alert', alert: { color: 'success' } } as SnackbarProps);
                          } catch (err: any) {
                            openSnackbar({ open: true, message: 'Error al enviar el correo', variant: 'alert', alert: { color: 'error' } } as SnackbarProps);
                          } finally {
                            setSendingEmail(false);
                          }
                        }}
                      />
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </MainCard>

      <DeleteQuotationDialog
        open={deleteDialogOpen}
        onClose={handleCloseDeleteDialog}
        onConfirm={confirmDelete}
        quotationNumber={quotationToDelete?.NumberQuotation}
        loading={deleting}
      />

      <VersionsHistoryDialog
        open={versionsDialogOpen}
        onClose={() => {
          setVersionsDialogOpen(false);
          setSelectedQuotationForHistory(null);
        }}
        quotationId={selectedQuotationForHistory || 0}
      />
    </>
  );
};

export default QuotationsList;
