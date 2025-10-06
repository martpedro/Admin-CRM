import { useEffect, useState, ChangeEvent } from 'react';
import usePermissions from 'hooks/usePermissions';
import { CompanyInfo } from 'types/company';
import useSWR from 'swr';
import companyApi from 'api/company';
import roleApi, { RoleItem } from 'api/role';

// material-ui
import Autocomplete from '@mui/material/Autocomplete';
import Button from '@mui/material/Button';
import Chip from '@mui/material/Chip';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import Divider from '@mui/material/Divider';
import FormControl from '@mui/material/FormControl';
import FormControlLabel from '@mui/material/FormControlLabel';
import FormHelperText from '@mui/material/FormHelperText';
import FormLabel from '@mui/material/FormLabel';
import Grid from '@mui/material/Grid2';
import InputLabel from '@mui/material/InputLabel';
import ListItemText from '@mui/material/ListItemText';
import MenuItem from '@mui/material/MenuItem';
import OutlinedInput from '@mui/material/OutlinedInput';
import Radio from '@mui/material/Radio';
import RadioGroup from '@mui/material/RadioGroup';
import Select, { SelectChangeEvent } from '@mui/material/Select';
import Stack from '@mui/material/Stack';
import Switch from '@mui/material/Switch';
import TextField from '@mui/material/TextField';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';

import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFnsV3';

// third-party
import * as Yup from 'yup';
import { useFormik, Form, FormikProvider } from 'formik';

// project-imports
import AlertUserDelete from './AlertUserDelete';
import Avatar from 'components/@extended/Avatar';
import AvatarWithInitials from 'components/AvatarWithInitials';
import IconButton from 'components/@extended/IconButton';
import CircularWithPath from 'components/@extended/progress/CircularWithPath';

import { insertUser, updateUser } from 'api/user';
import { useGetMenuPermissions, setUserMenus, getUserMenus, type MenuPermissionItem } from 'api/menu-permissions';
import { openSnackbar } from 'api/snackbar';
import { Gender } from 'config';
import { ImagePath, getImageUrl } from 'utils/getImageUrl';
import { generateInitialsAvatar, getInitials } from 'utils/avatar-generator';

// assets
import { Camera, CloseCircle, Trash } from 'iconsax-react';

// types
import { SnackbarProps } from 'types/snackbar';
import { UserList } from 'types/user';

interface StatusProps {
  value: number;
  label: string;
}

const skills = [
  'Adobe XD',
  'After Effect',
  'Angular',
  'Animation',
  'ASP.Net',
  'Bootstrap',
  'C#',
  'CC',
  'Corel Draw',
  'CSS',
  'DIV',
  'Dreamweaver',
  'Figma',
  'Graphics',
  'HTML',
  'Illustrator',
  'J2Ee',
  'Java',
  'Javascript',
  'JQuery',
  'Logo Design',
  'Material UI',
  'Motion',
  'MVC',
  'MySQL',
  'NodeJS',
  'npm',
  'Photoshop',
  'PHP',
  'React',
  'Redux',
  'Reduxjs & tooltit',
  'SASS',
  'SCSS',
  'SQL Server',
  'SVG',
  'UI/UX',
  'User Interface Designing',
  'Wordpress'
];

// CONSTANT
const getInitialValues = (user: any | null) => {
  const base: any = {
    id: 0,
    firstName: '',
    lastName: '',
    middleName: '',
    name: '',
    email: '',
    avatar: 1,
    gender: Gender.FEMALE,
    role: '',
    letterasigned: '',
    orders: 0,
    progress: 50,
    status: 2,
    orderStatus: '',
    contact: '',
    isInactive: false,
    about: '',
    location: '',
    country: '',
    address: [],
    skills: [],
    time: ['just now'],
    date: ''
  };

  if (!user) return base;

  // Mapear desde ApiUser si vienen esos campos
  const mapped: any = { ...base };
  mapped.id = user.Id ?? user.id ?? 0;
  mapped.firstName = user.firstName ?? user.name ?? '';
  mapped.lastName = user.lastName ?? user.LastName ?? '';
  mapped.middleName = user.middleName ?? user.MotherLastName ?? '';
  mapped.name = `${mapped.firstName} ${mapped.lastName}`.trim();
  mapped.email = user.email ?? '';
  mapped.contact = user.Phone ?? user.contact ?? '';
  mapped.letterasigned = user.letterasigned ?? user.LetterAsign ?? '';
  mapped.isInactive = user.isInactive ?? (user.isActive === false ? true : false);
  return mapped;
};

