import { useCallback, useMemo } from 'react';

// material-ui
import Modal from '@mui/material/Modal';
import Box from '@mui/material/Box';

// project-imports
import FormPermissionAdd from './FormPermissionAddFixed';
import MainCard from 'components/MainCard';
import SimpleBar from 'components/third-party/SimpleBar';

// types
import { PermissionAdvanced } from 'types/permission';

interface Props {
  open: boolean;
  modalToggler: () => void;
  permission?: PermissionAdvanced | null;
}

// ==============================|| PERMISSION ADD / EDIT ||============================== //

export default function PermissionModal({ open, modalToggler, permission }: Props) {
  const closeModal = useCallback(() => modalToggler(), [modalToggler]);

  const isCreating = useMemo(() => !permission, [permission]);

  return (
    <Modal
      open={open}
      onClose={closeModal}
      aria-labelledby="modal-permission-add-label"
      aria-describedby="modal-permission-add-description"
      sx={{
        '& .MuiModal-paper': {
          width: `calc(100% - 48px)`,
          minWidth: 340,
          maxWidth: 880,
          height: `calc(100% - 48px)`,
          maxHeight: 'none'
        }
      }}
    >
      <MainCard
        sx={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: { xs: `calc(100% - 48px)`, md: 'calc(100% - 96px)' },
          maxWidth: { xs: 350, md: 880 },
          height: 'auto',
          maxHeight: { xs: `calc(100% - 48px)`, md: `calc(100% - 96px)` }
        }}
        content={false}
      >
        <SimpleBar sx={{ maxHeight: `calc(100vh - 156px)`, '& .simplebar-content': { display: 'flex', flexDirection: 'column' } }}>
          <FormPermissionAdd permission={permission} closeModal={closeModal} />
        </SimpleBar>
      </MainCard>
    </Modal>
  );
}
