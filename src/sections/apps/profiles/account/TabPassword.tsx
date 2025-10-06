import { useState, SyntheticEvent } from 'react';

// third-party
import { FormattedMessage, useIntl } from 'react-intl';

// material-ui
import Button from '@mui/material/Button';
import FormHelperText from '@mui/material/FormHelperText';
import Grid from '@mui/material/Grid2';
import InputAdornment from '@mui/material/InputAdornment';
import InputLabel from '@mui/material/InputLabel';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import OutlinedInput from '@mui/material/OutlinedInput';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';

// project-imports
import { openSnackbar } from 'api/snackbar';
import * as userApi from 'api/user';
import IconButton from 'components/@extended/IconButton';
import MainCard from 'components/MainCard';
import { isNumber, isLowercaseChar, isUppercaseChar, isSpecialChar, minLength } from 'utils/password-validation';

// third-party
import { Formik } from 'formik';
import * as Yup from 'yup';

// types
import { SnackbarProps } from 'types/snackbar';

// assets
import { Eye, EyeSlash, Minus, TickCircle } from 'iconsax-react';

// ==============================|| ACCOUNT PROFILE - PASSWORD CHANGE ||============================== //

export default function TabPassword() {
  const intl = useIntl();
  const [showOldPassword, setShowOldPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleClickShowOldPassword = () => {
    setShowOldPassword(!showOldPassword);
  };
  const handleClickShowNewPassword = () => {
    setShowNewPassword(!showNewPassword);
  };
  const handleClickShowConfirmPassword = () => {
    setShowConfirmPassword(!showConfirmPassword);
  };

  const handleMouseDownPassword = (event: SyntheticEvent) => {
    event.preventDefault();
  };

  return (
    <MainCard title={<FormattedMessage id="change-password" />}>
      <Formik
        initialValues={{
          old: '',
          password: '',
          confirm: '',
          submit: null
        }}
        validationSchema={Yup.object().shape({
          old: Yup.string().required(intl.formatMessage({ id: 'current-password-required' })),
          password: Yup.string()
            .required(intl.formatMessage({ id: 'new-password-required' }))
            .matches(
              /^.*(?=.{8,})((?=.*[!@#$%^&*()\-_=+{};:,<.>]){1})(?=.*\d)((?=.*[a-z]){1})((?=.*[A-Z]){1}).*$/,
              intl.formatMessage({ id: 'password-requirements' })
            ),
          confirm: Yup.string()
            .required(intl.formatMessage({ id: 'confirm-password-required' }))
            .test('confirm', intl.formatMessage({ id: 'passwords-not-match' }), (confirm: string, yup: any) => yup.parent.password === confirm)
        })}
        onSubmit={async (values, { resetForm, setErrors, setStatus, setSubmitting }) => {
          try {
            const result = await userApi.changeUserPassword({
              oldPassword: values.old,
              newPassword: values.password
            });

            if (result.success) {
              openSnackbar({
                action: false,
                open: true,
                message: intl.formatMessage({ id: 'password-changed-success' }),
                anchorOrigin: {
                  vertical: 'bottom',
                  horizontal: 'right'
                },
                variant: 'alert',
                alert: {
                  color: 'success',
                  variant: 'filled'
                },
                transition: 'Fade',
                close: false,
                actionButton: false,
                dense: false,
                maxStack: 3,
                iconVariant: 'usedefault'
              } as SnackbarProps);

              resetForm();
              setStatus({ success: true });
            } else {
              throw new Error(result.error || 'Failed to change password');
            }
          } catch (err: any) {
            console.error('Error changing password:', err);
            openSnackbar({
              action: false,
              open: true,
              message: err.message || intl.formatMessage({ id: 'error-changing-password' }),
              anchorOrigin: {
                vertical: 'bottom',
                horizontal: 'right'
              },
              variant: 'alert',
              alert: {
                color: 'error',
                variant: 'filled'
              },
              transition: 'Fade',
              close: false,
              actionButton: false,
              dense: false,
              maxStack: 3,
              iconVariant: 'usedefault'
            } as SnackbarProps);
            
            setStatus({ success: false });
            setErrors({ submit: err.message });
          } finally {
            setSubmitting(false);
          }
        }}
      >
        {({ errors, handleBlur, handleChange, handleSubmit, isSubmitting, touched, values }) => (
          <form noValidate onSubmit={handleSubmit}>
            <Grid container spacing={3}>
              <Grid container spacing={3} size={{ xs: 12, sm: 6 }}>
                <Grid size={12}>
                  <Stack sx={{ gap: 1 }}>
                    <InputLabel htmlFor="password-old"><FormattedMessage id="current-password" /></InputLabel>
                    <OutlinedInput
                      id="password-old"
                      placeholder={intl.formatMessage({ id: 'enter-current-password' })}
                      type={showOldPassword ? 'text' : 'password'}
                      value={values.old}
                      name="old"
                      onBlur={handleBlur}
                      onChange={handleChange}
                      endAdornment={
                        <InputAdornment position="end">
                          <IconButton
                            aria-label="toggle password visibility"
                            onClick={handleClickShowOldPassword}
                            onMouseDown={handleMouseDownPassword}
                            edge="end"
                            size="large"
                            color="secondary"
                          >
                            {showOldPassword ? <Eye /> : <EyeSlash />}
                          </IconButton>
                        </InputAdornment>
                      }
                      autoComplete="password-old"
                    />
                  </Stack>
                  {touched.old && errors.old && (
                    <FormHelperText error id="password-old-helper">
                      {errors.old}
                    </FormHelperText>
                  )}
                </Grid>
                <Grid size={12}>
                  <Stack sx={{ gap: 1 }}>
                    <InputLabel htmlFor="password-password"><FormattedMessage id="new-password" /></InputLabel>
                    <OutlinedInput
                      id="password-password"
                      placeholder={intl.formatMessage({ id: 'enter-new-password' })}
                      type={showNewPassword ? 'text' : 'password'}
                      value={values.password}
                      name="password"
                      onBlur={handleBlur}
                      onChange={handleChange}
                      endAdornment={
                        <InputAdornment position="end">
                          <IconButton
                            aria-label="toggle password visibility"
                            onClick={handleClickShowNewPassword}
                            onMouseDown={handleMouseDownPassword}
                            edge="end"
                            size="large"
                            color="secondary"
                          >
                            {showNewPassword ? <Eye /> : <EyeSlash />}
                          </IconButton>
                        </InputAdornment>
                      }
                      autoComplete="password-password"
                    />
                  </Stack>
                  {touched.password && errors.password && (
                    <FormHelperText error id="password-password-helper">
                      {errors.password}
                    </FormHelperText>
                  )}
                </Grid>
                <Grid size={12}>
                  <Stack sx={{ gap: 1 }}>
                    <InputLabel htmlFor="password-confirm"><FormattedMessage id="confirm-password" /></InputLabel>
                    <OutlinedInput
                      id="password-confirm"
                      placeholder={intl.formatMessage({ id: 'confirm-new-password' })}
                      type={showConfirmPassword ? 'text' : 'password'}
                      value={values.confirm}
                      name="confirm"
                      onBlur={handleBlur}
                      onChange={handleChange}
                      endAdornment={
                        <InputAdornment position="end">
                          <IconButton
                            aria-label="toggle password visibility"
                            onClick={handleClickShowConfirmPassword}
                            onMouseDown={handleMouseDownPassword}
                            edge="end"
                            size="large"
                            color="secondary"
                          >
                            {showConfirmPassword ? <Eye /> : <EyeSlash />}
                          </IconButton>
                        </InputAdornment>
                      }
                      autoComplete="password-confirm"
                    />
                  </Stack>
                  {touched.confirm && errors.confirm && (
                    <FormHelperText error id="password-confirm-helper">
                      {errors.confirm}
                    </FormHelperText>
                  )}
                </Grid>
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <Box sx={{ p: { xs: 0, sm: 2, md: 4, lg: 5 } }}>
                  <Typography variant="h5"><FormattedMessage id="password-requirements-title" /></Typography>
                  <List sx={{ p: 0, mt: 1 }}>
                    <ListItem divider>
                      <ListItemIcon sx={{ color: minLength(values.password, 8) ? 'success.main' : 'inherit' }}>
                        {minLength(values.password, 8) ? <TickCircle /> : <Minus />}
                      </ListItemIcon>
                      <ListItemText primary="Al menos 8 caracteres" />
                    </ListItem>
                    <ListItem divider>
                      <ListItemIcon sx={{ color: isLowercaseChar(values.password) ? 'success.main' : 'inherit' }}>
                        {isLowercaseChar(values.password) ? <TickCircle /> : <Minus />}
                      </ListItemIcon>
                      <ListItemText primary="Al menos 1 letra minúscula (a-z)" />
                    </ListItem>
                    <ListItem divider>
                      <ListItemIcon sx={{ color: isUppercaseChar(values.password) ? 'success.main' : 'inherit' }}>
                        {isUppercaseChar(values.password) ? <TickCircle /> : <Minus />}
                      </ListItemIcon>
                      <ListItemText primary="Al menos 1 letra mayúscula (A-Z)" />
                    </ListItem>
                    <ListItem divider>
                      <ListItemIcon sx={{ color: isNumber(values.password) ? 'success.main' : 'inherit' }}>
                        {isNumber(values.password) ? <TickCircle /> : <Minus />}
                      </ListItemIcon>
                      <ListItemText primary="Al menos 1 número (0-9)" />
                    </ListItem>
                    <ListItem>
                      <ListItemIcon sx={{ color: isSpecialChar(values.password) ? 'success.main' : 'inherit' }}>
                        {isSpecialChar(values.password) ? <TickCircle /> : <Minus />}
                      </ListItemIcon>
                      <ListItemText primary="Al menos 1 carácter especial" />
                    </ListItem>
                  </List>
                </Box>
              </Grid>
              <Grid size={12}>
                <Stack direction="row" sx={{ gap: 2, justifyContent: 'flex-end', alignItems: 'center' }}>
                  <Button variant="outlined" color="secondary">
                    Cancelar
                  </Button>
                  <Button disabled={isSubmitting || Object.keys(errors).length !== 0} type="submit" variant="contained">
                    <FormattedMessage id="update-password" />
                  </Button>
                </Stack>
              </Grid>
            </Grid>
          </form>
        )}
      </Formik>
    </MainCard>
  );
}
