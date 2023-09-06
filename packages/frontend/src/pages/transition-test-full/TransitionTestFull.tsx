import { baseUrl } from '@/config/api';

const TransitionTestFull = () => {
  return (
    <div>
      <img
        src={`${baseUrl}/media/f1fa8b5e-7aec-4b7f-bf3b-f8489d2436ab/thumbnail`}
        className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
      />
    </div>
  );
};

export default TransitionTestFull;
