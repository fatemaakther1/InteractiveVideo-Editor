import React, { useState } from 'react';

export interface Tab {
  id: string;
  label: string;
  icon?: string;
  content: React.ReactNode;
}

export interface TabContainerProps {
  tabs: Tab[];
  activeTab?: string;
  onTabChange?: (tabId: string) => void;
  variant?: 'pills' | 'underline' | 'buttons';
  orientation?: 'horizontal' | 'vertical';
  className?: string;
}

const TabContainer: React.FC<TabContainerProps> = ({
  tabs,
  activeTab,
  onTabChange,
  variant = 'pills',
  orientation = 'horizontal',
  className = '',
}) => {
  const [internalActiveTab, setInternalActiveTab] = useState(activeTab || tabs[0]?.id);

  const currentActiveTab = activeTab || internalActiveTab;

  const handleTabClick = (tabId: string) => {
    if (onTabChange) {
      onTabChange(tabId);
    } else {
      setInternalActiveTab(tabId);
    }
  };

  const getTabClasses = (tab: Tab, isActive: boolean) => {
    const baseClasses = 'transition-all duration-200 cursor-pointer';
    
    switch (variant) {
      case 'pills':
        return `${baseClasses} px-4 py-2.5 text-sm font-medium rounded-xl ${
          isActive
            ? 'bg-white text-primary-700 shadow-soft ring-2 ring-primary-200'
            : 'text-secondary-600 hover:text-secondary-900 hover:bg-secondary-50'
        }`;
      case 'underline':
        return `${baseClasses} px-4 py-3 text-sm font-medium border-b-2 ${
          isActive
            ? 'border-primary-600 text-primary-700'
            : 'border-transparent text-secondary-600 hover:text-secondary-900 hover:border-secondary-300'
        }`;
      case 'buttons':
        return `${baseClasses} flex flex-col items-center px-3 py-3 text-xs font-bold rounded-lg ${
          isActive
            ? 'bg-white text-primary-700 shadow-soft ring-2 ring-primary-200'
            : 'text-secondary-600 hover:text-secondary-900 hover:bg-secondary-50'
        }`;
      default:
        return `${baseClasses} px-4 py-2.5 text-sm font-medium rounded-lg ${
          isActive
            ? 'bg-white text-primary-700 shadow-soft'
            : 'text-secondary-600 hover:text-secondary-900 hover:bg-secondary-50'
        }`;
    }
  };

  const getContainerClasses = () => {
    const baseClasses = orientation === 'horizontal' ? 'flex' : 'flex flex-col';
    
    switch (variant) {
      case 'pills':
        return `${baseClasses} bg-secondary-100 rounded-xl p-1 ${orientation === 'horizontal' ? 'space-x-1' : 'space-y-1'}`;
      case 'underline':
        return `${baseClasses} border-b border-secondary-200 ${orientation === 'horizontal' ? 'space-x-1' : 'space-y-1'}`;
      case 'buttons':
        return `${baseClasses} gap-2 bg-secondary-100 rounded-xl p-1 ${orientation === 'horizontal' ? 'grid grid-cols-3' : ''}`;
      default:
        return `${baseClasses} ${orientation === 'horizontal' ? 'space-x-1' : 'space-y-1'}`;
    }
  };

  const activeTabContent = tabs.find(tab => tab.id === currentActiveTab)?.content;

  return (
    <div className={className}>
      <div className={getContainerClasses()}>
        {tabs.map((tab) => {
          const isActive = tab.id === currentActiveTab;
          return (
            <button
              key={tab.id}
              className={getTabClasses(tab, isActive)}
              onClick={() => handleTabClick(tab.id)}
            >
              {tab.icon && variant === 'buttons' && (
                <i className={`${tab.icon} text-lg mb-1`} />
              )}
              {tab.icon && variant !== 'buttons' && (
                <i className={`${tab.icon} mr-2`} />
              )}
              <span className={variant === 'buttons' ? 'uppercase tracking-wider' : ''}>
                {tab.label}
              </span>
            </button>
          );
        })}
      </div>
      <div className="mt-6">
        {activeTabContent}
      </div>
    </div>
  );
};

export default TabContainer;
