import Modal from '@mui/material/Modal';
import MainCard from 'components/MainCard';
import SimpleBar from 'components/third-party/SimpleBar';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import CircularWithPath from 'components/@extended/progress/CircularWithPath';
import FormCompany from './FormCompany';
import { CompanyInfo } from 'types/company';

export default function CompanyModal({ open, onClose, initial, onSubmit }: { open: boolean; onClose: () => void; initial?: Partial<CompanyInfo>; onSubmit: (data: Partial<CompanyInfo>) => void; }) {
  return (
    <>
      {open && (
        <Modal open={open} onClose={onClose}>
          <MainCard sx={{ minWidth: { xs: 340, sm: 600 }, maxWidth: 720, height: 'auto', maxHeight: 'calc(100vh - 48px)' }} modal content={false}>
            <SimpleBar sx={{ width: 1, maxHeight: `calc(100vh - 48px)`, '& .simplebar-content': { display: 'flex', flexDirection: 'column' } }}>
              <Box sx={{ p: 3 }}>
                <FormCompany initial={initial} onSubmit={(vals) => onSubmit(vals)} />
              </Box>
            </SimpleBar>
          </MainCard>
        </Modal>
      )}
    </>
  );
}
