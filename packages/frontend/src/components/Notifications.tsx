import { XMarkIcon } from '@heroicons/react/24/outline';
import { XCircleIcon, CheckCircleIcon } from '@heroicons/react/24/solid';
import { useToaster, toast as toastFn } from 'react-hot-toast/headless';

const Notifications = () => {
  const { toasts, handlers } = useToaster();
  const { startPause, endPause, calculateOffset, updateHeight } = handlers;

  return (
    <div
      className="h-screen fixed z-[80] bottom-0 left-20 overflow-visible"
      onMouseEnter={startPause}
      onMouseLeave={endPause}
    >
      {toasts.map((toast) => {
        console.log(toast);
        const offset = calculateOffset(toast, {
          reverseOrder: false,
          gutter: 16,
        });

        const ref = (el: HTMLDivElement) => {
          if (el && typeof toast.height !== 'number') {
            const height = el.getBoundingClientRect().height;
            updateHeight(toast.id, height);
          }
        };

        return (
          <div
            key={toast.id}
            ref={ref}
            className="bg-background border border-accent p-3 shadow-md rounded-lg absolute w-[300px]"
            style={{
              transition: 'all 0.3s ease-out',
              opacity: toast.visible ? 1 : 0,
              transform: `translateY(-${offset}px)`,
            }}
            {...toast.ariaProps}
          >
            <div className="flex items-center gap-3 justify-between">
              <div className="flex items-center gap-3">
                {toast.type === 'error' && (
                  <div className="w-5 text-red-600">
                    <XCircleIcon />
                  </div>
                )}
                {toast.type === 'success' && (
                  <div className="w-5 text-green-600">
                    <CheckCircleIcon />
                  </div>
                )}
                <div className="text-sm w-[210px] whitespace-nowrap overflow-ellipsis overflow-hidden">
                  {toast.message as string}
                </div>
              </div>
              <div className="w-5 cursor-pointer" onClick={() => toastFn.remove(toast.id)}>
                <XMarkIcon />
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default Notifications;
