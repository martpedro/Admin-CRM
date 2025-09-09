import { useState } from 'react';

// material-ui
import Button from '@mui/material/Button';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import Divider from '@mui/material/Divider';
import FormControl from '@mui/material/FormControl';
import FormHelperText from '@mui/material/FormHelperText';
import Grid from '@mui/material/Grid';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import Select from '@mui/material/Select';
import Stack from '@mui/material/Stack';
import Switch from '@mui/material/Switch';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import FormControlLabel from '@mui/material/FormControlLabel';
import Tooltip from '@mui/material/Tooltip';
import Box from '@mui/material/Box';

// third-party
import * as Yup from 'yup';
import { useFormik, Form, FormikProvider } from 'formik';

// project-imports
import IconButton from 'components/@extended/IconButton';
import { createPermission } from 'api/permissions';

// types
import { PermissionAdvanced, PermissionType, DataScope } from 'types/permission';

// assets
import { Trash } from 'iconsax-react';

interface Props {
  permission?: PermissionAdvanced | null;
  closeModal: () => void;
}

const PermissionSchema = Yup.object().shape({
  permissionKey: Yup.string()
    .required('La clave del permiso es requerida')
    .matches(/^[A-Z_]+$/, 'La clave debe contener solo letras mayúsculas y guiones bajos'),
  name: Yup.string().required('El nombre es requerido'),
  description: Yup.string(),
  module: Yup.string().required('El módulo es requerido'),
  type: Yup.string().required('El tipo es requerido'),
  dataScope: Yup.string().when('type', {
    is: PermissionType.DATA_SCOPE,
    then: (schema) => schema.required('El alcance de datos es requerido cuando el tipo es DATA_SCOPE'),
    otherwise: (schema) => schema.notRequired()
  }),
  isActive: Yup.boolean()
});

