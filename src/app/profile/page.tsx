'use client';

import React, { useState, useEffect } from 'react';
import { Button, Form, Input, Upload, message, Card, Avatar, Spin, Divider } from 'antd';
import { UserOutlined, MailOutlined, PhoneOutlined, UploadOutlined } from '@ant-design/icons';
import { useAuth } from '@/store/hooks';
import { useUpdateAccountMutation } from '@/services/user.service';

const ProfilePage = () => {
  const { user } = useAuth();
  const [form] = Form.useForm();
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [updateAccount, { isLoading: isUpdating }] = useUpdateAccountMutation();

  useEffect(() => {
    if (user) {
      form.setFieldsValue({
        username: user.username,
        email: user.email,
        familyName: user.familyName,
        givenName: user.givenName
      });
      setAvatarUrl(user.pictureUrl || null);
    }
  }, [user, form]);

  const handleSubmit = async (values: any) => {
    if (!user?.id) return;

    try {
      await updateAccount({
        id: user.id,
        body: {
          familyName: values.familyName,
          givenName: values.givenName,
          email: values.email,
          password: values.password,
        }
      }).unwrap();
      
      message.success('Cập nhật thông tin thành công!');
    } catch (error) {
      console.error('Failed to update profile:', error);
      message.error('Có lỗi xảy ra khi cập nhật thông tin');
    }
  };

  const customUploadRequest = async ({ file, onSuccess, onError }: any) => {
    if (!user?.id) return;

    try {
      const response = await updateAccount({
        id: user.id,
        body: {
          pictureFile: file
        }
      }).unwrap();
      
      // Update avatar URL from server response
      const updatedUser = Array.isArray(response.data?.result) 
        ? response.data?.result[0] 
        : response.data?.result;      if (updatedUser?.pictureUrl) {
        setAvatarUrl(updatedUser.pictureUrl);
      }
      
      message.success('Cập nhật ảnh đại diện thành công!');
      onSuccess("Upload successful");
    } catch (error) {
      console.error('Failed to upload avatar:', error);
      message.error('Có lỗi xảy ra khi tải lên ảnh đại diện');
      onError("Upload failed");
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Spin size="large" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-3xl mx-auto px-4">
        <Card className="shadow-md">
          <div className="text-center mb-8">
            <div className="mb-4">
              <Avatar
                size={128}
                src={avatarUrl}
                icon={!avatarUrl && <UserOutlined />}
                className="border-2 border-blue-200"
              />
            </div>
            <Upload
              customRequest={customUploadRequest}
              showUploadList={false}
              accept="image/*"
            >
              <Button icon={<UploadOutlined />}>Thay đổi ảnh đại diện</Button>
            </Upload>
          </div>

          <Divider />          <Form
            form={form}
            layout="vertical"
            onFinish={handleSubmit}
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Form.Item
                name="familyName"
                label="Họ"
                rules={[{ required: true, message: 'Vui lòng nhập họ' }]}
              >
                <Input placeholder="Nhập họ" />
              </Form.Item>

              <Form.Item
                name="givenName"
                label="Tên"
                rules={[{ required: true, message: 'Vui lòng nhập tên' }]}
              >
                <Input placeholder="Nhập tên" />
              </Form.Item>
            </div>

            <Form.Item
              name="username"
              label="Tên đăng nhập"
              rules={[{ required: true, message: 'Vui lòng nhập tên đăng nhập' }]}
            >
              <Input
                prefix={<UserOutlined />}
                placeholder="Nhập tên đăng nhập"
                disabled
              />
            </Form.Item>

            <Form.Item
              name="email"
              label="Email"
              rules={[
                { required: true, message: 'Vui lòng nhập email' },
                { type: 'email', message: 'Email không hợp lệ' }
              ]}
            >              <Input
                prefix={<MailOutlined />}
                placeholder="Nhập email"
                disabled
              />
            </Form.Item>

            <Form.Item
              name="password"
              label="Mật khẩu mới"
              rules={[
                { min: 6, message: 'Mật khẩu phải có ít nhất 6 ký tự' }
              ]}
            >
              <Input.Password
                placeholder="Nhập mật khẩu mới (để trống nếu không thay đổi)"
              />
            </Form.Item>

            <Form.Item className="text-right">
              <Button
                type="primary"
                htmlType="submit"
                loading={isUpdating}
                className="min-w-[120px]"
              >
                Cập nhật
              </Button>
            </Form.Item>
          </Form>
        </Card>
      </div>
    </div>
  );
};

export default ProfilePage;
