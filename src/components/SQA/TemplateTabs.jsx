import React from 'react';
import { Badge } from 'react-bootstrap';
import { Clock, CheckCircle, XCircle } from 'react-bootstrap-icons';

const TemplateTabs = ({ activeTab, onTabChange, counts = {} }) => {
  const tabs = [
    {
      id: 'pending',
      label: 'Pending',
      icon: Clock,
      status: 'PENDING'
    },
    {
      id: 'approved',
      label: 'Approved (Published)',
      icon: CheckCircle,
      status: 'PUBLISHED'
    },
    {
      id: 'denied',
      label: 'Rejected',
      icon: XCircle,
      status: 'DENIED'
    }
  ];

  return (
    <div className="bg-primary-custom text-white template-detail-tabs-container">
      <div className="d-flex border-bottom border-white border-opacity-25 template-detail-tabs" style={{ overflowX: 'auto', overflowY: 'hidden', WebkitOverflowScrolling: 'touch' }}>
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          const count = counts[tab.id] || 0;
          
          return (
            <button
              key={tab.id}
              className={`flex-fill py-3 px-2 px-md-4 border-0 bg-transparent text-white d-flex align-items-center justify-content-center template-detail-tab ${
                isActive ? 'border-bottom border-white border-3' : ''
              }`}
              onClick={() => onTabChange(tab.id)}
              style={{
                fontWeight: isActive ? 600 : 400,
                transition: 'all 0.3s ease',
                minWidth: 'fit-content',
                whiteSpace: 'nowrap'
              }}
            >
              <Icon size={16} className="me-1 me-md-2" />
              <span className="d-none d-sm-inline">{tab.label}</span>
              <span className="d-inline d-sm-none">{tab.label.split(' ')[0]}</span>
              {count > 0 && (
                <Badge 
                  bg="light" 
                  text="dark"
                  className="ms-2"
                  style={{ 
                    fontSize: '0.7rem',
                    padding: '2px 6px',
                    borderRadius: '10px',
                    backgroundColor: 'rgba(255, 255, 255, 0.2)',
                    color: 'white'
                  }}
                >
                  {count}
                </Badge>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default TemplateTabs;

