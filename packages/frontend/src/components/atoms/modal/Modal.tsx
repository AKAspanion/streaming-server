import React from 'react';
import ReactModal from 'react-modal';
import IconButton from '../icon-button/IconButton';
import { XMarkIcon } from '@heroicons/react/24/solid';

ReactModal.setAppElement('#root');

type ModalProps = {
  title?: React.ReactNode;
  open?: boolean;
  onClose?: () => void;
  onAfterOpen?: ReactModal.OnAfterOpenCallback;
  children: React.ReactNode;
};

const Modal: React.FC<ModalProps> = (props) => {
  const { title, open = false, onClose, onAfterOpen, children } = props;

  return (
    <ReactModal
      isOpen={open}
      onAfterOpen={onAfterOpen}
      onRequestClose={onClose}
      overlayClassName={
        'fixed dark:bg-slate-900 bg-slate-400 bg-opacity-80 dark:bg-opacity-80 w-screen h-screen top-0'
      }
      className="flex items-center justify-center h-screen w-screen"
      contentLabel="Example Modal"
    >
      <div
        className="dark:bg-slate-800  bg-slate-200 p-3 rounded-md"
        style={{
          maxWidth: 'calc(100vw - 100px)',
          minWidth: '400px',
        }}
      >
        <div className="flex items-center justify-between gap-6 pb-3">
          <div className="">{title}</div>
          <IconButton onClick={onClose}>
            <XMarkIcon />
          </IconButton>
        </div>
        <div className="overflow-y-auto" style={{ maxHeight: 'calc(100vh - 200px)' }}>
          {children}
        </div>
      </div>
    </ReactModal>
  );
};

export default Modal;
