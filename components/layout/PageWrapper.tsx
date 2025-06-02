
import React from 'react';

interface PageWrapperProps {
  title: string;
  children: React.ReactNode;
  actions?: React.ReactNode;
  icon?: React.ReactNode;
}

const PageWrapper: React.FC<PageWrapperProps> = ({ title, children, actions, icon }) => {
  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center pb-4 border-b border-secondary-200">
        <h2 className="text-3xl font-bold text-secondary-800 flex items-center">
          {icon && <span className="mr-3 text-primary-600">{icon}</span>}
          {title}
        </h2>
        {actions && <div className="mt-4 md:mt-0">{actions}</div>}
      </div>
      <div>{children}</div>
    </div>
  );
};

export default PageWrapper;