export default function FormPermissionAdd({ permission, closeModal }: Props) {
  const [loading, setLoading] = useState(false);

  const isCreating = !permission;

  const formik = useFormik({
    initialValues: {
      permissionKey: permission?.permissionKey || '',
      name: permission?.name || '',
      description: permission?.description || '',
      module: permission?.module || '',
      type: permission?.type || PermissionType.BASIC_CRUD,
      dataScope: permission?.dataScope || '',
      isActive: permission?.isActive ?? true
    },
    validationSchema: PermissionSchema,
    onSubmit: async (values, { setErrors, setStatus, setSubmitting }) => {
      try {
        setLoading(true);
        setStatus(null);
        setErrors({});

        const permissionData = {
          ...values,
          dataScope: values.type === PermissionType.DATA_SCOPE ? (values.dataScope as DataScope) : undefined
        };

        if (isCreating) {
          await createPermission(permissionData);
          console.log('Permiso creado exitosamente');
        } else {
          // await updatePermission(permission.id!, permissionData);
          console.log('Permiso actualizado exitosamente');
        }

        setSubmitting(false);
        closeModal();
      } catch (error: any) {
        console.error('Error procesando permiso:', error);
        setStatus({ success: false });
        setErrors({});
        setSubmitting(false);
      } finally {
        setLoading(false);
      }
    }
  });

  const { errors, touched, values, isSubmitting, handleSubmit, getFieldProps } = formik;

  return (
    <FormikProvider value={formik}>
      <Form autoComplete="off" noValidate onSubmit={handleSubmit}>
        <DialogTitle>
          <Typography variant="h4">
            {isCreating ? 'Crear Nuevo Permiso' : 'Editar Permiso'}
          </Typography>
        </DialogTitle>
        
        <Divider />
        
        <DialogContent sx={{ p: 2.5 }}>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Stack spacing={1}>
                <InputLabel htmlFor="permission-key">Clave del Permiso *</InputLabel>
                <TextField
                  fullWidth
                  id="permission-key"
                  placeholder="Ingrese la clave del permiso (ej: USER_CREATE)"
                  {...getFieldProps('permissionKey')}
                  error={Boolean(touched.permissionKey && errors.permissionKey)}
                  helperText={touched.permissionKey && errors.permissionKey}
                />
              </Stack>
            </Grid>

            <Grid item xs={12} md={6}>
              <Stack spacing={1}>
                <InputLabel htmlFor="permission-name">Nombre *</InputLabel>
                <TextField
                  fullWidth
                  id="permission-name"
                  placeholder="Ingrese el nombre del permiso"
                  {...getFieldProps('name')}
                  error={Boolean(touched.name && errors.name)}
                  helperText={touched.name && errors.name}
                />
              </Stack>
            </Grid>

            <Grid item xs={12}>
              <Stack spacing={1}>
                <InputLabel htmlFor="permission-description">Descripción</InputLabel>
                <TextField
                  fullWidth
                  id="permission-description"
                  multiline
                  rows={3}
                  placeholder="Descripción del permiso"
                  {...getFieldProps('description')}
                  error={Boolean(touched.description && errors.description)}
                  helperText={touched.description && errors.description}
                />
              </Stack>
            </Grid>

            <Grid item xs={12} md={6}>
              <Stack spacing={1}>
                <InputLabel htmlFor="permission-module">Módulo *</InputLabel>
                <TextField
                  fullWidth
                  id="permission-module"
                  placeholder="Módulo del sistema (ej: Users, Customers)"
                  {...getFieldProps('module')}
                  error={Boolean(touched.module && errors.module)}
                  helperText={touched.module && errors.module}
                />
              </Stack>
            </Grid>

            <Grid item xs={12} md={6}>
              <Stack spacing={1}>
                <InputLabel htmlFor="permission-type">Tipo de Permiso *</InputLabel>
                <FormControl fullWidth error={Boolean(touched.type && errors.type)}>
                  <Select
                    id="permission-type"
                    {...getFieldProps('type')}
                  >
                    <MenuItem value={PermissionType.BASIC_CRUD}>CRUD Básico</MenuItem>
                    <MenuItem value={PermissionType.DATA_SCOPE}>Alcance de Datos</MenuItem>
                    <MenuItem value={PermissionType.MENU_ACCESS}>Acceso a Menú</MenuItem>
                    <MenuItem value={PermissionType.ACTION_PERMISSION}>Acción Específica</MenuItem>
                  </Select>
                  {touched.type && errors.type && (
                    <FormHelperText error>{errors.type}</FormHelperText>
                  )}
                </FormControl>
              </Stack>
            </Grid>

            {values.type === PermissionType.DATA_SCOPE && (
              <Grid item xs={12} md={6}>
                <Stack spacing={1}>
                  <InputLabel htmlFor="permission-data-scope">Alcance de Datos *</InputLabel>
                  <FormControl fullWidth error={Boolean(touched.dataScope && errors.dataScope)}>
                    <Select
                      id="permission-data-scope"
                      {...getFieldProps('dataScope')}
                    >
                      <MenuItem value={DataScope.ALL}>Todos los Datos</MenuItem>
                      <MenuItem value={DataScope.TEAM_ONLY}>Solo Equipo</MenuItem>
                      <MenuItem value={DataScope.OWN_ONLY}>Solo Propios</MenuItem>
                      <MenuItem value={DataScope.DEPARTMENT}>Departamento</MenuItem>
                      <MenuItem value={DataScope.REGIONAL}>Regional</MenuItem>
                    </Select>
                    {touched.dataScope && errors.dataScope && (
                      <FormHelperText error>{errors.dataScope}</FormHelperText>
                    )}
                  </FormControl>
                </Stack>
              </Grid>
            )}

            <Grid item xs={12}>
              <FormControlLabel
                control={
                  <Switch
                    checked={values.isActive}
                    {...getFieldProps('isActive')}
                  />
                }
                label="Permiso Activo"
              />
            </Grid>
          </Grid>
        </DialogContent>

        <Divider />

        <DialogActions sx={{ p: 2.5 }}>
          <Grid container justifyContent="space-between" alignItems="center">
            <Grid item>
              <Stack direction="row" spacing={2} alignItems="center">
                <Button color="error" onClick={closeModal}>
                  Cancelar
                </Button>
              </Stack>
            </Grid>
            <Grid item>
              <Stack direction="row" spacing={2} alignItems="center">
                <Button
                  type="submit"
                  variant="contained"
                  disabled={isSubmitting || loading}
                >
                  {isCreating ? 'Crear' : 'Actualizar'}
                </Button>
              </Stack>
            </Grid>
          </Grid>
        </DialogActions>
      </Form>
    </FormikProvider>
  );
}