const allStatus: StatusProps[] = [
  { value: 3, label: 'Rejected' },
  { value: 1, label: 'Verified' },
  { value: 2, label: 'Pending' }
];

// ==============================|| CUSTOMER ADD / EDIT - FORM ||============================== //

export default function FormUserAdd({ user, closeModal }: { user: UserList | null; closeModal: () => void }) {
  const { canCreate, canUpdate, canDelete } = usePermissions();
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedImage, setSelectedImage] = useState<File | undefined>(undefined);
  const [avatar, setAvatar] = useState<string | undefined>(
    getImageUrl(`avatar-${user && user !== null && user?.avatar ? user.avatar : 1}.png`, ImagePath.USERS)
  );
  const [generatedAvatar, setGeneratedAvatar] = useState<string>('');

  // Estado para la empresa seleccionada
  const [empresa, setEmpresa] = useState<CompanyInfo | null>(null);
  // Obtener empresas desde el API
  const { data: empresas, isLoading: loadingEmpresas } = useSWR('empresas', companyApi.getAll);
  // Roles desde el API
  const { data: roles, isLoading: loadingRoles } = useSWR<RoleItem[]>('roles', () => roleApi.getAll(false));
  // Menús
  const { menus } = useGetMenuPermissions();
  const [selectedMenus, setSelectedMenus] = useState<string[]>([]);
  const [assignedMenuItems, setAssignedMenuItems] = useState<MenuPermissionItem[]>([]);

  useEffect(() => {
    if (selectedImage) {
      setAvatar(URL.createObjectURL(selectedImage));
    }
  }, [selectedImage]);

  useEffect(() => {
    setLoading(false);
  }, []);

  useEffect(() => {
    // Si editando, intentar cargar menús del usuario
    const loadMenus = async () => {
      if (!user) return;
      try {
        const list = await getUserMenus(Number((user as any).Id ?? user.id));
        setAssignedMenuItems(list);
        setSelectedMenus(list.map((m: any) => m.menuKey).filter(Boolean));
      } catch {}
    };
    loadMenus();
  }, [user]);

  const CustomerSchema = Yup.object().shape({
    firstName: Yup.string().max(255).required('El nombre es obligatorio'),
    lastName: Yup.string().max(255).required('El apellido es obligatorio'),
    middleName: Yup.string().max(255, 'El apellido no debe exceder los 255 caracteres'),
    email: Yup.string().max(255).required('El correo electrónico es obligatorio').email('Debe ser un correo electrónico válido'),
    status: Yup.string().required('El estado es obligatorio'),
    location: Yup.string().max(500, 'La ubicación no debe exceder los 500 caracteres'),
    about: Yup.string().max(500, 'La información no debe exceder los 500 caracteres')
  });

  const [openAlert, setOpenAlert] = useState(false);

  const handleAlertClose = () => {
    setOpenAlert(!openAlert);
    closeModal();
  };

  const formik = useFormik({
    initialValues: getInitialValues(user!),
    validationSchema: CustomerSchema,
    enableReinitialize: true,
    onSubmit: async (values, { setSubmitting }) => {
      try {
        let newUser: UserList = values;
        newUser.name = newUser.firstName + ' ' + newUser.lastName;

        if (user) {
          const userId = (user as any)?.Id ?? newUser.id!;
          updateUser(Number(userId), newUser, selectedImage).then(async (saved) => {
            // Guardar menús si hay selección
            if (selectedMenus.length) {
              await setUserMenus(Number(userId), selectedMenus);
            }
            console.log('newUser update', newUser);
            openSnackbar({
              open: true,
              message: 'Usuario actualizado exitosamente.',
              variant: 'alert',
              alert: {
                color: 'success'
              }
            } as SnackbarProps);
            setSubmitting(false);
            closeModal();
          });
        } else {
          console.log('newUser insert', newUser);
          await insertUser(newUser, selectedImage).then(async (saved: any) => {
            const newId = Number(saved?.Id || saved?.id || 0);
            if (newId && selectedMenus.length) {
              await setUserMenus(newId, selectedMenus);
            }

            openSnackbar({
              open: true,
              message: 'Usuario agregado exitosamente.',
              variant: 'alert',
              alert: {
                color: 'success'
              }
            } as SnackbarProps);
            setSubmitting(false);
            closeModal();
          });
        }
      } catch {}
    }
  });

  const { errors, touched, handleSubmit, isSubmitting, getFieldProps, setFieldValue } = formik;

  // Generar avatar con iniciales cuando cambian los nombres
  useEffect(() => {
    const generateDefaultAvatar = async () => {
      const firstName = formik.values.firstName;
      const lastName = formik.values.lastName;
      
      if (firstName && !selectedImage && !user?.avatar) {
        try {
          const avatarDataURL = await generateInitialsAvatar(firstName, lastName, 72);
          setGeneratedAvatar(avatarDataURL);
          if (!selectedImage) {
            setAvatar(avatarDataURL);
          }
        } catch (error) {
          console.error('Error generando avatar:', error);
        }
      }
    };
    
    generateDefaultAvatar();
  }, [formik.values.firstName, formik.values.lastName, selectedImage, user?.avatar]);

  if (loading)
    return (
      <Box sx={{ p: 5 }}>
        <Stack direction="row" sx={{ justifyContent: 'center' }}>
          <CircularWithPath />
        </Stack>
      </Box>
    );

  return (
    <>
      <FormikProvider value={formik}>
        <LocalizationProvider dateAdapter={AdapterDateFns}>
          <Form autoComplete="off" noValidate onSubmit={handleSubmit}>
            <DialogTitle>{user ? 'Editar Usuario' : 'Nuevo Usuario'}</DialogTitle>
            <Divider />
            <DialogContent sx={{ p: 2.5 }}>
              <Grid container spacing={3}>
                <Grid size={{ xs: 12, md: 3 }}>
                  <Stack direction="row" sx={{ justifyContent: 'center', mt: 3 }}>
                    <FormLabel
                      htmlFor="change-avatar"
                      sx={{
                        position: 'relative',
                        borderRadius: '50%',
                        overflow: 'hidden',
                        '&:hover .MuiBox-root': { opacity: 1 },
                        cursor: 'pointer'
                      }}
                    >
                      <AvatarWithInitials 
                        name={formik.values.firstName}
                        lastName={formik.values.lastName}
                        src={avatar}
                        size={72}
                        sx={{ border: '1px dashed #ccc' }}
                        fallbackToInitials={true}
                      />
                      <Box
                        sx={(theme) => ({
                          position: 'absolute',
                          top: 0,
                          left: 0,
                          bgcolor: 'rgba(0,0,0,.65)',
                          ...theme.applyStyles('dark', { bgcolor: 'rgba(255, 255, 255, .75)' }),
                          width: '100%',
                          height: '100%',
                          opacity: 0,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center'
                        })}
                      >
                        <Stack sx={{ gap: 0.5, alignItems: 'center', color: 'secondary.lighter' }}>
                          <Camera style={{ fontSize: '2rem' }} />
                          <Typography>Subir</Typography>
                        </Stack>
                      </Box>
                    </FormLabel>
                    <TextField
                      type="file"
                      id="change-avatar"
                      placeholder="Outlined"
                      variant="outlined"
                      sx={{ display: 'none' }}
                      onChange={(e: ChangeEvent<HTMLInputElement>) => setSelectedImage(e.target.files?.[0])}
                    />
                  </Stack>
                </Grid>
                <Grid size={{ xs: 12, md: 8 }}>
                  <Grid container spacing={3}>
                    {/* Empresa: solo Select */}
                    <Grid size={12}>
                      <Stack sx={{ gap: 1, mb: 2 }}>
                        <InputLabel htmlFor="empresa-select">Empresa</InputLabel>
                        <Select
                          id="empresa-select"
                          value={empresa?.id || ''}
                          onChange={(e) => {
                            const found = empresas?.find((emp) => emp.id === Number(e.target.value));
                            setEmpresa(found || null);
                            if (found?.quotationLetter) {
                              setFieldValue('letterasigned', String(found.quotationLetter).toUpperCase());
                            }
                          }}
                          displayEmpty
                          disabled={loadingEmpresas}
                        >
                          <MenuItem value="">
                            <em>{loadingEmpresas ? 'Cargando empresas...' : 'Selecciona una empresa'}</em>
                          </MenuItem>
                          {empresas &&
                            empresas.map((emp) => (
                              <MenuItem key={emp.id} value={emp.id}>
                                {emp.razonSocial}
                              </MenuItem>
                            ))}
                        </Select>
                      </Stack>
                    </Grid>
                    <Grid size={{ xs: 12, sm: 12 }}>
                      <Stack sx={{ gap: 1 }}>
                        <InputLabel htmlFor="user-firstName">Nombre</InputLabel>
                        <TextField
                          fullWidth
                          id="user-firstName"
                          placeholder="Ingrese el nombre"
                          {...getFieldProps('firstName')}
                          error={Boolean(touched.firstName && errors.firstName)}
                          helperText={touched.firstName && typeof errors.firstName === 'string' ? errors.firstName : undefined}
                        />
                      </Stack>
                    </Grid>
                    <Grid size={{ xs: 12, sm: 6 }}>
                      <Stack sx={{ gap: 1 }}>
                        <InputLabel htmlFor="user-lastName">Apellido Paterno</InputLabel>
                        <TextField
                          fullWidth
                          id="user-lastName"
                          placeholder="Ingrese el apellido"
                          {...getFieldProps('lastName')}
                          error={Boolean(touched.lastName && errors.lastName)}
                          helperText={touched.lastName && typeof errors.lastName === 'string' ? errors.lastName : undefined}
                        />
                      </Stack>
                    </Grid>

                    <Grid size={{ xs: 12, sm: 6 }}>
                      <Stack sx={{ gap: 1 }}>
                        <InputLabel htmlFor="user-middleName">Apellido Materno</InputLabel>
                        <TextField
                          fullWidth
                          id="user-middleName"
                          placeholder="Ingrese el apellido"
                          {...getFieldProps('middleName')}
                          error={Boolean(touched.middleName && errors.middleName)}
                          helperText={touched.middleName && typeof errors.middleName === 'string' ? errors.middleName : undefined}
                        />
                      </Stack>
                    </Grid>
                    <Grid size={12}>
                      <Stack sx={{ gap: 1 }}>
                        <InputLabel htmlFor="user-email">Correo electrónico</InputLabel>
                        <TextField
                          fullWidth
                          id="user-email"
                          placeholder="Ingrese el correo electrónico"
                          {...getFieldProps('email')}
                          error={Boolean(touched.email && errors.email)}
                          helperText={touched.email && typeof errors.email === 'string' ? errors.email : undefined}
                        />
                      </Stack>
                    </Grid>

                    <Grid size={{ xs: 12, sm: 6 }}>
                      <Stack sx={{ gap: 1 }}>
                        <InputLabel htmlFor="user-letterasigned">Letra de Cotización</InputLabel>
                        <TextField
                          fullWidth
                          id="user-letterasigned"
                          placeholder="Ingrese la letra de cotización"
                          {...getFieldProps('letterasigned')}
                          inputProps={{
                            style: { textTransform: 'uppercase' }
                          }}
                          onChange={(e: ChangeEvent<HTMLInputElement>) => {
                            const upperValue = e.target.value.toUpperCase();
                            setFieldValue('letterasigned', upperValue);
                          }}
                          value={formik.values.letterasigned}
                          error={Boolean(touched.letterasigned && errors.letterasigned)}
                          helperText={
                            touched.letterasigned && typeof (errors as any).letterasigned === 'string'
                              ? (errors as any).letterasigned
                              : undefined
                          }
                        />
                      </Stack>
                    </Grid>
                    {/* Menús visibles */}
                    <Grid size={{ xs: 12, sm: 6 }}>
                      <Stack sx={{ gap: 1 }}>
                        <InputLabel htmlFor="user-menus">Menús habilitados</InputLabel>
                        <Select
                          id="user-menus"
                          multiple
                          value={selectedMenus}
                          onChange={(e) =>
                            setSelectedMenus(typeof e.target.value === 'string' ? e.target.value.split(',') : (e.target.value as string[]))
                          }
                          input={<OutlinedInput id="select-menus" placeholder="Seleccionar menús" />}
                          renderValue={(selected) => {
                            const keys = selected as string[];
                            return keys.map((k) => menus?.find((m: any) => m.menuKey === k)?.menuName || k).join(', ');
                          }}
                        >
                          {(menus || []).map((m: any) => (
                            <MenuItem key={m.id} value={m.menuKey}>
                              <ListItemText primary={`${m.menuName}`} secondary={m.menuPath} />
                            </MenuItem>
                          ))}
                        </Select>
                        {/* Vista de menús asignados en backend */}
                        {user && assignedMenuItems.length > 0 && (
                          <Stack sx={{ gap: 1 }}>
                            <InputLabel>Menús asignados (actuales)</InputLabel>
                            <Stack direction="row" sx={{ flexWrap: 'wrap', gap: 0.5 }}>
                              {assignedMenuItems.map((m) => (
                                <Chip key={m.id} size="small" variant="outlined" label={`${m.menuName}`} />
                              ))}
                            </Stack>
                          </Stack>
                        )}
                      </Stack>
                    </Grid>
                    <Grid size={6}>
                      <Stack sx={{ gap: 1 }}>
                        <InputLabel htmlFor="user-role">Rol</InputLabel>
                        <FormControl fullWidth>
                          <Select
                            id="user-role"
                            displayEmpty
                            value={(formik.values as any).profile || ''}
                            onChange={(event: SelectChangeEvent<string | number>) => setFieldValue('profile', Number(event.target.value))}
                            input={<OutlinedInput id="select-role" placeholder="Seleccionar rol" />}
                            renderValue={(selected) => {
                              if (!selected) return <Typography variant="subtitle1">Seleccionar Rol</Typography>;
                              const r = roles?.find((it) => it.id === Number(selected));
                              return <Typography variant="subtitle2">{r?.name || 'Rol'}</Typography>;
                            }}
                          >
                            {roles?.map((r) => (
                              <MenuItem key={r.id} value={r.id}>
                                <ListItemText primary={r.name} />
                              </MenuItem>
                            ))}
                          </Select>
                        </FormControl>
                        {touched.role && typeof errors.role === 'string' && (
                          <FormHelperText error id="standard-weight-helper-text-email-login" sx={{ pl: 1.75 }}>
                            {String(errors.role)}
                          </FormHelperText>
                        )}
                      </Stack>
                    </Grid>
                    <Grid size={12}>
                      <Stack sx={{ gap: 1 }}>
                        <InputLabel htmlFor="user-skills">Subsidiarias</InputLabel>
                        <Autocomplete
                          multiple
                          fullWidth
                          id="user-skills"
                          options={skills}
                          {...getFieldProps('skills')}
                          getOptionLabel={(label) => label}
                          onChange={(event, newValue) => {
                            setFieldValue('skills', newValue);
                          }}
                          renderInput={(params) => <TextField {...params} name="skill" placeholder="Agregar habilidades" />}
                          renderTags={(value, getTagProps) =>
                            value.map((option, index) => (
                              <Chip
                                {...getTagProps({ index })}
                                variant="combined"
                                key={index}
                                label={option}
                                deleteIcon={<CloseCircle style={{ fontSize: '0.75rem' }} />}
                                sx={{ color: 'text.primary' }}
                              />
                            ))
                          }
                        />
                      </Stack>
                    </Grid>
                    <Grid size={12}>
                      <Stack direction="row" sx={{ justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <Stack sx={{ gap: 0.5 }}>
                          <Typography variant="subtitle1">Esta Inactivo</Typography>
                          <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                            Significa que no podra acceder al sistema
                          </Typography>
                        </Stack>
                        <FormControlLabel
                          control={
                            <Switch
                              checked={formik.values.isInactive}
                              onChange={(e: ChangeEvent<HTMLInputElement>) => setFieldValue('isInactive', e.target.checked)}
                              sx={{ mt: 0 }}
                            />
                          }
                          label=""
                          labelPlacement="start"
                        />
                      </Stack>
                    </Grid>
                  </Grid>
                </Grid>
              </Grid>
            </DialogContent>
            <Divider />
            <DialogActions sx={{ p: 2.5 }}>
              <Grid container sx={{ justifyContent: 'space-between', alignItems: 'center', width: 1 }}>
                <Grid>
                  {user && (
                    <Tooltip title="Delete User" placement="top">
                      <IconButton onClick={() => setOpenAlert(true)} size="large" color="error">
                        <Trash variant="Bold" />
                      </IconButton>
                    </Tooltip>
                  )}
                </Grid>
                <Grid>
                  <Stack direction="row" sx={{ gap: 2, alignItems: 'center' }}>
                    <Button color="error" onClick={closeModal}>
                      Cancel
                    </Button>
                    <Button type="submit" variant="contained" disabled={isSubmitting || (user ? !canUpdate('user') : !canCreate('user'))}>
                      {user ? 'Editar' : 'Agregar'}
                    </Button>
                  </Stack>
                </Grid>
              </Grid>
            </DialogActions>
          </Form>
        </LocalizationProvider>
      </FormikProvider>
      {user && canDelete('user') && (
        <AlertUserDelete
          id={Number(((user as any).Id ?? user.id) || 0)}
          title={user.name}
          open={openAlert}
          handleClose={handleAlertClose}
        />
      )}
    </>
  );
}
