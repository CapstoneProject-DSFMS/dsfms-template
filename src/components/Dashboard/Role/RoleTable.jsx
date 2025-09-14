import React from 'react';
import { Table } from 'react-bootstrap';
import RoleRow from './RoleRow';
import { LoadingSkeleton } from '../../../components/Common';

const RoleTable = ({ roles, loading, onView, onEdit, onDelete, onDisable }) => {
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
              Assigned Users
            </th>
            <th className="border-neutral-200 text-primary-custom fw-semibold">
              Status
            </th>
            <th className="border-neutral-200 text-primary-custom fw-semibold text-center">
              Actions
            </th>
          </tr>
        </thead>
        <tbody>
          {roles.map((role, index) => (
            <RoleRow
              key={role.id}
              role={role}
              index={index}
              onView={onView}
              onEdit={onEdit}
              onDelete={onDelete}
              onDisable={onDisable}
            />
          ))}
        </tbody>
      </Table>
    </div>
  );
};

export default RoleTable;
