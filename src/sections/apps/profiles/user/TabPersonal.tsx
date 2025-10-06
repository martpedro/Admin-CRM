import { RefObject, useState, useEffect } from 'react';
import { useOutletContext } from 'react-router';

// third-party
import { FormattedMessage, useIntl } from 'react-intl';

// project-imports
import useAuth from 'hooks/useAuth';
import { updateCurrentUserPersonal, getCurrentUserProfile } from 'api/user';

// material-ui
import Button from '@mui/material/Button';
import FormHelperText from '@mui/material/FormHelperText';
import Grid from '@mui/material/Grid2';
import InputLabel from '@mui/material/InputLabel';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import Box from '@mui/material/Box';

// third-party
import { Formik } from 'formik';
import * as Yup from 'yup';

// project-imports
import { openSnackbar } from 'api/snackbar';
import MainCard from 'components/MainCard';

// types
import { SnackbarProps } from 'types/snackbar';





function useInputRef() {
  return useOutletContext<RefObject<HTMLInputElement>>();
}

// ==============================|| USER PROFILE - PERSONAL ||============================== //

export default function TabPersonal() {
  const intl = useIntl();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [userProfile, setUserProfile] = useState<any>(null);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    if (user?.id) {
      loadUserProfile();
    }
  }, [user?.id]);

  const loadUserProfile = async () => {
    try {
      setLoading(true);
      const result = await getCurrentUserProfile();
      
      if (result.success) {
        setUserProfile(result.data);
      } else {
        // Usar datos del contexto si falla la API
        setUserProfile({
          Name: user?.name || '',
          Email: user?.email || '',
          Phone: '',
          LastName: ''
        });
      }
    } catch (err: any) {
      console.error('Error cargando perfil:', err);
      setError(intl.formatMessage({ id: 'error-loading-user-data' }));
    } finally {
      setLoading(false);
    }
  };


  const inputRef = useInputRef();

  if (loading) {
    return <MainCard><div>Cargando...</div></MainCard>;
  }

  if (error) {
    return <MainCard><div style={{ color: 'red' }}>{error}</div></MainCard>;
  }

  return (
    <MainCard content={false} title={<FormattedMessage id="personal-information" />} sx={{ '& .MuiInputLabel-root': { fontSize: '0.875rem' } }}>
      <Formik
        enableReinitialize
        initialValues={{
          firstname: userProfile?.Name || user?.name || '',
          lastname: userProfile?.LastName || userProfile?.LastNAme || '',
          email: userProfile?.Email || user?.email || '',
          contact: userProfile?.Phone || '',
          submit: null
        }}
        validationSchema={Yup.object().shape({
          firstname: Yup.string().max(255).required(intl.formatMessage({ id: 'first-name-required' })),
          lastname: Yup.string().max(255).required(intl.formatMessage({ id: 'last-name-required' })),
          email: Yup.string().email(intl.formatMessage({ id: 'invalid-email' })).max(255).required(intl.formatMessage({ id: 'email-required' })),
          contact: Yup.string()
            .test('len', intl.formatMessage({ id: 'contact-10-digits' }), (val) => !val || val.toString().length >= 10)
        })}
        onSubmit={async (values, { setErrors, setStatus, setSubmitting }) => {
          try {
            setLoading(true);
            const updateData = {
              name: values.firstname,
              lastName: values.lastname,
              email: values.email,
              phone: values.contact
            };
            
            const result = await updateCurrentUserPersonal(updateData);
            
            if (!result.success) {
              throw new Error(result.error || 'Error updating profile');
            }
            
            // Recargar datos del perfil después de la actualización
            await loadUserProfile();
            
            openSnackbar({
              open: true,
              message: intl.formatMessage({ id: 'profile-updated-success' }),
              variant: 'alert',
              alert: { color: 'success' },
              anchorOrigin: { vertical: 'bottom', horizontal: 'right' },
              transition: 'Fade',
              close: false,
              action: false,
              actionButton: false,
              dense: false,
              maxStack: 3,
              iconVariant: 'usedefault'
            } as SnackbarProps);
            
            setStatus({ success: true });
            setSubmitting(false);
          } catch (err: any) {
            console.error('Error actualizando perfil:', err);
            openSnackbar({
              open: true,
              message: err.message || intl.formatMessage({ id: 'error-updating-personal-info' }),
              variant: 'alert',
              alert: { color: 'error' },
              anchorOrigin: { vertical: 'bottom', horizontal: 'right' },
              transition: 'Fade',
              close: false,
              action: false,
              actionButton: false,
              dense: false,
              maxStack: 3,
              iconVariant: 'usedefault'
            } as SnackbarProps);
            setStatus({ success: false });
            setErrors({ submit: err.message });
            setSubmitting(false);
          } finally {
            setLoading(false);
          }
        }}
      >
        {({ errors, handleBlur, handleChange, handleSubmit, isSubmitting, setFieldValue, touched, values }) => (
          <form noValidate onSubmit={handleSubmit}>
            <Box sx={{ p: 2.5 }}>
              <Grid container spacing={3}>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <Stack sx={{ gap: 1 }}>
                    <InputLabel htmlFor="personal-first-name"><FormattedMessage id="first-name" /></InputLabel>
                    <TextField
                      fullWidth
                      id="personal-first-name"
                      value={values.firstname}
                      name="firstname"
                      onBlur={handleBlur}
                      onChange={handleChange}
                      placeholder={intl.formatMessage({ id: 'enter-first-name' })}
                      autoFocus
                      inputRef={inputRef}
                    />
                  </Stack>
                  {touched.firstname && errors.firstname && (
                    <FormHelperText error id="personal-first-name-helper">
                      {errors.firstname as string}
                    </FormHelperText>
                  )}
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <Stack sx={{ gap: 1 }}>
                    <InputLabel htmlFor="personal-last-name"><FormattedMessage id="last-name" /></InputLabel>
                    <TextField
                      fullWidth
                      id="personal-last-name"
                      value={values.lastname}
                      name="lastname"
                      onBlur={handleBlur}
                      onChange={handleChange}
                      placeholder={intl.formatMessage({ id: 'enter-last-name' })}
                    />
                  </Stack>
                  {touched.lastname && errors.lastname && (
                    <FormHelperText error id="personal-last-name-helper">
                      {errors.lastname as string}
                    </FormHelperText>
                  )}
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <Stack sx={{ gap: 1 }}>
                    <InputLabel htmlFor="personal-email"><FormattedMessage id="email" /></InputLabel>
                    <TextField
                      type="email"
                      fullWidth
                      value={values.email}
                      name="email"
                      onBlur={handleBlur}
                      onChange={handleChange}
                      id="personal-email"
                      placeholder={intl.formatMessage({ id: 'enter-email' })}
                    />
                  </Stack>
                  {touched.email && errors.email && (
                    <FormHelperText error id="personal-email-helper">
                      {errors.email as string}
                    </FormHelperText>
                  )}
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <Stack sx={{ gap: 1 }}>
                    <InputLabel htmlFor="personal-phone"><FormattedMessage id="phone-number" /></InputLabel>
                    <TextField
                      fullWidth
                      id="personal-phone"
                      value={values.contact}
                      name="contact"
                      onBlur={handleBlur}
                      onChange={handleChange}
                      placeholder={intl.formatMessage({ id: 'contact-number' })}
                    />
                  </Stack>
                  {touched.contact && errors.contact && (
                    <FormHelperText error id="personal-contact-helper">
                      {errors.contact as string}
                    </FormHelperText>
                  )}
                </Grid>
                <Grid size={12}>
                  <Stack direction="row" sx={{ gap: 2, justifyContent: 'flex-end', alignItems: 'center', mt: 2.5 }}>
                    <Button variant="outlined" color="secondary">
                      <FormattedMessage id="cancel" />
                    </Button>
                    <Button disabled={isSubmitting || Object.keys(errors).length !== 0} type="submit" variant="contained">
                      <FormattedMessage id="save" />
                    </Button>
                  </Stack>
                </Grid>
              </Grid>
            </Box>

          </form>
        )}
      </Formik>
    </MainCard>
  );
}
