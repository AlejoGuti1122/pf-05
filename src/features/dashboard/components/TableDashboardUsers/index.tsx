"use client"

import React, { JSX, useState } from 'react';
import { Search, User, Mail, Calendar, MoreHorizontal, Plus, RefreshCw, AlertCircle, Trash2, Power } from 'lucide-react';

// Importaciones que usarías en tu proyecto real:
// import { useUsers } from '../hooks/useUsers';
// import { UserStatus, UserRole, User as UserType } from '../types/user';

// Tipos locales para el ejemplo - REEMPLAZAR por los imports reales
interface User {
  id: number;
  name: string;
  email: string;
  role: 'Admin' | 'Moderator' | 'User';
  status: 'active' | 'inactive' | 'pending';
  createdAt: string;
  avatar: string | null;
}

type UserStatus = 'active' | 'inactive' | 'pending';
type UserRole = 'Admin' | 'Moderator' | 'User';

interface UseUsersReturn {
  users: User[];
  loading: boolean;
  error: string | null;
  totalUsers: number;
  currentPage: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
  searchUsers: (term: string) => Promise<void>;
  refreshUsers: () => Promise<void>;
  deleteUser: (id: number) => Promise<boolean>;
  toggleUserStatus: (id: number, status: UserStatus) => Promise<boolean>;
  setPage: (page: number) => void;
  clearError: () => void;
}

interface UseUsersOptions {
  initialParams?: {
    limit?: number;
  };
  autoFetch?: boolean;
}

