'use client';

import React, { useState, useEffect } from 'react';
import { Button, Form, Input, Upload, message, Card, Avatar, Spin, Divider } from 'antd';
import { UserOutlined, MailOutlined, PhoneOutlined, UploadOutlined } from '@ant-design/icons';
import { useAuth } from '@/store/hooks';
import { useUpdateUserMutation } from '@/services/user.service';

const ProfilePage = () => {
  const { user } = useAuth();
  const [form] = Form.useForm();
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [updateUser, { isLoading: isUpdating }] = useUpdateUserMutation();  useEffect(() => {
    if (user) {
      console.log('Current user data:', user); // Debug log
      form.setFieldsValue({
        username: user.username,
        email: user.email,
        familyName: user.familyName || user.family_name,
        givenName: user.givenName || user.given_name,
      });
      setAvatarUrl(user.avatar_url || null);
    }
  }, [user, form]);
  const handleSubmit = async (values: any) => {
    if (!user?.id) return;

    try {
      const formData = new FormData();
      formData.append('familyName', values.familyName);
      formData.append('givenName', values.givenName);

      console.log('Submitting values:', values); // Debug log
      
      await updateUser({
        id: user.id,
        body: formData
      }).unwrap();
      
      message.success('Cập nhật thông tin thành công!');
    } catch (error) {
      console.error('Failed to update profile:', error);
      message.error('Có lỗi xảy ra khi cập nhật thông tin');
    }
  };

  const customUploadRequest = async ({ file, onSuccess, onError }: any) => {
    try {
      const formData = new FormData();
      formData.append('avatar', file);
      
      // TODO: Implement avatar upload API
      // const response = await uploadAvatar(formData);
      // setAvatarUrl(response.url);
      
      onSuccess("Upload successful");
    } catch (error) {
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

          <Divider />

          <Form
            form={form}
            layout="vertical"
            onFinish={handleSubmit}
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">              <Form.Item
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
            >
              <Input
                prefix={<MailOutlined />}
                placeholder="Nhập email"
                disabled
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
