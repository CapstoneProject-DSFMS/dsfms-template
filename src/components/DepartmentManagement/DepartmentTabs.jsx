import React from 'react';
import { Pencil, PersonPlus, InfoCircle } from 'react-bootstrap-icons';

const DepartmentTabs = ({ activeTab, onTabChange }) => {
  const tabs = [
    {
      id: 'info',
      label: 'Department Info',
      icon: InfoCircle,
      description: 'View department overview'
    },
    {
      id: 'trainers',
      label: 'Manage Trainers',
      icon: PersonPlus,
      description: 'Assign trainers to department'
    },
    {
      id: 'edit',
      label: 'Edit Details',
      icon: Pencil,
      description: 'Modify department information'
    }
  ];

  return (
    <div className="department-tabs">
      <div className="tab-navigation">
        {tabs.map((tab) => {
          const IconComponent = tab.icon;
          const isActive = activeTab === tab.id;
          
          return (
            <button
              key={tab.id}
              className={`tab-button ${isActive ? 'active' : ''}`}
              onClick={() => onTabChange(tab.id)}
            >
              <div className="tab-icon">
                <IconComponent size={20} />
              </div>
              <div className="tab-content">
                <div className="tab-label">{tab.label}</div>
                <div className="tab-description">{tab.description}</div>
              </div>
              {isActive && <div className="tab-indicator"></div>}
            </button>
          );
        })}
      </div>
      <div className="tab-separator"></div>
    </div>
  );
};

export default DepartmentTabs;
