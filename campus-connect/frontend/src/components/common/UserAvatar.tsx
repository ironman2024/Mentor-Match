import React from 'react';
import { Avatar, AvatarProps } from '@mui/material';

interface UserAvatarProps extends Omit<AvatarProps, 'src' | 'children'> {
  user?: {
    name: string;
    avatar?: string;
  };
  name?: string;
  avatar?: string;
  size?: number;
}

const UserAvatar: React.FC<UserAvatarProps> = ({
  user,
  name,
  avatar,
  size = 40,
  sx,
  ...props
}) => {
  const displayName = user?.name || name || '';
  const displayAvatar = user?.avatar || avatar;
  const avatarUrl = displayAvatar 
    ? displayAvatar.startsWith('http') 
      ? displayAvatar 
      : `http://localhost:5002${displayAvatar.startsWith('/') ? displayAvatar : '/' + displayAvatar}`
    : undefined;

  return (
    <Avatar
      src={avatarUrl}
      sx={{
        width: size,
        height: size,
        fontSize: size * 0.4,
        fontWeight: 600,
        ...sx
      }}
      {...props}
    >
      {displayName.charAt(0).toUpperCase()}
    </Avatar>
  );
};

export default UserAvatar;