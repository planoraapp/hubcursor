
import { ReactNode } from 'react';

export interface UserProfilePopoverProps {
  children: ReactNode;
  username?: string;
}

const UserProfilePopover = ({ children, username }: UserProfilePopoverProps) => {
  return (
    <div>
      {children}
      {username && (
        <div className="text-sm text-gray-600">
          Profile: {username}
        </div>
      )}
    </div>
  );
};

export default UserProfilePopover;
