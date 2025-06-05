'use client';

import React, { useState, useEffect } from 'react';
import { Table, Card, Button, Space, Modal, Form, Input, message } from 'antd';
import { EditOutlined, DeleteOutlined, PlusOutlined } from '@ant-design/icons';
import { useGetAllCategoriesQuery, useCreateCategoryMutation, useUpdateCategoryMutation, useDeleteCategoryMutation } from '@/services/category.service';
import withPermission from '@/hocs/withPermission';
import { Action, Subject } from '@/utils/ability';

const CategoriesManagement = () => {
  const [form] = Form.useForm();
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingCategory, setEditingCategory] = useState<any>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [searchTerm, setSearchTerm] = useState('');
  
  const { data: categoriesResponse, isLoading, error, refetch } = useGetAllCategoriesQuery({
    page: currentPage,
    size: pageSize,
    search: searchTerm.trim() // Ensure we trim whitespace
  });

  // Add error handling
  useEffect(() => {
    if (error) {
      message.error('Có lỗi khi tải dữ liệu danh mục');
      console.error('Categories load error:', error);
    }
  }, [error]);

  const categories = categoriesResponse?.data?.result || [];
  const paginationMeta = categoriesResponse?.data?.meta || { 
    page: 1, 
    pageSize: 10, 
    pages: 1, 
    total: 0 
  };

  // Handle search with debounce
  const handleSearch = (value: string) => {
    setSearchTerm(value);
    setCurrentPage(1); // Reset to first page on search
  };

  const [createCategory] = useCreateCategoryMutation();
  const [updateCategory] = useUpdateCategoryMutation();
  const [deleteCategory] = useDeleteCategoryMutation();

  const showModal = (category?: any) => {
    if (category) {
      setEditingCategory(category);
      form.setFieldsValue({
        name: category.name,
        description: category.description
      });
    } else {
      setEditingCategory(null);
      form.resetFields();
    }
    setIsModalVisible(true);
  };

  const handleCancel = () => {
    setIsModalVisible(false);
    form.resetFields();
  };

  const handleSubmit = async (values: any) => {
    try {
      if (editingCategory) {
        await updateCategory({ 
          id: editingCategory.id, 
          ...values 
        }).unwrap();
        message.success('Cập nhật danh mục thành công!');
      } else {
        await createCategory(values).unwrap();
        message.success('Thêm danh mục thành công!');
      }
      setIsModalVisible(false);
      form.resetFields();
      refetch();
    } catch (error) {
      console.error('Failed to save category:', error);
      message.error('Có lỗi xảy ra khi lưu danh mục');
    }
  };

  const handleDelete = (id: string) => {
    Modal.confirm({
      title: 'Xác nhận xóa',
      content: 'Bạn có chắc chắn muốn xóa danh mục này không?',
      okText: 'Xóa',
      okType: 'danger',
      cancelText: 'Hủy',
      onOk: async () => {
        try {
          await deleteCategory({ id }).unwrap();
          message.success('Xóa danh mục thành công!');
          refetch();
        } catch (error) {
          console.error('Failed to delete category:', error);
          message.error('Có lỗi xảy ra khi xóa danh mục');
        }
      }
    });
  };

  const columns = [    {
      title: 'Tên danh mục',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: 'Mô tả',
      dataIndex: 'description',
      key: 'description',
    },
    {
      title: 'Thao tác',
      key: 'action',
      render: (_: any, record: any) => (
        <Space size="middle">
          <Button 
            type="primary" 
            icon={<EditOutlined />}
            onClick={() => showModal(record)}
          >
            Sửa
          </Button>
          <Button 
            danger 
            icon={<DeleteOutlined />}
            onClick={() => handleDelete(record.id)}
          >
            Xóa
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <Card title="Quản lý danh mục khóa học" className="m-4">
      <div className="flex justify-between items-center mb-4">
        <Button 
          type="primary" 
          icon={<PlusOutlined />} 
          onClick={() => showModal()}
        >
          Thêm danh mục mới
        </Button>

        <Input.Search
          placeholder="Tìm kiếm danh mục..."
          allowClear
          enterButton
          style={{ width: 300 }}
          value={searchTerm}
          onChange={(e) => handleSearch(e.target.value)}
          onSearch={handleSearch}
        />
      </div>

      {error ? (
        <div className="text-center text-red-500 my-4">
          Có lỗi xảy ra khi tải dữ liệu. Vui lòng thử lại sau.
          <Button onClick={() => refetch()} className="ml-2">
            Thử lại
          </Button>
        </div>
      ) : (
        <Table
          columns={columns}
          dataSource={categories}
          rowKey="id"
          loading={isLoading}
          locale={{
            emptyText: searchTerm 
              ? 'Không tìm thấy danh mục phù hợp với từ khóa tìm kiếm' 
              : 'Chưa có danh mục nào'
          }}
          pagination={{
            current: currentPage,
            pageSize: pageSize,
            total: paginationMeta.total,
            onChange: (page, pageSize) => {
              setCurrentPage(page);
              if (pageSize) setPageSize(pageSize);
            },
            showSizeChanger: true,
            showTotal: (total) => `Tổng cộng ${total} danh mục`
          }}
        />
      )}

      <Modal
        title={editingCategory ? "Sửa danh mục" : "Thêm danh mục mới"}
        open={isModalVisible}
        onCancel={handleCancel}
        footer={null}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
        >
          <Form.Item
            name="name"
            label="Tên danh mục"
            rules={[{ required: true, message: 'Vui lòng nhập tên danh mục' }]}
          >
            <Input />
          </Form.Item>

          <Form.Item
            name="description"
            label="Mô tả"
            rules={[{ required: true, message: 'Vui lòng nhập mô tả' }]}
          >
            <Input.TextArea rows={4} />
          </Form.Item>

          <Form.Item>
            <Space>
              <Button type="primary" htmlType="submit">
                {editingCategory ? 'Cập nhật' : 'Thêm mới'}
              </Button>
              <Button onClick={handleCancel}>Hủy</Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </Card>
  );
};

export default withPermission(CategoriesManagement, Action.Read, Subject.Category);
