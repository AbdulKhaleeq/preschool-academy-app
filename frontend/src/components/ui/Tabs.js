import React from 'react';

const Tabs = ({ 
  tabs, 
  activeTab, 
  onTabChange, 
  variant = 'default',
  className = '',
  children 
}) => {
  const variants = {
    default: {
      container: 'border-b border-neutral-200 dark:border-neutral-700',
      tab: `
        inline-flex items-center px-4 py-2.5 text-sm font-medium transition-all duration-200
        border-b-2 border-transparent hover:border-neutral-300 hover:text-neutral-700
        dark:hover:border-neutral-600 dark:hover:text-neutral-300
      `,
      activeTab: `
        inline-flex items-center px-4 py-2.5 text-sm font-medium transition-all duration-200
        border-b-2 border-primary-600 text-primary-600 dark:border-primary-400 dark:text-primary-400
      `,
      inactiveTab: 'text-neutral-500 dark:text-neutral-400'
    },
    pills: {
      container: 'flex space-x-2 bg-neutral-100 p-1 rounded-xl dark:bg-neutral-800',
      tab: `
        inline-flex items-center px-4 py-2.5 text-sm font-medium rounded-xl transition-all duration-200
        hover:bg-neutral-200 dark:hover:bg-neutral-700
      `,
      activeTab: `
        inline-flex items-center px-4 py-2.5 text-sm font-medium rounded-xl transition-all duration-200
        bg-white text-primary-600 shadow-soft dark:bg-neutral-900 dark:text-primary-400
      `,
      inactiveTab: 'text-neutral-600 dark:text-neutral-400'
    },
    cards: {
      container: 'flex space-x-2',
      tab: `
        inline-flex items-center px-4 py-2.5 text-sm font-medium rounded-xl transition-all duration-200
        border-2 border-neutral-200 hover:border-neutral-300 dark:border-neutral-700 dark:hover:border-neutral-600
      `,
      activeTab: `
        inline-flex items-center px-4 py-2.5 text-sm font-medium rounded-xl transition-all duration-200
        border-2 border-primary-600 bg-primary-50 text-primary-700 dark:border-primary-400 
        dark:bg-primary-900/20 dark:text-primary-300
      `,
      inactiveTab: 'text-neutral-600 bg-white dark:text-neutral-400 dark:bg-neutral-800'
    }
  };
  
  const currentVariant = variants[variant];
  
  return (
    <div className={className}>
      <nav className={currentVariant.container}>
        <div className="flex flex-wrap -mb-px">
          {tabs.map((tab) => {
            const isActive = activeTab === tab.id;
            const TabIcon = tab.icon;
            
            return (
              <button
                key={tab.id}
                onClick={() => onTabChange(tab.id)}
                className={`
                  ${isActive ? currentVariant.activeTab : currentVariant.tab}
                  ${isActive ? '' : currentVariant.inactiveTab}
                  ${tab.disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
                `}
                disabled={tab.disabled}
                aria-selected={isActive}
                role="tab"
              >
                {TabIcon && (
                  <TabIcon className="w-4 h-4 mr-2" />
                )}
                {tab.label}
                {tab.count !== undefined && (
                  <span className={`
                    ml-2 px-2 py-0.5 text-xs rounded-full
                    ${isActive 
                      ? 'bg-primary-100 text-primary-700 dark:bg-primary-800/30 dark:text-primary-200' 
                      : 'bg-neutral-100 text-neutral-600 dark:bg-neutral-700 dark:text-neutral-300'
                    }
                  `}>
                    {tab.count}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </nav>
      
      {children && (
        <div className="mt-4">
          {children}
        </div>
      )}
    </div>
  );
};

// TabPanel component for content
const TabPanel = ({ tabId, activeTab, children, className = '' }) => {
  if (tabId !== activeTab) return null;
  
  return (
    <div className={`animate-fade-in ${className}`} role="tabpanel">
      {children}
    </div>
  );
};

Tabs.Panel = TabPanel;

export default Tabs;