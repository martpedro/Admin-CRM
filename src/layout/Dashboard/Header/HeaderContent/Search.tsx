import { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';

// material-ui
import { useTheme } from '@mui/material/styles';
import FormControl from '@mui/material/FormControl';
import InputAdornment from '@mui/material/InputAdornment';
import OutlinedInput from '@mui/material/OutlinedInput';
import Box from '@mui/material/Box';
import Popper from '@mui/material/Popper';
import Paper from '@mui/material/Paper';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemAvatar from '@mui/material/ListItemAvatar';
import ListItemText from '@mui/material/ListItemText';
import Avatar from '@mui/material/Avatar';
import Typography from '@mui/material/Typography';
import Chip from '@mui/material/Chip';
import CircularProgress from '@mui/material/CircularProgress';
import Divider from '@mui/material/Divider';
import ClickAwayListener from '@mui/material/ClickAwayListener';

// third-party
import { debounce } from 'lodash';

// project imports
import globalSearchApi, { SearchResult } from 'api/search';

// assets
import { SearchNormal1, Receipt, Profile } from 'iconsax-react';

// ==============================|| HEADER CONTENT - SEARCH ||============================== //

export default function Search() {
  const theme = useTheme();
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<{ quotations: SearchResult[]; customers: SearchResult[] }>({ quotations: [], customers: [] });
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const anchorRef = useRef<HTMLDivElement>(null);

  // Debounced search function
  const debouncedSearch = useCallback(
    debounce(async (searchQuery: string) => {
      if (!searchQuery.trim()) {
        setResults({ quotations: [], customers: [] });
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const searchResults = await globalSearchApi.search(searchQuery, 8);
        setResults(searchResults);
      } catch (error) {
        console.error('Error en búsqueda global:', error);
        setResults({ quotations: [], customers: [] });
      } finally {
        setLoading(false);
      }
    }, 300),
    []
  );

  useEffect(() => {
    debouncedSearch(query);
  }, [query, debouncedSearch]);

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;
    setQuery(value);
    setOpen(value.length > 0);
  };

  const handleResultClick = (result: SearchResult) => {
    setOpen(false);
    setQuery('');
    navigate(result.url);
  };

  const handleClickAway = () => {
    setOpen(false);
  };

  const handleInputFocus = () => {
    if (query.length > 0) {
      setOpen(true);
    }
  };

  const getStatusColor = (status: string, type: string) => {
    if (type === 'quotation') {
      switch (status) {
        case 'Nueva': return 'primary';
        case 'En proceso': return 'warning';
        case 'Cerrada': return 'success';
        default: return 'default';
      }
    }
    return 'default';
  };

  const formatAmount = (amount?: number) => {
    if (!amount) return '';
    return `$${amount.toLocaleString('es-MX')}`;
  };

  const hasResults = results.quotations.length > 0 || results.customers.length > 0;

  return (
    <ClickAwayListener onClickAway={handleClickAway}>
      <Box sx={{ width: '100%', ml: { xs: 0, md: 2 }, position: 'relative' }} ref={anchorRef}>
        <FormControl sx={{ width: { xs: '100%', md: 280 } }}>
          <OutlinedInput
            id="header-search"
            value={query}
            onChange={handleInputChange}
            onFocus={handleInputFocus}
            startAdornment={
              <InputAdornment position="start" sx={{ mr: -0.5 }}>
                {loading ? (
                  <CircularProgress size={16} />
                ) : (
                  <SearchNormal1 size={16} />
                )}
              </InputAdornment>
            }
            aria-describedby="header-search-text"
            inputProps={{ 'aria-label': 'Buscar cotizaciones y clientes' }}
            placeholder="Buscar cotizaciones y clientes..."
            sx={{ 
              '& .MuiOutlinedInput-input': { p: 1.5 },
              backgroundColor: theme.palette.background.paper
            }}
          />
        </FormControl>

        <Popper
          open={open && (query.length > 0)}
          anchorEl={anchorRef.current}
          placement="bottom-start"
          style={{ 
            width: anchorRef.current?.clientWidth || 280,
            zIndex: theme.zIndex.modal + 1 
          }}
        >
          <Paper
            elevation={8}
            sx={{
              mt: 1,
              maxHeight: 400,
              overflow: 'auto',
              border: `1px solid ${theme.palette.divider}`,
            }}
          >
            {loading ? (
              <Box sx={{ p: 2, textAlign: 'center' }}>
                <CircularProgress size={24} />
                <Typography variant="body2" sx={{ mt: 1 }}>
                  Buscando...
                </Typography>
              </Box>
            ) : hasResults ? (
              <List sx={{ py: 0 }}>
                {/* Cotizaciones */}
                {results.quotations.length > 0 && (
                  <>
                    <ListItem sx={{ py: 1, px: 2, bgcolor: theme.palette.grey[50] }}>
                      <Receipt size={16} style={{ marginRight: 8 }} />
                      <Typography variant="subtitle2" color="primary">
                        Cotizaciones ({results.quotations.length})
                      </Typography>
                    </ListItem>
                    {results.quotations.map((result) => (
                      <ListItemButton
                        key={`quotation-${result.id}`}
                        onClick={() => handleResultClick(result)}
                        sx={{ py: 1 }}
                      >
                        <ListItemAvatar>
                          <Avatar
                            sx={{
                              bgcolor: theme.palette.primary.main,
                              width: 32,
                              height: 32,
                              fontSize: '0.875rem'
                            }}
                          >
                            {result.avatar}
                          </Avatar>
                        </ListItemAvatar>
                        <ListItemText
                          primary={
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              <Typography variant="subtitle2" noWrap>
                                {result.title}
                              </Typography>
                              <Chip
                                label={result.status}
                                size="small"
                                color={getStatusColor(result.status, result.type) as any}
                                sx={{ height: 20, fontSize: '0.75rem' }}
                              />
                            </Box>
                          }
                          secondary={
                            <Box>
                              <Typography variant="body2" color="text.secondary" noWrap>
                                {result.subtitle}
                              </Typography>
                              <Typography variant="caption" color="text.secondary">
                                {result.description}
                              </Typography>
                            </Box>
                          }
                        />
                        {result.amount && (
                          <Typography variant="subtitle2" color="primary" sx={{ ml: 1 }}>
                            {formatAmount(result.amount)}
                          </Typography>
                        )}
                      </ListItemButton>
                    ))}
                  </>
                )}

                {/* Divider entre cotizaciones y clientes */}
                {results.quotations.length > 0 && results.customers.length > 0 && (
                  <Divider />
                )}

                {/* Clientes */}
                {results.customers.length > 0 && (
                  <>
                    <ListItem sx={{ py: 1, px: 2, bgcolor: theme.palette.grey[50] }}>
                      <Profile size={16} style={{ marginRight: 8 }} />
                      <Typography variant="subtitle2" color="secondary">
                        Clientes ({results.customers.length})
                      </Typography>
                    </ListItem>
                    {results.customers.map((result) => (
                      <ListItemButton
                        key={`customer-${result.id}`}
                        onClick={() => handleResultClick(result)}
                        sx={{ py: 1 }}
                      >
                        <ListItemAvatar>
                          <Avatar
                            sx={{
                              bgcolor: theme.palette.secondary.main,
                              width: 32,
                              height: 32,
                              fontSize: '0.875rem'
                            }}
                          >
                            {result.avatar}
                          </Avatar>
                        </ListItemAvatar>
                        <ListItemText
                          primary={
                            <Typography variant="subtitle2" noWrap>
                              {result.title}
                            </Typography>
                          }
                          secondary={
                            <Box>
                              <Typography variant="body2" color="text.secondary" noWrap>
                                {result.subtitle}
                              </Typography>
                              <Typography variant="caption" color="text.secondary">
                                {result.description}
                              </Typography>
                            </Box>
                          }
                        />
                      </ListItemButton>
                    ))}
                  </>
                )}
              </List>
            ) : query.length > 2 ? (
              <Box sx={{ p: 3, textAlign: 'center' }}>
                <SearchNormal1 size={32} style={{ opacity: 0.5, marginBottom: 8 }} />
                <Typography variant="body2" color="text.secondary">
                  No se encontraron resultados para "{query}"
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Intenta con el nombre del cliente, número de cotización o empresa
                </Typography>
              </Box>
            ) : (
              <Box sx={{ p: 2, textAlign: 'center' }}>
                <Typography variant="body2" color="text.secondary">
                  Escribe al menos 3 caracteres para buscar
                </Typography>
              </Box>
            )}
          </Paper>
        </Popper>
      </Box>
    </ClickAwayListener>
  );
}
