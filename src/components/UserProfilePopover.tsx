
import React from 'react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';

interface UserProfilePopoverProps {
  children: React.ReactNode;
  habboAccount?: any;
}

export const UserProfilePopover: React.FC<UserProfilePopoverProps> = ({ children, habboAccount }) => {
  return (
    <Popover>
      <PopoverTrigger asChild>
        {children}
      </PopoverTrigger>
      <PopoverContent>
        <div className="space-y-2">
          <p className="font-bold">{habboAccount?.habbo_name || 'Usuario'}</p>
          <p className="text-sm text-gray-600">ID: {habboAccount?.habbo_id || 'N/A'}</p>
        </div>
      </PopoverContent>
    </Popover>
  );
};
