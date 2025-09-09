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

// project-imports
import Breadcrumbs from 'components/@extended/Breadcrumbs';
import MainCard from 'components/MainCard';
import { useQuotations, useQuotationOperations } from 'hooks/useQuotations';

// assets
import { Add, Edit, Trash, Eye, SearchNormal1 } from 'iconsax-react';

// types
import { Quotation } from 'api/quotations';

// types for status
type StatusKey = 'todas' | 'recientes' | 'vigentes' | 'vencidas';

interface StatusTab {
  key: StatusKey;
  label: string;
  count: number;
}

const QuotationsList = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const intl = useIntl();
  const { quotations, isLoading, error } = useQuotations();
  const { deleteQuotation } = useQuotationOperations();

  const [selectedQuotation, setSelectedQuotation] = useState<number | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState<StatusKey>('todas');

  const handleDelete = async (id: number) => {
    if (window.confirm(intl.formatMessage({ id: 'confirm-delete-quotation' }))) {
      const result = await deleteQuotation(id);
      if (!result.success) {
        alert(result.error);
      }
    }
  };

  const getStatusCategory = (createdAt: string): StatusKey => {
    const created = new Date(createdAt);
    const now = new Date();
    const daysDiff = (now.getTime() - created.getTime()) / (1000 * 3600 * 24);
    
    if (daysDiff <= 7) return 'recientes';
    if (daysDiff <= 30) return 'vigentes';
    return 'vencidas';
  };

  const getStatusColor = (createdAt: string) => {
    const category = getStatusCategory(createdAt);
    switch (category) {
      case 'recientes': return 'success';
      case 'vigentes': return 'warning';
      case 'vencidas': return 'error';
      default: return 'default';
    }
  };

  const getStatusText = (createdAt: string) => {
    const created = new Date(createdAt);
    const now = new Date();
    const daysDiff = Math.floor((now.getTime() - created.getTime()) / (1000 * 3600 * 24));
    
    if (daysDiff === 0) return intl.formatMessage({ id: 'today' });
    if (daysDiff <= 7) return `${daysDiff} ${intl.formatMessage({ id: 'days' })}`;
    if (daysDiff <= 30) return `${daysDiff} ${intl.formatMessage({ id: 'days' })}`;
    return `${daysDiff} ${intl.formatMessage({ id: 'days-expired' })}`;
  };

  const quotationsData = useMemo(() => {
    return quotations.map((quotation: Quotation) => ({
      ...quotation,
      customerName: `${quotation.Customer?.Name || ''} ${quotation.Customer?.LastName || ''}`.trim(),
      advisorName: `${quotation.User?.Name || ''} ${quotation.User?.LastNAme || ''}`.trim(),
      companyName: quotation.Company?.Name || '',
      formattedDate: format(new Date(quotation.CreatedAt), 'dd/MM/yyyy', { locale: es }),
      status: getStatusText(quotation.CreatedAt),
      statusColor: getStatusColor(quotation.CreatedAt),
      statusCategory: getStatusCategory(quotation.CreatedAt)
    }));
  }, [quotations]);

  // Calcular conteos para tabs
  const statusCounts = useMemo(() => {
    const counts = {
      todas: quotationsData.length,
      recientes: 0,
      vigentes: 0,
      vencidas: 0
    };

    quotationsData.forEach(quotation => {
      counts[quotation.statusCategory]++;
    });

    return counts;
  }, [quotationsData]);

  // Crear tabs con conteos
  const statusTabs: StatusTab[] = [
    { key: 'todas', label: intl.formatMessage({ id: 'all' }), count: statusCounts.todas },
    { key: 'recientes', label: intl.formatMessage({ id: 'recent' }), count: statusCounts.recientes },
    { key: 'vigentes', label: intl.formatMessage({ id: 'valid' }), count: statusCounts.vigentes },
    { key: 'vencidas', label: intl.formatMessage({ id: 'expired' }), count: statusCounts.vencidas }
  ];

  // Filtrar cotizaciones
  const filteredQuotations = useMemo(() => {
    let filtered = quotationsData;

    // Filtrar por estado
    if (activeTab !== 'todas') {
      filtered = filtered.filter(quotation => quotation.statusCategory === activeTab);
    }

    // Filtrar por búsqueda
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(quotation =>
        quotation.NumberQuotation?.toLowerCase().includes(term) ||
        quotation.customerName.toLowerCase().includes(term) ||
        quotation.advisorName.toLowerCase().includes(term) ||
        quotation.companyName.toLowerCase().includes(term) ||
        quotation.Customer?.Email?.toLowerCase().includes(term)
      );
    }

    return filtered;
  }, [quotationsData, activeTab, searchTerm]);

  if (error) {
    return (
      <MainCard>
        <Typography color="error">
          <FormattedMessage id="error-loading-quotations" />: {error.message}
        </Typography>
      </MainCard>
    );
  }

  return (
    <>
      <Breadcrumbs
        links={[
          { title: intl.formatMessage({ id: 'home' }), to: '/' },
          { title: intl.formatMessage({ id: 'quotations' }) }
        ]}
        title
        rightAlign
      />
      
      {/* Header con búsqueda y botón crear */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
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
          sx={{ width: { xs: '100%', sm: 400 } }}
        />
        
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
                <TableCell><FormattedMessage id="quotation-number" /></TableCell>
                <TableCell><FormattedMessage id="customer" /></TableCell>
                <TableCell><FormattedMessage id="advisor" /></TableCell>
                <TableCell><FormattedMessage id="company" /></TableCell>
                <TableCell align="right"><FormattedMessage id="subtotal" /></TableCell>
                <TableCell align="right"><FormattedMessage id="taxes" /></TableCell>
                <TableCell align="right"><FormattedMessage id="total" /></TableCell>
                <TableCell><FormattedMessage id="date" /></TableCell>
                <TableCell><FormattedMessage id="status" /></TableCell>
                <TableCell align="center"><FormattedMessage id="actions" /></TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={11} align="center">
                    <Typography><FormattedMessage id="loading-quotations" /></Typography>
                  </TableCell>
                </TableRow>
              ) : filteredQuotations.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={11} align="center">
                    <Typography>
                      {searchTerm || activeTab !== 'todas' 
                        ? <FormattedMessage id="no-quotations-found" />
                        : <FormattedMessage id="no-quotations-registered" />
                      }
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
                      <Typography variant="subtitle2" color="primary">
                        {quotation.NumberQuotation}
                      </Typography>
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
                      <Typography variant="body2">
                        ${quotation.SubTotal?.toLocaleString('es-CO') || '0'}
                      </Typography>
                    </TableCell>
                    <TableCell align="right">
                      <Typography variant="body2">
                        ${quotation.Tax?.toLocaleString('es-CO') || '0'}
                      </Typography>
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
                      <Chip
                        label={quotation.status}
                        color={quotation.statusColor as any}
                        size="small"
                        variant="light"
                      />
                    </TableCell>
                    <TableCell align="center">
                      <Stack direction="row" spacing={0.5} justifyContent="center">
                        <Tooltip title={intl.formatMessage({ id: 'view-details' })}>
                          <IconButton
                            color="secondary"
                            onClick={() => navigate(`/quotations/view/${quotation.Id}`)}
                          >
                            <Eye />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title={intl.formatMessage({ id: 'edit' })}>
                          <IconButton
                            color="primary"
                            onClick={() => navigate(`/quotations/edit/${quotation.Id}`)}
                          >
                            <Edit />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title={intl.formatMessage({ id: 'delete' })}>
                          <IconButton
                            color="error"
                            onClick={() => handleDelete(quotation.Id)}
                          >
                            <Trash />
                          </IconButton>
                        </Tooltip>
                      </Stack>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </MainCard>
    </>
  );
};

export default QuotationsList;
