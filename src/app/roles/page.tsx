'use client';

import React, { useEffect, useState } from 'react';
import {
  Button,
  Table,
  Card,
  Popconfirm,
  Typography,
  Tooltip,
  Input,
  Tag,
} from 'antd';
import type { ColumnsType } from 'antd/es/table';
import Sidebar from '@/layouts/sidebar';
import {
  useGetRoleQuery,
  useCreateRoleMutation,
  useUpdateRoleMutation,
  useDeleteRoleMutation,
} from '@/services/role.service';
import { useGetPermissionsQuery } from '@/services/permission.service';
import Loading from '@/components/Loading';
import ErrorHandler from '@/components/ErrorHandler';
import { Action, Subject } from '@/utils/ability';
import { useAbility } from '@/hooks/useAbility';
import withPermission from '@/hocs/withPermission';
import {
  EditOutlined,
  DeleteOutlined,
  PlusOutlined,
  SearchOutlined,
} from '@ant-design/icons';
import { useMediaQuery } from 'react-responsive';
import { toast } from 'react-toastify';
import AddRoleModal from '@/components/AddRoleModal';

const { Text } = Typography;

const RoleManagement: React.FC = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingRole, setEditingRole] = useState<any | null>(null);
  const [searchText, setSearchText] = useState('');

  const { data: rolesData, isLoading: isLoadingRoles, error: rolesError, refetch } = useGetRoleQuery();
  const roles = rolesData?.data?.data || [];

  const { data: permissionsData, isLoading: isLoadingPermissions, error: permissionsError } = useGetPermissionsQuery();
  const permissions = permissionsData?.data?.data || [];

  const ability = useAbility();
  const isSmallScreen = useMediaQuery({ maxWidth: 768 });

  const filteredRoles = roles.filter((role: any) => {
    if (!searchText) return true;
    const searchTermLower = searchText.toLowerCase();
    return (
      (role.name && role.name.toLowerCase().includes(searchTermLower)) ||
      (role.description && role.description.toLowerCase().includes(searchTermLower))
    );
  });

  const [createRole] = useCreateRoleMutation();
  const [updateRole] = useUpdateRoleMutation();
  const [deleteRole] = useDeleteRoleMutation();

  const openCreateModal = () => {
    setEditingRole(null);
    setIsModalOpen(true);
  };

  const openEditModal = (role: any) => {
    setEditingRole(role);
    setIsModalOpen(true);
  };

  const handleModalSubmit = async (rolePayload: any) => {
    try {
      if (editingRole) {
        await updateRole({ id: editingRole.id, body: rolePayload }).unwrap();
        toast.success('Cập nhật thành công');
      } else {
        await createRole({ body: rolePayload }).unwrap();
        toast.success('Tạo mới thành công');
      }
      setIsModalOpen(false);
      refetch();
    } catch (error: any) {
      toast.error(error?.data?.message || 'Có lỗi xảy ra');
    }
  };

  const handleDelete = async (id: number) => {
    try {
      const stringId = id.toString();
      await deleteRole({ id: stringId }).unwrap();
      toast.success('Xóa vai trò thành công');
      refetch();
    } catch (error: any) {
      toast.error(error?.data?.message || 'Lỗi khi xóa vai trò');
      refetch();
    }
  };

  const columns: ColumnsType<any> = [
    {
      title: 'Tên vai trò',
      dataIndex: 'name',
    },
    {
      title: 'Miêu tả',
      dataIndex: 'description',
    },
    {
      title: 'Trạng thái',
      dataIndex: 'active',
      render: (active: boolean) => <Tag color={active ? 'green' : 'red'}>{active ? 'ACTIVE' : 'INACTIVE'}</Tag>,
    },
    {
      title: 'Hành động',
      key: 'actions',
      align: 'center',
      render: (_: any, record: any) => (
        <div className="flex justify-center gap-2">
          {ability.can(Action.Update, Subject.Role) && (
            <Button icon={<EditOutlined />} onClick={() => openEditModal(record)} />
          )}
          {ability.can(Action.Delete, Subject.Role) && (
            <Popconfirm
              title="Bạn có chắc chắn muốn xóa vai trò này không?"
              onConfirm={() => handleDelete(record.id)}
              okText="Có"
              cancelText="Không"
            >
              <Button icon={<DeleteOutlined />} danger />
            </Popconfirm>
          )}
        </div>
      ),
    },
  ];

  if (rolesError || permissionsError) {
    const status = (rolesError as any)?.status || (permissionsError as any)?.status || 500;
    return <Sidebar><ErrorHandler status={status} /></Sidebar>;
  }

  return (
    <Sidebar>
      <div className="p-4 max-w-screen-xl mx-auto w-full">
        {isLoadingRoles || isLoadingPermissions ? (
          <Loading message="Đang tải dữ liệu vai trò và quyền hạn..." />
        ) : (
          <>
            <Typography.Title
              level={2}
              className="mb-4 text-xl sm:text-2xl md:text-3xl"
            >
              Danh sách Roles (Vai Trò)
            </Typography.Title>

            <div className="mb-4 flex items-center justify-between gap-2">
              <div className="flex-grow">
                <Input
                  placeholder="Tìm kiếm vai trò..."
                  prefix={<SearchOutlined />}
                  value={searchText}
                  onChange={(e) => setSearchText(e.target.value)}
                  allowClear
                  className="w-full"
                />
              </div>

              {ability.can(Action.Create, Subject.Role) && (
                <div className="flex-shrink-0">
                  {isSmallScreen ? (
                    <Tooltip title="Thêm vai trò">
                      <Button
                        type="primary"
                        shape="circle"
                        icon={<PlusOutlined />}
                        onClick={openCreateModal}
                        className="min-w-[40px]"
                      />
                    </Tooltip>
                  ) : (
                    <Button
                      type="primary"
                      icon={<PlusOutlined />}
                      onClick={openCreateModal}
                    >
                      Thêm vai trò
                    </Button>
                  )}
                </div>
              )}
            </div>

            <Card className="overflow-auto">
              <Table
                dataSource={filteredRoles}
                columns={columns}
                rowKey="id"
                pagination={{ pageSize: 10 }}
              />
            </Card>

            <AddRoleModal
              isOpen={isModalOpen}
              onClose={() => setIsModalOpen(false)}
              onSubmit={handleModalSubmit}
              initialValues={editingRole}
              isEditing={!!editingRole}
            />
          </>
        )}
      </div>
    </Sidebar>
  );
};

export default withPermission(RoleManagement, Action.Read, Subject.Role);