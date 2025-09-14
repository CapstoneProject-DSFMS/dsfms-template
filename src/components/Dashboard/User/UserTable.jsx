import React from 'react';
import { Table } from 'react-bootstrap';
import UserRow from './UserRow';
import { LoadingSkeleton } from '../../../components/Common';

const UserTable = ({ users, loading, onView, onEdit, onDelete }) => {
  if (loading) {
    return <LoadingSkeleton rows={5} columns={6} />;
  }

  if (users.length === 0) {
    return (
      <div className="text-center py-5">
        <div className="text-muted">
          <h5>No users found</h5>
          <p>Try adjusting your search criteria or add a new user.</p>
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
              EID
            </th>
            <th className="border-neutral-200 text-primary-custom fw-semibold">
              Full Name
            </th>
            <th className="border-neutral-200 text-primary-custom fw-semibold">
              Role
            </th>
            <th className="border-neutral-200 text-primary-custom fw-semibold">
              Department
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
          {users.map((user, index) => (
            <UserRow
              key={user.id}
              user={user}
              index={index}
              onView={onView}
              onEdit={onEdit}
              onDelete={onDelete}
            />
          ))}
        </tbody>
      </Table>
    </div>
  );
};

export default UserTable;
