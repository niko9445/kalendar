import React from 'react';

interface SubmitButtonProps {
  text: string;
  loading?: boolean;
  color?: 'blue' | 'green';
  disabled?: boolean;
}

const colorMap: Record<string, string> = {
  blue: 'bg-blue-600 hover:bg-blue-700 focus:ring-blue-500',
  green: 'bg-green-600 hover:bg-green-700 focus:ring-green-500',
};

const SubmitButton: React.FC<SubmitButtonProps> = ({ text, loading, color = 'blue', disabled }) => (
  <button
    type="submit"
    disabled={disabled || loading}
    className={`w-full py-2.5 text-white text-sm font-medium rounded-lg
               disabled:opacity-50 disabled:cursor-not-allowed
               transition-all duration-300 transform hover:scale-[1.02] active:scale-95
               focus:outline-none focus:ring-2 focus:ring-offset-2 shadow-md hover:shadow-lg
               relative overflow-hidden group ${colorMap[color]}`}
  >
    <span className="relative z-10 flex items-center justify-center">
      {loading ? (
        <>
          <div className="spinner mr-2"></div>
          {text}...
        </>
      ) : text}
    </span>
  </button>
);

export default SubmitButton;
