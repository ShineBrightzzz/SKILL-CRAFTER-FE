'use client';

import React from 'react';
import { Badge, List, Dropdown, Button, Empty } from 'antd';
import { BellOutlined } from '@ant-design/icons';
import { 
  useGetUserNotificationsQuery, 
  useGetUnreadCountQuery,
  useMarkAsReadMutation,
  useMarkAllAsReadMutation,
  NotificationDTO
} from '@/services/notification.service';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import 'dayjs/locale/vi';

dayjs.extend(relativeTime);
dayjs.locale('vi');

const NotificationDropdown: React.FC = () => {  const { data: notificationData, isLoading } = useGetUserNotificationsQuery();
  const { data: unreadCountData } = useGetUnreadCountQuery();
  const [markAsRead] = useMarkAsReadMutation();
  const [markAllAsRead] = useMarkAllAsReadMutation();
  
  const notifications = notificationData?.data || [];
  const unreadCount = unreadCountData?.data || 0;
    // TypeScript type guard
  const isNotification = (notification: any): notification is NotificationDTO => {
    return notification && 
           typeof notification.id === 'string' &&
           typeof notification.title === 'string' &&
           typeof notification.message === 'string' &&
           typeof notification.read === 'boolean';
  };
  const handleMarkAsRead = async (id: string) => {
    try {
      await markAsRead(id);
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await markAllAsRead();
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
    }
  };

  const dropdownContent = (
    <div className="bg-white rounded-lg shadow-lg p-2 w-80">
      <div className="flex justify-between items-center mb-2 px-2">
        <h3 className="text-lg font-semibold">Thông báo</h3>
        {unreadCount > 0 && (
          <Button size="small" onClick={handleMarkAllAsRead}>
            Đánh dấu tất cả đã đọc
          </Button>
        )}
      </div>
      <List
        className="max-h-96 overflow-y-auto"
        loading={isLoading}
        dataSource={notifications}
        locale={{
          emptyText: <Empty description="Không có thông báo" />
        }}
        renderItem={(notification: NotificationDTO) => (
          <List.Item 
            className={`cursor-pointer hover:bg-gray-50 p-2 rounded ${notification.read ? 'bg-white' : 'bg-white border-l-4 border-blue-500'}`}
            onClick={() => !notification.read && handleMarkAsRead(notification.id)}
          >
            <div className="w-full">
              <div className="flex justify-between items-start">
                <span className={`font-medium ${notification.read ? 'text-gray-600' : 'text-gray-800'}`}>
                  {notification.title}
                </span>
                <span className="text-xs text-gray-500">
                  {dayjs(notification.createdAt).fromNow()}
                </span>
              </div>
              <p className="text-sm text-gray-600 mt-1">{notification.message}</p>
            </div>
          </List.Item>
        )}
      />
    </div>
  );

  return (
    <Dropdown 
      overlay={dropdownContent} 
      trigger={['click']}
      placement="bottomRight"
    >
      <div className="cursor-pointer">
        <Badge count={unreadCount} overflowCount={99}>
          <BellOutlined className="text-xl text-white" />
        </Badge>
      </div>
    </Dropdown>
  );
};

export default NotificationDropdown;
