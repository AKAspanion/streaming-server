/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/ban-ts-comment */
import { baseUrl } from '@/config/api';
import { flushSync } from 'react-dom';
import { useNavigate } from 'react-router-dom';

const TransitionTest = () => {
  const navigate = useNavigate();
  // Create a transition:
  const navigateToImage = () => {
    // @ts-ignore
    const transition = document.startViewTransition(() => {
      flushSync(() => {
        navigate('/manage-media/transition-test-full');
      });
    });

    transition.finished.then((a: any) => {
      console.log('finished', a);
    });

    transition.ready.then((a: any) => {
      console.log('ready', a);
    });

    transition.updateCallbackDone.then((a: any) => {
      console.log('updateCallbackDone', a);
      // Respond to the DOM being updated successfully
    });
  };
  return (
    <div>
      <img
        onClick={() => navigateToImage()}
        src={`${baseUrl}/media/f1fa8b5e-7aec-4b7f-bf3b-f8489d2436ab/thumbnail`}
        className="w-28 h-28 object-cover transition-transform duration-300 group-hover:scale-110"
      />
    </div>
  );
};

export default TransitionTest;
