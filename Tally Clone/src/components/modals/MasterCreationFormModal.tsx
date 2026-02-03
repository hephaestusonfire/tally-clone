import { MasterFormModal } from './MasterFormModal';
import type { MasterItem } from '../../store/masterCreation';

interface MasterCreationFormModalProps {
  master: MasterItem;
  onClose: () => void;
}

export function MasterCreationFormModal({ master, onClose }: MasterCreationFormModalProps) {
  return (
    <MasterFormModal
      mode="create"
      master={master}
      onClose={onClose}
    />
  );
}
