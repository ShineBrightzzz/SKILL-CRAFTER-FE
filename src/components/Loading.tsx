import React, { useEffect, useState } from 'react';
import { Spin, Typography } from 'antd';
import { LoadingOutlined } from '@ant-design/icons';

const { Text } = Typography;

interface LoadingProps {
  message?: string;
  tip?: string;
  fullScreen?: boolean;
}

const Loading: React.FC<LoadingProps> = ({ 
  message = 'Đang tải dữ liệu...', 
  tip = 'Vui lòng đợi trong giây lát', 
  fullScreen = false 
}) => {
  const [dots, setDots] = useState('');
  const [tipIndex, setTipIndex] = useState(0);
  
  const tips = [
    'Vui lòng đợi trong giây lát',
    'Đang xử lý dữ liệu',
    'Sắp hoàn thành rồi',
    'Cảm ơn vì sự kiên nhẫn của bạn'
  ];
  
  useEffect(() => {
    // Hiệu ứng dấu chấm động
    const dotInterval = setInterval(() => {
      setDots(prev => prev.length < 3 ? prev + '.' : '');
    }, 500);
    
    // Thay đổi tip mỗi 3 giây
    const tipInterval = setInterval(() => {
      setTipIndex(prev => (prev + 1) % tips.length);
    }, 3000);
    
    return () => {
      clearInterval(dotInterval);
      clearInterval(tipInterval);
    };
  }, []);
  
  const antIcon = <LoadingOutlined style={{ fontSize: 40, color: '#1890ff' }} spin />;

  return (
    <div
      style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: fullScreen ? '100vh' : '100%',
        minHeight: fullScreen ? '100vh' : '300px',
        width: '100%',
        flexDirection: 'column',
        background: 'rgba(255, 255, 255, 0.8)',
        backdropFilter: 'blur(5px)',
        position: fullScreen ? 'fixed' : 'relative',
        top: 0,
        left: 0,
        zIndex: fullScreen ? 1000 : 1,
      }}
    >
      <div
        style={{
          background: 'white',
          padding: '30px 40px',
          borderRadius: '12px',
          boxShadow: '0 10px 25px rgba(0, 0, 0, 0.05)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          maxWidth: '90%',
          width: '400px',
          animation: 'fadeIn 0.5s ease-in-out',
        }}
      >
        <div style={{ marginBottom: 24 }}>
          <Spin indicator={antIcon} />
        </div>
        
        <Text strong style={{ fontSize: 18, color: '#333', marginBottom: 8 }}>
          {message}{dots}
        </Text>
        
        <Text style={{ fontSize: 14, color: '#888', textAlign: 'center' }}>
          {tips[tipIndex]}
        </Text>
        
        <div 
          style={{ 
            marginTop: 20,
            height: 4,
            width: '100%',
            background: '#f0f0f0',
            borderRadius: 2,
            overflow: 'hidden'
          }}
        >
          <div 
            style={{ 
              height: '100%', 
              width: '30%', 
              background: '#1890ff',
              animation: 'loading 1.5s infinite',
              borderRadius: 2,
            }} 
          />
        </div>
      </div>
      
      <style jsx global>{`
        @keyframes loading {
          0% {
            transform: translateX(-100%);
          }
          100% {
            transform: translateX(400%);
          }
        }
        
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
};

export default Loading;