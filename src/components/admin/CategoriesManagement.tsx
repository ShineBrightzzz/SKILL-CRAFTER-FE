'use client';

import React, { useState } from 'react';
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
  
  const { data: categoriesResponse, isLoading, refetch } = useGetAllCategoriesQuery({
    page: currentPage,
    size: pageSize,
    search: searchTerm
  });

  const categories = categoriesResponse?.data?.result || [];
  const paginationMeta = categoriesResponse?.data?.meta || { 
    page: 1, 
    pageSize: 10, 
    pages: 1, 
    total: 0 
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

  const columns = [
    {
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
      title: 'Số khóa học',
      dataIndex: 'coursesCount',
      key: 'coursesCount',
      render: (_: any, record: any) => record.courses?.length || 0
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
    <Card title="Quản lý danh mục khóa học">
      <Button 
        type="primary" 
        icon={<PlusOutlined />} 
        onClick={() => showModal()}
        style={{ marginBottom: 16 }}
      >
        Thêm danh mục mới
      </Button>

      <div className="mb-4">
        <Input.Search
          placeholder="Tìm kiếm danh mục..."
          allowClear
          enterButton
          className="max-w-xs"
          value={searchTerm}
          onChange={e => {
            setSearchTerm(e.target.value);
            setCurrentPage(1); // Reset to first page on search
          }}
        />
      </div>

      <Table
        columns={columns}
        dataSource={categories}
        rowKey="id"
        loading={isLoading}
        pagination={{
          current: currentPage,
          pageSize: pageSize,
          total: paginationMeta.total,
          onChange: (page, pageSize) => {
            setCurrentPage(page);
            setPageSize(pageSize);
          }
        }}
      />

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
