import { useCallback, useMemo } from 'react';

// material-ui
import Modal from '@mui/material/Modal';
import Stack from '@mui/material/Stack';
import Box from '@mui/material/Box';

// project-imports
import FormUserAdd from './FormUserAdd';
import { useGetUser } from 'api/user';
import CircularWithPath from 'components/@extended/progress/CircularWithPath';
import MainCard from 'components/MainCard';
import SimpleBar from 'components/third-party/SimpleBar';

// types
import { UserList } from 'types/user';

interface Props {
  open: boolean;
  modalToggler: (state: boolean) => void;
  user?: UserList | null;
}

// ==============================|| USER ADD / EDIT ||============================== //

export default function UserModal({ open, modalToggler, user: user }: Props) {
  const { usersLoading: loading } = useGetUser();

  const closeModal = useCallback(() => modalToggler(false), [modalToggler]);

  const userForm = useMemo(
    () => !loading && <FormUserAdd user={user || null} closeModal={closeModal} />,
    [user, loading, closeModal]
  );

  return (
    <>
      {open && (
        <Modal
          open={open}
          onClose={closeModal}
          aria-labelledby="modal-user-add-label"
          aria-describedby="modal-user-add-description"
          sx={{ '& .MuiPaper-root:focus': { outline: 'none' } }}
        >
          <MainCard
            sx={{ minWidth: { xs: 340, sm: 600, md: 880 }, maxWidth: 880, height: 'auto', maxHeight: 'calc(100vh - 48px)' }}
            modal
            content={false}
          >
            <SimpleBar
              sx={{ width: 1, maxHeight: `calc(100vh - 48px)`, '& .simplebar-content': { display: 'flex', flexDirection: 'column' } }}
            >
              {loading ? (
                <Box sx={{ p: 5 }}>
                  <Stack direction="row" sx={{ justifyContent: 'center' }}>
                    <CircularWithPath />
                  </Stack>
                </Box>
              ) : (
                userForm
              )}
            </SimpleBar>
          </MainCard>
        </Modal>
      )}
    </>
  );
}
