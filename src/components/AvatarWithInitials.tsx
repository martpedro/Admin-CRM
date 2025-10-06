import { forwardRef } from 'react';

// material-ui
import MuiAvatar from '@mui/material/Avatar';
import { AvatarProps as MuiAvatarProps } from '@mui/material/Avatar';
import { SxProps, Theme } from '@mui/material/styles';

// project-imports
import { useAvatarWithInitials, getInitials } from 'utils/avatar-generator';

// ==============================|| AVATAR WITH INITIALS ||============================== //

export interface AvatarWithInitialsProps extends Omit<MuiAvatarProps, 'src'> {
  name?: string;
  lastName?: string;
  src?: string;
  size?: number;
  fallbackToInitials?: boolean;
  sx?: SxProps<Theme>;
}

const AvatarWithInitials = forwardRef<HTMLDivElement, AvatarWithInitialsProps>(
  ({ name, lastName, src, size = 40, fallbackToInitials = true, sx, children, ...other }, ref) => {
    const { avatarSrc, isGenerating } = useAvatarWithInitials(
      fallbackToInitials ? name : undefined,
      fallbackToInitials ? lastName : undefined,
      src,
      size
    );

    // Si hay imagen src o avatar generado, usarla
    if (src || avatarSrc) {
      return (
        <MuiAvatar
          ref={ref}
          src={src || avatarSrc}
          sx={{
            width: size,
            height: size,
            ...sx
          }}
          {...other}
        >
          {children}
        </MuiAvatar>
      );
    }

    // Si está generando, mostrar avatar vacío
    if (isGenerating) {
      return (
        <MuiAvatar
          ref={ref}
          sx={{
            width: size,
            height: size,
            bgcolor: 'grey.300',
            ...sx
          }}
          {...other}
        >
          {children}
        </MuiAvatar>
      );
    }

    // Fallback con iniciales en texto
    const initials = fallbackToInitials ? getInitials(name || '', lastName) : children;
    
    return (
      <MuiAvatar
        ref={ref}
        sx={{
          width: size,
          height: size,
          bgcolor: 'primary.main',
          color: 'primary.contrastText',
          fontSize: size * 0.4,
          fontWeight: 'bold',
          ...sx
        }}
        {...other}
      >
        {initials || children}
      </MuiAvatar>
    );
  }
);

AvatarWithInitials.displayName = 'AvatarWithInitials';

export default AvatarWithInitials;