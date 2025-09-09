import { useEffect, useState } from 'react';

// material-ui
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Divider from '@mui/material/Divider';
import FormControl from '@mui/material/FormControl';
import FormHelperText from '@mui/material/FormHelperText';
import Grid from '@mui/material/Grid';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import OutlinedInput from '@mui/material/OutlinedInput';
import Select from '@mui/material/Select';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';

// third-party
import { Formik, Form, FormikHelpers } from 'formik';
import * as Yup from 'yup';

// project-imports
import Avatar from 'components/@extended/Avatar';
import IconButton from 'components/@extended/IconButton';

// assets
import { Camera, Trash } from 'iconsax-react';

// api
import { createTeam, updateTeam, useGetUsers } from 'api/permissions';

// types
import { Team, User } from 'types/permission';

interface Props {
  team?: Team | null;
  closeModal: () => void;
}

interface FormValues {
  name: string;
  description: string;
  leaderId: number | '';
  members: number[];
}

// ==============================|| TEAM ADD / EDIT - FORM ||============================== //

export default function FormTeamAdd({ team, closeModal }: Props) {
  const [loading, setLoading] = useState(false);
  const { users } = useGetUsers();

  const initialValues: FormValues = {
    name: team?.name || '',
    description: team?.description || '',
    leaderId: team?.leaderId || '',
    members: team?.members?.map(m => m.userId) || []
  };

  const validationSchema = Yup.object().shape({
    name: Yup.string().max(255).required('El nombre es requerido'),
    description: Yup.string().max(500),
    leaderId: Yup.number().required('El líder del equipo es requerido'),
    members: Yup.array().of(Yup.number())
  });

  const onSubmit = async (values: FormValues, { setErrors }: FormikHelpers<FormValues>) => {
    try {
      setLoading(true);
      
      const teamData = {
        name: values.name,
        description: values.description,
        leaderId: Number(values.leaderId),
        memberIds: values.members
      };

      if (team?.id) {
        await updateTeam({ id: team.id, ...teamData });
        console.log('Equipo actualizado exitosamente');
      } else {
        await createTeam(teamData);
        console.log('Equipo creado exitosamente');
      }
      
      closeModal();
    } catch (error: any) {
      console.error('Error al procesar equipo:', error);
      
      if (error?.response?.data?.errors) {
        setErrors(error.response.data.errors);
      } else {
        alert(error?.response?.data?.message || 'Error al procesar equipo');
      }
    } finally {
      setLoading(false);
    }
  };

  const availableLeaders = users.filter((user: User) => user.isActive);
  const availableMembers = users.filter((user: User) => user.isActive);

  return (
    <Formik initialValues={initialValues} validationSchema={validationSchema} onSubmit={onSubmit} enableReinitialize>
      {({ errors, handleBlur, handleChange, handleSubmit, isSubmitting, touched, values, setFieldValue }) => (
        <Form autoComplete="off" noValidate onSubmit={handleSubmit}>
          <Box sx={{ p: { xs: 2, sm: 3, md: 4, lg: 5 } }}>
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <Typography variant="h4">
                  {team ? 'Editar Equipo' : 'Agregar Nuevo Equipo'}
                </Typography>
              </Grid>

              <Grid item xs={12}>
                <Divider />
              </Grid>

              <Grid item xs={12} sm={6}>
                <Stack spacing={1}>
                  <InputLabel htmlFor="team-name">Nombre del Equipo *</InputLabel>
                  <OutlinedInput
                    id="team-name"
                    type="text"
                    value={values.name}
                    name="name"
                    onBlur={handleBlur}
                    onChange={handleChange}
                    placeholder="Ingrese el nombre del equipo"
                    fullWidth
                    error={Boolean(touched.name && errors.name)}
                  />
                  {touched.name && errors.name && (
                    <FormHelperText error id="team-name-helper">
                      {errors.name}
                    </FormHelperText>
                  )}
                </Stack>
              </Grid>

              <Grid item xs={12} sm={6}>
                <Stack spacing={1}>
                  <InputLabel htmlFor="team-leader">Líder del Equipo *</InputLabel>
                  <FormControl fullWidth error={Boolean(touched.leaderId && errors.leaderId)}>
                    <Select
                      id="team-leader"
                      displayEmpty
                      value={values.leaderId}
                      name="leaderId"
                      onBlur={handleBlur}
                      onChange={handleChange}
                    >
                      <MenuItem disabled value="">
                        <em>Seleccione el líder del equipo</em>
                      </MenuItem>
                      {availableLeaders.map((user: User) => (
                        <MenuItem key={user.id} value={user.id}>
                          {user.name} {user.lastName} - {user.email}
                        </MenuItem>
                      ))}
                    </Select>
                    {touched.leaderId && errors.leaderId && (
                      <FormHelperText error id="team-leader-helper">
                        {errors.leaderId}
                      </FormHelperText>
                    )}
                  </FormControl>
                </Stack>
              </Grid>

              <Grid item xs={12}>
                <Stack spacing={1}>
                  <InputLabel htmlFor="team-description">Descripción</InputLabel>
                  <TextField
                    id="team-description"
                    multiline
                    rows={3}
                    value={values.description}
                    name="description"
                    onBlur={handleBlur}
                    onChange={handleChange}
                    placeholder="Ingrese la descripción del equipo"
                    fullWidth
                    error={Boolean(touched.description && errors.description)}
                  />
                  {touched.description && errors.description && (
                    <FormHelperText error id="team-description-helper">
                      {errors.description}
                    </FormHelperText>
                  )}
                </Stack>
              </Grid>

              <Grid item xs={12}>
                <Stack spacing={1}>
                  <InputLabel htmlFor="team-members">Miembros del Equipo</InputLabel>
                  <FormControl fullWidth>
                    <Select
                      id="team-members"
                      multiple
                      displayEmpty
                      value={values.members}
                      onChange={(event) => {
                        const value = event.target.value;
                        setFieldValue('members', typeof value === 'string' ? value.split(',').map(Number) : value);
                      }}
                      renderValue={(selected) => {
                        if (selected.length === 0) {
                          return <em>Seleccione los miembros del equipo</em>;
                        }
                        return selected
                          .map(id => {
                            const user = availableMembers.find((u: User) => u.id === id);
                            return user ? `${user.name} ${user.lastName}` : '';
                          })
                          .filter(Boolean)
                          .join(', ');
                      }}
                    >
                      <MenuItem disabled value="">
                        <em>Seleccione los miembros del equipo</em>
                      </MenuItem>
                      {availableMembers
                        .filter((user: User) => user.id !== values.leaderId) // Excluir al líder de los miembros
                        .map((user: User) => (
                          <MenuItem key={user.id} value={user.id}>
                            {user.name} {user.lastName} - {user.email}
                          </MenuItem>
                        ))}
                    </Select>
                  </FormControl>
                </Stack>
              </Grid>
            </Grid>
          </Box>

          <Divider />

          <Box sx={{ p: 2.5 }}>
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
                  <Button type="submit" variant="contained" disabled={isSubmitting || loading}>
                    {team ? 'Actualizar' : 'Agregar'}
                  </Button>
                </Stack>
              </Grid>
            </Grid>
          </Box>
        </Form>
      )}
    </Formik>
  );
}
