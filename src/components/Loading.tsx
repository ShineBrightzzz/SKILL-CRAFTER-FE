import React from 'react';
import { Spin } from 'antd';

const Loading: React.FC<{ message?: string }> = ({ message = 'Đang tải dữ liệu...' }) => {
  return (
    <div
      style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100%',
        minHeight: '200px',
        flexDirection: 'column',
      }}
    >
      <Spin size="large" />
      <p style={{ marginTop: 16, fontSize: 16, color: '#555' }}>{message}</p>
    </div>
  );
};

export default Loading;