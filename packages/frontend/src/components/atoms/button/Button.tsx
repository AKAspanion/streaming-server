import cs from 'classnames';
import { buttonVariant } from '.';

type ButtonProps = {
  children: React.ReactNode;
  disabled?: boolean;
  onClick?: () => void;
};

function Button({ children, onClick, disabled }: ButtonProps) {
  return (
    <div onClick={onClick} className={cs(buttonVariant().className, { disabled: disabled })}>
      {children}
    </div>
  );
}

export default Button;
