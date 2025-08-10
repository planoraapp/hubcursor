
import React from 'react';

export interface UserProfilePopoverProps {
  children: React.ReactNode;
}

export const UserProfilePopover = ({ children }: UserProfilePopoverProps) => {
  return <div>{children}</div>;
};

export default UserProfilePopover;
