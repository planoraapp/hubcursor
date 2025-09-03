
import React from 'react';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Edit, Eye } from 'lucide-react';

interface EditModeToggleProps {
  isEditMode: boolean;
  onToggle: (enabled: boolean) => void;
}

export const EditModeToggle: React.FC<EditModeToggleProps> = ({
  isEditMode,
  onToggle
}) => {
  return (
    <div className="flex items-center gap-3">
      <div className="flex items-center gap-2">
        <Eye className={`w-4 h-4 ${!isEditMode ? 'text-blue-600' : 'text-gray-400'}`} />
        <Switch
          checked={isEditMode}
          onCheckedChange={onToggle}
          className="data-[state=checked]:bg-blue-600"
        />
        <Edit className={`w-4 h-4 ${isEditMode ? 'text-blue-600' : 'text-gray-400'}`} />
      </div>
      
      <Button
        variant={isEditMode ? "default" : "outline"}
        size="sm"
        onClick={() => onToggle(!isEditMode)}
        className="volter-font"
      >
        {isEditMode ? (
          <>
            <Edit className="w-4 h-4 mr-1" />
            Editando
          </>
        ) : (
          <>
            <Eye className="w-4 h-4 mr-1" />
            Visualizando
          </>
        )}
      </Button>
    </div>
  );
};
