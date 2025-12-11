import React, { useMemo } from 'react';
import PortalUnifiedDropdown from '../Common/PortalUnifiedDropdown';
import { Eye, Archive, ThreeDotsVertical } from 'react-bootstrap-icons';
import { PermissionWrapper } from '../Common';
import { PERMISSION_IDS } from '../../constants/permissionIds';
import { usePermissions } from '../../hooks/usePermissions';

const SubjectActions = ({ subject, onView, onEdit, onDelete }) => {
  const { hasPermission } = usePermissions();

  const handleViewClick = () => {
    onView && onView(subject.id);
  };

  const handleDeleteClick = () => {
    onDelete && onDelete(subject.id);
  };

  // Filter items theo permission và xử lý divider
  const filteredItems = useMemo(() => {
    const allItems = [
      {
        label: 'View Details',
        icon: <Eye />,
        onClick: handleViewClick,
        permission: PERMISSION_IDS.VIEW_SUBJECT_DETAILS
      },
      { type: 'divider' },
      {
        label: 'Archive Subject',
        icon: <Archive />,
        className: 'text-warning',
        onClick: handleDeleteClick,
        permission: PERMISSION_IDS.ARCHIVE_SUBJECT
      }
    ];

    // Bước 1: Filter items theo permission
    const filtered = allItems.filter(item => {
      if (item.type === 'divider') return true; // Giữ divider để xử lý sau
      if (!item.permission) return true; // Item không có permission → luôn hiển thị
      return hasPermission(item.permission); // Có permission → check
    });

    // Bước 2: Xử lý divider thừa
    const cleaned = [];
    for (let i = 0; i < filtered.length; i++) {
      const item = filtered[i];
      const prevItem = filtered[i - 1];
      const nextItem = filtered[i + 1];

      // Bỏ divider đầu tiên
      if (i === 0 && item.type === 'divider') continue;
      
      // Bỏ divider cuối cùng
      if (i === filtered.length - 1 && item.type === 'divider') continue;
      
      // Bỏ divider nếu không có item nào phía sau (trừ divider cuối đã xử lý ở trên)
      if (item.type === 'divider' && (!nextItem || nextItem.type === 'divider')) continue;
      
      // Bỏ divider nếu item trước đó cũng là divider
      if (item.type === 'divider' && prevItem?.type === 'divider') continue;

      cleaned.push(item);
    }

    return cleaned;
  }, [hasPermission, handleViewClick, handleDeleteClick]);

  return (
    <PermissionWrapper 
      permissions={[PERMISSION_IDS.VIEW_SUBJECT_DETAILS, PERMISSION_IDS.ARCHIVE_SUBJECT]}
      fallback={null}
    >
      <PortalUnifiedDropdown
        align="end"
        className="table-dropdown"
        placement="bottom-end"
        trigger={{
          variant: 'link',
          className: 'btn btn-link p-0 text-primary-custom',
          style: { border: 'none', background: 'transparent' },
          children: <ThreeDotsVertical size={16} />
        }}
        items={filteredItems}
      />
    </PermissionWrapper>
  );
};

export default SubjectActions;
