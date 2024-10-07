import React, { useState } from 'react';

interface TooltipProps {
  text: string;
  children: React.ReactNode;
}

const Tooltip: React.FC<TooltipProps> = ({ text, children }) => {
  const [isVisible, setIsVisible] = useState(false);

  return (
    <div className="relative inline-block">
      <div
        onMouseEnter={() => setIsVisible(true)}
        onMouseLeave={() => setIsVisible(false)}
      >
        {children}
      </div>
      {isVisible && (
        <div className="absolute z-10 p-2 bg-gray-800 text-white text-sm rounded-md shadow-md bottom-full left-1/2 transform -translate-x-1/2 mb-2">
          {text}
        </div>
      )}
    </div>
  );
};

export default Tooltip;