// Mock del hook para el ejemplo - REEMPLAZAR por el import real
const useUsers = (options: UseUsersOptions = {}): UseUsersReturn => {
  const [localUsers, setLocalUsers] = useState<User[]>([
    {
      id: 1,
      name: "Ana García",
      email: "ana.garcia@example.com",
      role: "Admin",
      status: "active",
      createdAt: "2024-01-15T00:00:00.000Z",
      avatar: null
    },
    {
      id: 2,
      name: "Carlos López",
      email: "carlos.lopez@example.com",
      role: "User",
      status: "active",
      createdAt: "2024-02-20T00:00:00.000Z",
      avatar: null
    },
    {
      id: 3,
      name: "María Rodríguez",
      email: "maria.rodriguez@example.com",
      role: "Moderator",
      status: "inactive",
      createdAt: "2024-01-08T00:00:00.000Z",
      avatar: null
    },
    {
      id: 4,
      name: "Pedro Martín",
      email: "pedro.martin@example.com",
      role: "User",
      status: "pending",
      createdAt: "2024-03-01T00:00:00.000Z",
      avatar: null
    }
  ]);
  
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState<string>('');

  // Simular filtrado local
  const filteredUsers = localUsers.filter((user: User) =>
    user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return {
    users: filteredUsers,
    loading,
    error,
    totalUsers: localUsers.length,
    currentPage: 1,
    totalPages: 1,
    hasNextPage: false,
    hasPrevPage: false,
    searchUsers: async (term: string): Promise<void> => {
      setLoading(true);
      setSearchTerm(term);
      // Simular delay de API
      setTimeout(() => setLoading(false), 500);
    },
    refreshUsers: async (): Promise<void> => {
      setLoading(true);
      setError(null);
      setTimeout(() => {
        console.log('🔄 Refrescando usuarios desde el backend...');
        setLoading(false);
      }, 1000);
    },
    deleteUser: async (id: number): Promise<boolean> => {
      setLoading(true);
      return new Promise((resolve) => {
        setTimeout(() => {
          setLocalUsers((prev: User[]) => prev.filter((user: User) => user.id !== id));
          setLoading(false);
          console.log('🗑️ Usuario eliminado:', id);
          resolve(true);
        }, 800);
      });
    },
    toggleUserStatus: async (id: number, newStatus: UserStatus): Promise<boolean> => {
      return new Promise((resolve) => {
        setTimeout(() => {
          setLocalUsers((prev: User[]) => prev.map((user: User) => 
            user.id === id ? { ...user, status: newStatus } : user
          ));
          console.log('⚡ Estado cambiado:', id, newStatus);
          resolve(true);
        }, 600);
      });
    },
    setPage: (page: number): void => console.log('📄 Página:', page),
    clearError: (): void => setError(null)
  };
};

const UsersTable: React.FC = () => {
  const {
    users,
    loading,
    error,
    totalUsers,
    currentPage,
    totalPages,
    hasNextPage,
    hasPrevPage,
    searchUsers,
    refreshUsers,
    deleteUser,
    toggleUserStatus,
    setPage,
    clearError
  } = useUsers({
    initialParams: { limit: 10 },
    autoFetch: true
  });

  const [actionLoading, setActionLoading] = useState<number | null>(null);
  const [searchTerm, setSearchTerm] = useState<string>('');

  // Manejar búsqueda con debounce
  const handleSearch = async (term: string): Promise<void> => {
    setSearchTerm(term);
    if (term.length > 2 || term.length === 0) {
      await searchUsers(term);
    }
  };

  // Manejar eliminación de usuario
  const handleDeleteUser = async (userId: number): Promise<void> => {
    if (!window.confirm('¿Estás seguro de que quieres eliminar este usuario?')) {
      return;
    }
    
    setActionLoading(userId);
    try {
      const success = await deleteUser(userId);
      if (success) {
        console.log('✅ Usuario eliminado exitosamente');
      }
    } catch (err) {
      console.error('❌ Error al eliminar usuario:', err);
    } finally {
      setActionLoading(null);
    }
  };

  // Manejar cambio de estado
  const handleToggleStatus = async (userId: number, currentStatus: UserStatus): Promise<void> => {
    const newStatus: UserStatus = currentStatus === 'active' ? 'inactive' : 'active';
    setActionLoading(userId);
    
    try {
      const success = await toggleUserStatus(userId, newStatus);
      if (success) {
        console.log('✅ Estado actualizado exitosamente');
      }
    } catch (err) {
      console.error('❌ Error al cambiar estado:', err);
    } finally {
      setActionLoading(null);
    }
  };

  // Componente de badge para el estado
  const getStatusBadge = (status: UserStatus): JSX.Element => {
    const statusStyles: Record<UserStatus, string> = {
      active: 'bg-green-100 text-green-800 border-green-200',
      inactive: 'bg-red-100 text-red-800 border-red-200',
      pending: 'bg-yellow-100 text-yellow-800 border-yellow-200'
    };
    
    const style = statusStyles[status] || statusStyles.pending;
    const labels: Record<UserStatus, string> = {
      active: 'Activo',
      inactive: 'Inactivo',
      pending: 'Pendiente'
    };
    
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${style}`}>
        {labels[status] || 'Pendiente'}
      </span>
    );
  };

  // Componente de badge para el rol
  const getRoleBadge = (role: UserRole): JSX.Element => {
    const roleStyles: Record<UserRole, string> = {
      Admin: 'bg-purple-100 text-purple-800 border-purple-200',
      Moderator: 'bg-blue-100 text-blue-800 border-blue-200',
      User: 'bg-gray-100 text-gray-800 border-gray-200'
    };
    
    const style = roleStyles[role] || roleStyles.User;
    
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${style}`}>
        {role}
      </span>
    );
  };

  // Formatear fecha
  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  // Props para el componente de error
  interface ErrorMessageProps {
    message: string;
    onClose: () => void;
  }

  // Componente de error
  const ErrorMessage: React.FC<ErrorMessageProps> = ({ message, onClose }) => (
    <div className="bg-red-50 border border-red-200 rounded-md p-4 mb-4">
      <div className="flex">
        <div className="flex-shrink-0">
          <AlertCircle className="h-5 w-5 text-red-400" />
        </div>
        <div className="ml-3">
          <h3 className="text-sm font-medium text-red-800">Error</h3>
          <div className="mt-2 text-sm text-red-700">
            <p>{message}</p>
          </div>
          <div className="mt-4">
            <button
              type="button"
              onClick={onClose}
              className="bg-red-50 px-2 py-1.5 rounded-md text-sm font-medium text-red-800 hover:bg-red-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-red-50 focus:ring-red-600"
            >
              Cerrar
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  if (loading && users.length === 0) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Usuarios</h3>
          <p className="text-sm text-gray-500 mt-1">Cargando usuarios...</p>
        </div>
        <div className="p-8">
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <User className="h-5 w-5" />
                Gestión de Usuarios
              </h3>
              <p className="text-sm text-gray-500 mt-1">
                Administra y visualiza todos los usuarios del sistema
              </p>
            </div>
          </div>
        </div>
        
        <div className="p-6">
          {/* Barra de búsqueda y acciones */}
          <div className="flex items-center space-x-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Buscar usuarios por nombre o email..."
                value={searchTerm}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleSearch(e.target.value)}
                className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                disabled={loading}
              />
            </div>
            <button
              onClick={refreshUsers}
              disabled={loading}
              className="inline-flex items-center px-3 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
              Actualizar
            </button>
            <button className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
              <Plus className="h-4 w-4 mr-2" />
              Agregar Usuario
            </button>
          </div>

          {/* Mostrar error si existe */}
          {error && <ErrorMessage message={error} onClose={clearError} />}

          {/* Tabla de usuarios */}
          <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 md:rounded-lg">
            <table className="min-w-full divide-y divide-gray-300">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Usuario
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Email
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Rol
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Estado
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Fecha de Registro
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {users.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-8 text-center text-sm text-gray-500">
                      {loading ? 'Buscando usuarios...' : 'No se encontraron usuarios'}
                    </td>
                  </tr>
                ) : (
                  users.map((user) => (
                    <tr key={user.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10">
                            <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center">
                              <User className="h-5 w-5 text-gray-500" />
                            </div>
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">
                              {user.name}
                            </div>
                            <div className="text-sm text-gray-500">
                              ID: {user.id}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center text-sm text-gray-900">
                          <Mail className="h-4 w-4 text-gray-400 mr-2" />
                          {user.email}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {getRoleBadge(user.role)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {getStatusBadge(user.status)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center text-sm text-gray-900">
                          <Calendar className="h-4 w-4 text-gray-400 mr-2" />
                          {formatDate(user.createdAt)}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right">
                        <div className="flex items-center justify-end space-x-2">
                          {/* Botón cambiar estado */}
                          <button
                            onClick={() => handleToggleStatus(user.id, user.status)}
                            disabled={actionLoading === user.id}
                            className="inline-flex items-center px-2 py-1 border border-gray-300 rounded text-xs font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
                            title={user.status === 'active' ? 'Desactivar usuario' : 'Activar usuario'}
                          >
                            {actionLoading === user.id ? (
                              <div className="animate-spin rounded-full h-3 w-3 border-b border-gray-700"></div>
                            ) : (
                              <>
                                <Power className="h-3 w-3 mr-1" />
                                {user.status === 'active' ? 'Desactivar' : 'Activar'}
                              </>
                            )}
                          </button>
                          
                          {/* Botón eliminar */}
                          <button
                            onClick={() => handleDeleteUser(user.id)}
                            disabled={actionLoading === user.id}
                            className="inline-flex items-center px-2 py-1 border border-red-300 rounded text-xs font-medium text-red-700 bg-white hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50"
                            title="Eliminar usuario"
                          >
                            <Trash2 className="h-3 w-3 mr-1" />
                            Eliminar
                          </button>
                          
                          {/* Menú más opciones */}
                          <button className="inline-flex items-center p-2 border border-gray-300 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
                            <MoreHorizontal className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Paginación */}
          <div className="flex items-center justify-between mt-6">
            <div className="text-sm text-gray-500">
              Mostrando {users.length} de {totalUsers} usuarios
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setPage(currentPage - 1)}
                disabled={!hasPrevPage || loading}
                className="inline-flex items-center px-3 py-2 border border-gray-300 text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Anterior
              </button>
              <span className="inline-flex items-center px-3 py-2 text-sm text-gray-500">
                Página {currentPage} de {totalPages}
              </span>
              <button
                onClick={() => setPage(currentPage + 1)}
                disabled={!hasNextPage || loading}
                className="inline-flex items-center px-3 py-2 border border-gray-300 text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Siguiente
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UsersTable;