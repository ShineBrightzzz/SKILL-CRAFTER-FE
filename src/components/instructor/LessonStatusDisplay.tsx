'use client';

import React from 'react';
import { Tag, Tooltip } from 'antd';
import { InfoCircleOutlined } from '@ant-design/icons';

interface LessonStatusDisplayProps {
  status: number;
  message?: string;
}

export const LessonStatusDisplay: React.FC<LessonStatusDisplayProps> = ({ status, message }) => {
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
      </Tag>
      {message && (
        <Tooltip title={message}>
          <InfoCircleOutlined className="text-gray-400 cursor-pointer" />
        </Tooltip>
      )}
    </div>
  );
};

export default LessonStatusDisplay;
