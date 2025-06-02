
import React from 'react';

interface CardProps {
  title?: string;
  children: React.ReactNode;
  className?: string;
  titleClassName?: string;
  bodyClassName?: string;
  icon?: React.ReactNode;
}

const Card: React.FC<CardProps> = ({ title, children, className, titleClassName, bodyClassName, icon }) => {
  return (
    <div className={`bg-white shadow-xl rounded-xl overflow-hidden ${className || ''}`}>
      {title && (
        <div className={`px-6 py-4 border-b border-secondary-200 bg-secondary-50 ${titleClassName || ''}`}>
          <h3 className="text-lg font-semibold text-secondary-800 flex items-center">
            {icon && <span className="mr-3 text-primary-600">{icon}</span>}
            {title}
          </h3>
        </div>
      )}
      <div className={`p-6 ${bodyClassName || ''}`}>
        {children}
      </div>
    </div>
  );
};

export default Card;
