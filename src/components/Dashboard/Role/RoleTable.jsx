import React from 'react';
import { Table, Badge } from 'react-bootstrap';
import RoleRow from './RoleRow';
import { LoadingSkeleton } from '../../../components/Common';

const RoleTable = ({
  roles,
  loading,
  actionsComponent: ActionsComponent,
  onView,
  onEdit,
  onDisable,
}) => {
  if (loading) {
    return <LoadingSkeleton rows={4} columns={4} />;
  }

  if (roles.length === 0) {
    return (
      <div className="text-center py-5">
        <div className="text-muted">
          <h5>No roles found</h5>
          <p>Try adjusting your search criteria or add a new role.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="table-responsive">
      <Table hover className="mb-0">
        <thead className="bg-neutral-50">
          <tr>
            <th className="border-neutral-200 text-primary-custom fw-semibold">
              Role Name
            </th>
            <th className="border-neutral-200 text-primary-custom fw-semibold">
              Status
            </th>
            <th className="border-neutral-200 text-primary-custom fw-semibold">
              Assigned Users
            </th>
            <th className="border-neutral-200 text-primary-custom fw-semibold">
              Last Modified
            </th>
            <th className="border-neutral-200 text-primary-custom fw-semibold text-center">
              Actions
            </th>
          </tr>
        </thead>
        <tbody>
          {roles.map((role, index) => (
            <tr key={role.id}>
              <td>{role.name}</td>
              <td>
                <Badge bg={role.status === 'Active' ? 'success' : 'secondary'}>
                  {role.status}
                </Badge>
              </td>
              <td>{role.assignedUsers}</td>
              <td>{role.lastModified}</td>
              <td className="text-end">
                <ActionsComponent role={role} />
              </td>
            </tr>
          ))}
        </tbody>
      </Table>
    </div>
  );
};

export default RoleTable;
