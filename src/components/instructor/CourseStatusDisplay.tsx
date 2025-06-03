'use client';

import React from 'react';
import { Tag, Tooltip } from 'antd';
import { InfoCircleOutlined } from '@ant-design/icons';

interface CourseStatusDisplayProps {
  status: number;
  message?: string;  // statusMessage from API
}

export const CourseStatusDisplay: React.FC<CourseStatusDisplayProps> = ({ status, message: statusMessage }) => {
  const getStatusColor = () => {
    switch (status) {
      case 2:
        return 'success';
      case 3:
        return 'error';
      default:
        return 'warning';
    }
  };

  const getStatusText = () => {
    switch (status) {
      case 2:
        return 'Đã phê duyệt';
      case 3:
        return 'Đã từ chối';
      default:
        return 'Chờ phê duyệt';
    }
  };

  return (
    <div className="flex items-center gap-2">
      <Tag color={getStatusColor()}>
        {getStatusText()}
      </Tag>      {statusMessage && (
        <Tooltip title={statusMessage}>
          <InfoCircleOutlined className="text-gray-400 cursor-pointer" />
        </Tooltip>
      )}
    </div>
  );
};

export default CourseStatusDisplay;
