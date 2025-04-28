import React from 'react';
import { Result } from 'antd';
import { CloseCircleOutlined } from '@ant-design/icons';

interface ErrorHandlerProps {
  status: number;
  message?: string;
}

const ErrorHandler: React.FC<ErrorHandlerProps> = ({ status, message }) => {
  const getTitle = () => {
    switch (status) {
      case 403:
        return '403 - Forbidden';
      case 404:
        return '404 - Not Found';
      case 500:
        return '500 - Internal Server Error';
      default:
        return `${status} - Error`;
    }
  };

  const getSubTitle = () => {
    if (message) return message;
    switch (status) {
      case 403:
        return 'Bạn không có quyền truy cập trang này.';
      case 404:
        return 'Trang bạn tìm kiếm không tồn tại.';
      case 500:
        return 'Đã xảy ra lỗi máy chủ.';
      default:
        return 'Đã xảy ra lỗi không xác định.';
    }
  };

  return (
    <div
      style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100%',
        minHeight: '300px',
      }}
    >
      <Result
        status="error"
        title={getTitle()}
        subTitle={getSubTitle()}
        icon={<CloseCircleOutlined style={{ fontSize: 48, color: '#ff4d4f' }} />}
      />
    </div>
  );
};

export default ErrorHandler;