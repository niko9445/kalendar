import React from 'react';

interface InputFieldProps {
  type?: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder?: string;
  icon?: 'email' | 'password' | 'user';
  showToggle?: boolean;
  onToggle?: () => void;
  showValue?: boolean;
  required?: boolean;
  disabled?: boolean;
}

const iconMap: Record<string, string> = {
  email: 'icon-email',
  password: 'icon-password',
  user: 'icon-user',
};

const InputField: React.FC<InputFieldProps> = ({
  type = 'text',
  value,
  onChange,
  placeholder,
  icon,
  showToggle,
  onToggle,
  showValue,
  required,
  disabled,
}) => (
  <div className="relative">
    <input
      type={showToggle ? (showValue ? 'text' : 'password') : type}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      required={required}
      disabled={disabled}
      className="w-full pl-10 pr-10 py-2.5 text-sm border border-gray-300 dark:border-gray-600 rounded-lg
                 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500
                 dark:bg-gray-800 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-500
                 transition-all duration-300 hover:border-blue-400"
    />
    {icon && <div className={`${iconMap[icon]} absolute left-3 top-1/2 transform -translate-y-1/2 z-10 pointer-events-none`}></div>}
    {showToggle && onToggle && (
      <button
        type="button"
        onClick={onToggle}
        className="eye-button absolute inset-y-0 right-0 pr-3 flex items-center transition-colors duration-300"
        style={{ transform: 'translateY(-50%)', top: '50%' }}
        aria-label={showValue ? 'Скрыть пароль' : 'Показать пароль'}
        disabled={disabled}
      >
        <span className={showValue ? 'icon-eye-off' : 'icon-eye'}></span>
      </button>
    )}
  </div>
);

export default InputField;
