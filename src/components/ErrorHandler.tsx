import React, { useEffect, useState } from 'react';
import { Result, Button, Typography, Space } from 'antd';
import { 
  CloseCircleOutlined, 
  LockOutlined, 
  SearchOutlined, 
  WarningOutlined,
  HomeOutlined
} from '@ant-design/icons';
import { useRouter } from 'next/navigation';
import { useMediaQuery } from 'react-responsive';

const { Text } = Typography;

interface ErrorHandlerProps {
  status: number;
  message?: string;
}

const ErrorHandler: React.FC<ErrorHandlerProps> = ({ status, message }) => {
  const router = useRouter();
  const [animate, setAnimate] = useState(false);
  const isMobile = useMediaQuery({ maxWidth: 768 });
  
  useEffect(() => {
    setAnimate(true);
  }, []);

  const getErrorIcon = () => {
    switch (status) {
      case 403:
        return <LockOutlined style={{ fontSize: 64, color: '#faad14' }} className="error-icon" />;
      case 404:
        return <SearchOutlined style={{ fontSize: 64, color: '#1890ff' }} className="error-icon" />;
      case 500:
        return <WarningOutlined style={{ fontSize: 64, color: '#ff4d4f' }} className="error-icon" />;
      default:
        return <CloseCircleOutlined style={{ fontSize: 64, color: '#ff4d4f' }} className="error-icon" />;
    }
  };

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

  const getBackgroundColor = () => {
    switch (status) {
      case 403:
        return 'rgba(250, 173, 20, 0.05)';
      case 404:
        return 'rgba(24, 144, 255, 0.05)';
      case 500:
        return 'rgba(255, 77, 79, 0.05)';
      default:
        return 'rgba(255, 77, 79, 0.05)';
    }
  };

  const goHome = () => {
    router.push('/');
  };

  return (
    <div
      style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        width: '100%',
        background: getBackgroundColor(),
        transition: 'all 0.3s ease',
        padding: isMobile ? '16px' : '40px',
      }}
    >
      <div
        style={{
          backgroundColor: '#fff',
          borderRadius: '12px',
          padding: isMobile ? '20px' : '40px',
          boxShadow: '0 10px 30px rgba(0, 0, 0, 0.05)',
          maxWidth: isMobile ? '100%' : '90%',
          width: isMobile ? '100%' : '600px',
          textAlign: 'center',
          transform: animate ? 'translateY(0)' : 'translateY(20px)',
          opacity: animate ? 1 : 0,
          transition: 'all 0.5s ease',
        }}
      >
        <div
          style={{
            animation: animate ? 'pulse 2s infinite' : 'none',
            display: 'inline-block',
            marginBottom: isMobile ? '10px' : '20px',
          }}
        >
          {getErrorIcon()}
        </div>
        
        <Result
          status="error"
          title={
            <Typography.Title level={2} style={{ margin: '16px 0', color: status === 404 ? '#1890ff' : status === 403 ? '#faad14' : '#ff4d4f' }}>
              {getTitle()}
            </Typography.Title>
          }
          subTitle={
            <Text style={{ fontSize: '16px', color: '#666' }}>
              {getSubTitle()}
            </Text>
          }
          extra={
            <Space direction="vertical" size="middle" style={{ width: '100%', marginTop: '20px' }}>
              <Button 
                type="primary" 
                icon={<HomeOutlined />} 
                size="large"
                onClick={goHome}
                style={{
                  backgroundColor: status === 404 ? '#1890ff' : status === 403 ? '#faad14' : '#ff4d4f',
                  borderColor: status === 404 ? '#1890ff' : status === 403 ? '#faad14' : '#ff4d4f',
                  boxShadow: '0 2px 10px rgba(0, 0, 0, 0.1)',
                  height: '48px',
                  borderRadius: '8px',
                }}
              >
                Trở về trang chủ
              </Button>
              <Text type="secondary" style={{ fontSize: '14px' }}>
                Vui lòng thử lại sau hoặc liên hệ với quản trị viên nếu vấn đề vẫn tiếp tục.
              </Text>
            </Space>
          }
        />
      </div>

      <style jsx global>{`
        @keyframes pulse {
          0% {
            transform: scale(1);
          }
          50% {
            transform: scale(1.05);
          }
          100% {
            transform: scale(1);
          }
        }
        
        .error-icon {
          transition: all 0.3s ease;
        }
        
        .error-icon:hover {
          transform: scale(1.1);
        }
      `}</style>
    </div>
  );
};

export default ErrorHandler;