
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';

export interface UserProfilePopoverProps {
  children: React.ReactNode;
}

export const UserProfilePopover: React.FC<UserProfilePopoverProps> = ({ children }) => {
  return (
    <Card className="w-64">
      <CardContent className="p-4">
        {children}
      </CardContent>
    </Card>
  );
};
