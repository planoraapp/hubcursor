
import React from 'react';

interface EditorShellProps {
  className?: string;
  children?: React.ReactNode;
}

export const EditorShell = ({ className = '', children }: EditorShellProps) => {
  return (
    <div className={`editor-shell ${className}`}>
      {children}
    </div>
  );
};

export default EditorShell;
