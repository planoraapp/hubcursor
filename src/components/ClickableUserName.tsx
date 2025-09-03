
import React, { useState } from 'react';
import { UserProfileModal } from './UserProfileModal';

interface ClickableUserNameProps {
  habboName: string;
  className?: string;
}

export const ClickableUserName: React.FC<ClickableUserNameProps> = ({ habboName, className = '' }) => {
  const [modalOpen, setModalOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setModalOpen(true)}
        className={`text-blue-600 hover:text-blue-800 hover:underline transition-colors font-semibold ${className}`}
      >
        {habboName}
      </button>
      <UserProfileModal
        open={modalOpen}
        setOpen={setModalOpen}
        habboName={habboName}
      />
    </>
  );
};
