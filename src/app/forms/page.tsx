'use client';

import React, { useState } from 'react';
import Sidebar from '@/layouts/sidebar';
import {
  Card,
  Typography,
  Table,
  Button,
  Input,
  Tag,
  Popconfirm,
  Tooltip,
} from 'antd';
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  SearchOutlined,
} from '@ant-design/icons';
import { ColumnsType } from 'antd/es/table';
import { useGetCurrentFormQuery, useCreateFormMutation } from '@/services/form.service';
// , useUpdateFormMutation, useDeleteFormMutation
import AddFormModal from '@/components/AddFormModal';
import Loading from '@/components/Loading';
import ErrorHandler from '@/components/ErrorHandler';
import { Action, Subject } from '@/utils/ability';
import { useAbility } from '@/hooks/useAbility';
import withPermission from '@/hocs/withPermission';
import { useMediaQuery } from 'react-responsive';
import { toast } from 'react-toastify';
import moment from 'moment';

interface Form {
  formId?: string;
  title: string;
  semesterId: string;
  endTime: string;
  semester: {
    id: string;
    number: number;
    year: number;
    startTime: string;
    endTime: string;
  };
}

const FormsPage: React.FC = () => {
  const [searchText, setSearchText] = useState('');
  const [isAddFormModalOpen, setIsAddFormModalOpen] = useState(false);
  const [isEditFormModalOpen, setIsEditFormModalOpen] = useState(false);
  const [selectedForm, setSelectedForm] = useState<Form | null>(null);

  const ability = useAbility();
  const isSmallScreen = useMediaQuery({ maxWidth: 767 });

  const { data: formResponse, isLoading, error, refetch } = useGetCurrentFormQuery();
  const [createForm] = useCreateFormMutation();
  // const [updateForm] = useUpdateFormMutation();
  // const [deleteForm] = useDeleteFormMutation();

  const forms = formResponse?.data?.data ? [formResponse.data.data] : [];

  const filteredForms = forms.filter((form: Form) =>
    form.title.toLowerCase().includes(searchText.toLowerCase())
  );

  const isExpired = (endTime: string) => new Date() > new Date(endTime);

  const handleEdit = (form: Form) => {
    setSelectedForm(form);
    setIsEditFormModalOpen(true);
  };

  const handleDelete = async (semesterId: string) => {
    // try {
    //   await deleteForm(semesterId).unwrap();
    //   toast.success('Xóa biểu mẫu thành công');
    //   refetch();
    // } catch (error: any) {
    //   toast.error(error?.data?.message || 'Xóa biểu mẫu thất bại');
    // }
  };

  const handleAddForm = async (formData: any) => {
    console.log('Form Data:', formData); // Debugging
    try {
      await createForm(formData).unwrap();
      toast.success('Thêm biểu mẫu thành công');
      setIsAddFormModalOpen(false);
      refetch();
    } catch (error) {
      toast.error('Thêm biểu mẫu thất bại');
    }
  };

  const handleEditForm = async (formData: any) => {
    // if (!selectedForm) return;
    // try {
    //   await updateForm({ ...formData, formId: selectedForm.formId }).unwrap();
    //   toast.success('Cập nhật biểu mẫu thành công');
    //   setIsEditFormModalOpen(false);
    //   refetch();
    // } catch (error) {
    //   toast.error('Cập nhật biểu mẫu thất bại');
    // }
  };

  const columns: ColumnsType<Form> = [
    {
      title: 'Tiêu đề',
      dataIndex: 'title',
      sorter: (a, b) => a.title.localeCompare(b.title),
    },
    {
      title: 'Học kỳ',
      render: (_, record) => `Kỳ ${record.semester.number} năm ${record.semester.year}`,
    },
    {
      title: 'Thời gian bắt đầu',
      render: (_, record) =>
        moment(record.semester.startTime).format('DD/MM/YYYY HH:mm'),
      sorter: (a, b) =>
        new Date(a.semester.startTime).getTime() - new Date(b.semester.startTime).getTime(),
    },
    {
      title: 'Thời hạn nộp',
      dataIndex: 'endTime',
      render: (endTime) =>
        moment(endTime).format('DD/MM/YYYY HH:mm'),
      sorter: (a, b) =>
        new Date(a.endTime).getTime() - new Date(b.endTime).getTime(),
    },
    {
      title: 'Trạng thái',
      dataIndex: 'endTime',
      render: (endTime) => (
        <Tag color={isExpired(endTime) ? 'red' : 'green'}>
          {isExpired(endTime) ? 'Đã hết hạn' : 'Còn hạn'}
        </Tag>
      ),
    },
  ];

  if (ability.can(Action.Update, Subject.Form) || ability.can(Action.Delete, Subject.Form)) {
    columns.push({
      title: 'Hành động',
      key: 'actions',
      align: 'center',
      render: (_, record) => (
        <div className="flex justify-center gap-2">
          {ability.can(Action.Update, Subject.Form) && (
            <Button icon={<EditOutlined />} onClick={() => handleEdit(record)} />
          )}
          {ability.can(Action.Delete, Subject.Form) && (
            <Popconfirm
              title="Bạn có chắc chắn muốn xóa biểu mẫu này?"
              onConfirm={() => handleDelete(record.semesterId)}
              okText="Có"
              cancelText="Không"
            >
              <Button icon={<DeleteOutlined />} danger />
            </Popconfirm>
          )}
        </div>
      ),
    });
  }

  if (error) {
    return (
      <Sidebar>
        <ErrorHandler status={(error as any)?.status || 500} />
      </Sidebar>
    );
  }

  return (
    <Sidebar>
      <div className="p-4 max-w-screen-xl mx-auto w-full">
        {isLoading ? (
          <Loading message="Đang tải danh sách biểu mẫu..." />
        ) : (
          <>
            <Typography.Title level={2} className="mb-4 text-xl sm:text-2xl md:text-3xl">
              Danh sách biểu mẫu
            </Typography.Title>

            <div className="mb-4 flex items-center justify-between gap-2">
              <Input
                placeholder="Tìm kiếm biểu mẫu..."
                prefix={<SearchOutlined />}
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
                allowClear
              />
              {ability.can(Action.Create, Subject.Form) && (
                isSmallScreen ? (
                  <Tooltip title="Thêm biểu mẫu">
                    <Button
                      type="primary"
                      shape="circle"
                      icon={<PlusOutlined />}
                      onClick={() => setIsAddFormModalOpen(true)}
                    />
                  </Tooltip>
                ) : (
                  <Button
                    type="primary"
                    icon={<PlusOutlined />}
                    onClick={() => setIsAddFormModalOpen(true)}
                  >
                    Thêm biểu mẫu
                  </Button>
                )
              )}
            </div>

            <Card className="shadow-md">
              <Table
                dataSource={filteredForms}
                columns={columns}
                rowKey="semesterId"
                pagination={false}
                locale={{ emptyText: 'Không có biểu mẫu nào' }}
              />
            </Card>
          </>
        )}

        <AddFormModal
          isOpen={isAddFormModalOpen}
          onClose={() => setIsAddFormModalOpen(false)}
          onAddForm={handleAddForm}
        />

        {selectedForm && (
          <AddFormModal
            isOpen={isEditFormModalOpen}
            onClose={() => setIsEditFormModalOpen(false)}
            onAddForm={handleEditForm}
            initialValues={{
              ...selectedForm,
              semesterId: selectedForm.semester.id, // ✅ Bắt buộc
            }}
            isEditing
          />
        )}
      </div>
    </Sidebar>
  );
};

export default withPermission(FormsPage, Action.Read, Subject.Form);
