import { useState } from 'react';

// material-ui
import Button from '@mui/material/Button';
import Skeleton from '@mui/material/Skeleton';
import Stack from '@mui/material/Stack';
import TableCell from '@mui/material/TableCell';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';

// third-party
import { FormikErrors, FormikTouched, getIn } from 'formik';

// project-imports
import InvoiceField from './InvoiceField';
import AlertProductDelete from './AlertProductDelete';
import { useGetInvoiceMaster } from 'api/invoice';
import { openSnackbar } from 'api/snackbar';

// assets
import { Trash } from 'iconsax-react';

// types
import { CountryType, Items } from 'types/invoice';
import { SnackbarProps } from 'types/snackbar';

interface FormValue {
  id: number;
  invoice_id: number;
  status: string;
  date: Date;
  due_date: Date;
  cashierInfo: { name: string; address: string; phone: string; email: string };
  customerInfo: { address: string; email: string; name: string; phone: string };
  invoice_detail: Items[];
  discount: number;
  tax: number;
  notes: string;
}

interface InvoiceItemProps {
  id: string;
  name: string;
  description: string;
  qty: number;
  price: number;

  image: string;
  supplier_code: string;
  code: string;
  specifications: string;
  inks: string;
  delivery_time: string;
  cost: string;
  print: string;
  unit_price: string;
  onDeleteItem: (index: number) => void;
  onEditItem: (event: React.ChangeEvent<HTMLInputElement>) => void;
  index: number;
  Blur: (event: React.FocusEvent<HTMLInputElement>) => void;
  errors: FormikErrors<FormValue>;
  touched: FormikTouched<FormValue>;
  country?: CountryType | null;
  lastItem: boolean;
}

// ==============================|| INVOICE - ITEMS ||============================== //

export default function InvoiceItem({
  id,
  name,
  description,
  qty,
  price,

  image,
  supplier_code,
  code,
  specifications,
  inks,
  delivery_time,
  cost,
  print,
  unit_price,
  onDeleteItem,
  onEditItem,
  index,
  Blur,
  errors,
  touched,
  country,
  lastItem
}: InvoiceItemProps) {
  const { invoiceMaster } = useGetInvoiceMaster();

  const [open, setOpen] = useState(false);
  const handleModalClose = (status: boolean) => {
    setOpen(false);
    if (status) {
      onDeleteItem(index);
      openSnackbar({
      open: true,
      message: 'Producto eliminado exitosamente',
      anchorOrigin: { vertical: 'top', horizontal: 'right' },
      variant: 'alert',
      alert: { color: 'success' }
      } as SnackbarProps);
    }
  };

  const SupplierCode = `invoice_detail[${index}].supplier_code`;
  const touchedName = getIn(touched, SupplierCode);
  const errorName = getIn(errors, SupplierCode);
  name = name || supplier_code || code || ''; // Asigna un valor por defecto si name es undefined
  const textFieldItem = [
    {
      placeholder: 'Imagen',
      label: 'Imagen',
      name: `invoice_detail.${index}.image`,
      type: 'file',
      id: id + '_image',
      value: image, // Asigna el valor correspondiente si existe
      align: 'left'
    },
    {
      placeholder: 'Código de proveedor',
      label: 'Código de proveedor',
      name: `invoice_detail.${index}.supplier_code`,
      type: 'text',
      id: id + '_supplier_code',
      value: supplier_code, // Asigna el valor correspondiente si existe
      errors: errorName,
      touched: touchedName,
      align: 'left'
    },
    {
      placeholder: 'Código',
      label: 'Código',
      name: `invoice_detail.${index}.code`,
      type: 'text',
      id: id + '_code',
      value: code, // Asigna el valor correspondiente si existe
      align: 'left'
    },
    {
      placeholder: 'Especificaciones',
      label: 'Especificaciones',
      name: `invoice_detail.${index}.specifications`,
      type: 'text',
      id: id + '_specifications',
      value: specifications, // Asigna el valor correspondiente si existe
      align: 'left'
    },
    {
      placeholder: 'Tintas',
      label: 'Tintas',
      name: `invoice_detail.${index}.inks`,
      type: 'text',
      id: id + '_inks',
      value: inks, // Asigna el valor correspondiente si existe
      align: 'left'
    },
    {
      placeholder: 'Tiempo de entrega',
      label: 'Tiempo de entrega',
      name: `invoice_detail.${index}.delivery_time`,
      type: 'text',
      id: id + '_delivery_time',
      value: delivery_time, // Asigna el valor correspondiente si existe
      align: 'left'
    },
    {
      placeholder: 'Cantidad',
      label: 'Cantidad',
      name: `invoice_detail.${index}.qty`,
      type: 'number',
      id: id + '_qty',
      value: qty,
      align: 'right'
    },
    {
      placeholder: 'Costo',
      label: 'Costo',
      name: `invoice_detail.${index}.cost`,
      type: 'number',
      id: id + '_cost',
      value: cost, // Asigna el valor correspondiente si existe
      align: 'right'
    },
    {
      placeholder: 'Impresión',
      label: 'Impresión',
      name: `invoice_detail.${index}.print`,
      type: 'text',
      id: id + '_print',
      value: print, // Asigna el valor correspondiente si existe
      align: 'left'
    },
    {
      placeholder: 'Precio Unitario',
      label: 'Precio Unitario',
      name: `invoice_detail.${index}.unit_price`,
      type: 'number',
      id: id + '_unit_price',
      value: unit_price, // Asigna el valor correspondiente si existe
      align: 'right'
    }
    // {
    //   placeholder: 'Acción',
    //   label: 'Acción',
    //   name: `invoice_detail.${index}.action`,
    //   type: 'text',
    //   id: id + '_action',
    //   value: '', // Asigna el valor correspondiente si existe
    //   align: 'left'
    // },
    // {
    //   placeholder: 'Importe',
    //   label: 'Importe',
    //   name: `invoice_detail.${index}.amount`,
    //   type: 'number',
    //   id: id + '_amount',
    //   value: '', // Asigna el valor correspondiente si existe
    //   align: 'right'
    // }
  ];

  return (
    <>
      {textFieldItem.map((item: any) => {
        return (
          <InvoiceField
            onEditItem={(event: any) => onEditItem(event)}
            onBlur={(event: any) => Blur(event)}
            cellData={{
              placeholder: item.placeholder,
              name: item.name,
              type: item.type,
              id: item.id,
              value: item.value,
              errors: item.errors,
              touched: item.touched,
              align: item.align
            }}
            key={item.label}
          />
        );
      })}
      <TableCell>
        <Stack direction="column" sx={{ gap: 2, justifyContent: 'flex-end', alignItems: 'flex-end' }}>
          <Box sx={{ pl: 2 }}>
            {invoiceMaster === undefined ? (
              <Skeleton width={520} height={16} />
            ) : (
              <Typography>
                {country ? `${country.prefix} ${(price * qty).toFixed(2)}` : `${invoiceMaster.country?.prefix} ${(price * qty).toFixed(2)}`}
              </Typography>
            )}
          </Box>
        </Stack>
      </TableCell>
      <TableCell align="center">
        <Tooltip title="Eliminar producto">
          <Button color="error" onClick={() => setOpen(true)} disabled={lastItem}>
            <Trash />
          </Button>
        </Tooltip>
      </TableCell>
      <AlertProductDelete title={name} open={open} handleClose={handleModalClose} />
    </>
  );
}
