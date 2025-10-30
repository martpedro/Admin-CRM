import { useEffect, useState } from 'react';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import Grid2 from '@mui/material/Grid2';

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
import { createTeam, updateTeam } from 'api/permissions';
import { useActiveUsers } from 'hooks/useActiveUsers';

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
  const [openAlert, setOpenAlert] = useState(false);
  const [loading, setLoading] = useState(false);
  const { users } = useActiveUsers();
  const availableLeaders = users.filter((user: User) => user.isActive);
  const availableMembers = users.filter((user: User) => user.isActive);

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
      } else {
        await createTeam(teamData);
      }
      closeModal();
    } catch (error: any) {
      if (error?.response?.data?.errors) {
        setErrors(error.response.data.errors);
      } else {
        alert(error?.response?.data?.message || 'Error al procesar equipo');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Formik initialValues={initialValues} validationSchema={validationSchema} onSubmit={onSubmit} enableReinitialize>
      {({ errors, handleBlur, handleChange, handleSubmit, isSubmitting, touched, values, setFieldValue }) => (
        <Form autoComplete="off" noValidate onSubmit={handleSubmit}>
          <DialogTitle>{team ? 'Editar Equipo' : 'Nuevo Equipo'}</DialogTitle>
          <Divider />
          <DialogContent sx={{ p: 2.5 }}>
            <Grid2 container spacing={3}>
              <Grid2 size={{ xs: 12, sm: 6 }}>
                <Stack spacing={1}>
                  <InputLabel htmlFor="team-name">Nombre del Equipo *</InputLabel>
                  <TextField
                    id="team-name"
                    type="text"
                    value={values.name}
                    name="name"
                    onBlur={handleBlur}
                    onChange={handleChange}
                    placeholder="Ingrese el nombre del equipo"
                    fullWidth
                    error={Boolean(touched.name && errors.name)}
                    helperText={touched.name && errors.name ? errors.name : ''}
                  />
                </Stack>
              </Grid2>
              <Grid2 size={{ xs: 12, sm: 6 }}>
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
                      input={<OutlinedInput id="select-leader" placeholder="Seleccionar líder" />}
                      renderValue={(selected) => {
                        if (!selected) return <em>Seleccione el líder del equipo</em>;
                        const user = availableLeaders.find((u: User) => u.id === selected);
                        return user ? `${user.name} ${user.lastName}` : '';
                      }}
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
              </Grid2>
              <Grid2 size={12}>
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
                    helperText={touched.description && errors.description ? errors.description : ''}
                  />
                </Stack>
              </Grid2>
              <Grid2 size={12}>
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
                      input={<OutlinedInput id="select-members" placeholder="Seleccionar miembros" />}
                      renderValue={(selected) => {
                        if (!selected || selected.length === 0) {
                          return <em>Seleccione los miembros del equipo</em>;
                        }
                        return selected
                          .map((id: number) => {
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
                        .filter((user: User) => user.id !== values.leaderId)
                        .map((user: User) => (
                          <MenuItem key={user.id} value={user.id}>
                            {user.name} {user.lastName} - {user.email}
                          </MenuItem>
                        ))}
                    </Select>
                  </FormControl>
                </Stack>
              </Grid2>
            </Grid2>
          </DialogContent>
          <Divider sx={{ my: 3 }} />
          <DialogActions sx={{ p: 2.5 }}>
            <Grid2 container sx={{ justifyContent: 'space-between', alignItems: 'center', width: 1 }}>
              <Grid2>
                <Button color="error" onClick={closeModal}>
                  Cancelar
                </Button>
              </Grid2>
              <Grid2>
                <Button type="submit" variant="contained" disabled={isSubmitting || loading}>
                  {team ? 'Actualizar' : 'Agregar'}
                </Button>
              </Grid2>
            </Grid2>
          </DialogActions>
        </Form>
      )}
    </Formik>
  );
}
