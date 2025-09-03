
import ViaJovemEditorRedesigned from './ViaJovemEditor/ViaJovemEditorRedesigned';

interface ViaJovemEditorProps {
  className?: string;
}

export const ViaJovemEditor = ({ className = '' }: ViaJovemEditorProps) => {
  return <ViaJovemEditorRedesigned className={className} />;
};

export default ViaJovemEditor;
