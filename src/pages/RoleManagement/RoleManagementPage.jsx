import React, { useState, useEffect } from 'react';
import { MainLayout } from '../../components/Layout';
import RoleManagement from '../../components/Dashboard/RoleManagement';
import { Alert } from 'react-bootstrap';
import { ROLES, PERMISSIONS } from '../../constants/permissions';

const RoleManagementPage = () => {
  const [roles, setRoles] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [modalShow, setModalShow] = useState(false);
  const [selectedRole, setSelectedRole] = useState(null);
  const [modalMode, setModalMode] = useState('view');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchRoles = async () => {
      setLoading(true);
      try {
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1000));

        // Convert ROLES object to array of role objects
        const mockRoles = Object.entries(ROLES).map(([name, permissions], index) => ({
          id: index + 1,
          name,
          permissions,
          assignedUsers: Math.floor(Math.random() * 50), // Random number for demo
          status: 'Active',
          description: `${name} role with ${permissions.length} permissions`,
          createdAt: '2023-01-01',
          lastModified: '2023-12-01'
        }));

        setRoles(mockRoles);
        setError(null);
      } catch (err) {
        setError('Failed to fetch roles');
        console.error('Error fetching roles:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchRoles();
  }, []);

  const handleSearch = (term) => setSearchTerm(term);

  const handleView = (role) => {
    setSelectedRole(role);
    setModalMode('view');
    setModalShow(true);
  };

  const handleEdit = async (role) => {
    try {
      setLoading(true);
      await new Promise(resolve => setTimeout(resolve, 500));
      setSelectedRole(role);
      setModalMode('edit');
      setModalShow(true);
      setError(null);
    } catch (err) {
      setError('Failed to load role details');
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = () => {
    setSelectedRole(null);
    setModalMode('add');
    setModalShow(true);
  };

  const handleDelete = async (roleId) => {
    if (!window.confirm('Are you sure you want to delete this role?')) return;

    setLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      setRoles(prevRoles => prevRoles.filter(role => role.id !== roleId));
      setError(null);
    } catch (err) {
      setError('Failed to delete role');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (roleData) => {
    setLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));

      if (modalMode === 'add') {
        const newRole = {
          ...roleData,
          id: Math.max(...roles.map(r => r.id)) + 1,
          assignedUsers: 0,
          status: 'Active',
          createdAt: new Date().toISOString().split('T')[0],
          lastModified: new Date().toISOString().split('T')[0]
        };
        setRoles(prevRoles => [...prevRoles, newRole]);
      } else {
        setRoles(prevRoles => 
          prevRoles.map(role => 
            role.id === selectedRole.id ? { 
              ...role, 
              ...roleData,
              lastModified: new Date().toISOString().split('T')[0]
            } : role
          )
        );
      }

      setModalShow(false);
      setSelectedRole(null);
      setError(null);
    } catch (err) {
      setError('Failed to save role');
    } finally {
      setLoading(false);
    }
  };

  const handleDisable = async (roleId) => {
    setLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      setRoles(prevRoles => 
        prevRoles.map(role => 
          role.id === roleId ? { 
            ...role, 
            status: role.status === 'Active' ? 'Inactive' : 'Active',
            lastModified: new Date().toISOString().split('T')[0]
          } : role
        )
      );
      setError(null);
    } catch (err) {
      setError('Failed to update role status');
    } finally {
      setLoading(false);
    }
  };

  // Filter roles based on search
  const filteredRoles = roles.filter(role => 
    role.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <MainLayout>
      {error && (
        <Alert variant="danger" dismissible onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      <RoleManagement
        roles={filteredRoles}
        loading={loading}
        searchTerm={searchTerm}
        modalShow={modalShow}
        selectedRole={selectedRole}
        modalMode={modalMode}
        onSearch={handleSearch}
        onView={handleView}
        onEdit={handleEdit}
        onAdd={handleAdd}
        onSave={handleSave}
        onDisable={handleDisable}
        onModalClose={() => setModalShow(false)}
      />
    </MainLayout>
  );
};

export default RoleManagementPage;
