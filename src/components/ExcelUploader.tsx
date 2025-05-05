import { useState } from 'react';
import { Button, Upload, message } from 'antd';
import { InboxOutlined } from '@ant-design/icons';
import type { UploadFile } from 'antd/es/upload/interface';
import { useMediaQuery } from 'react-responsive';

export default function ExcelUploader() {
  const [fileList, setFileList] = useState<UploadFile[]>([]);
  const [uploading, setUploading] = useState(false);
  const isMobile = useMediaQuery({ query: '(max-width: 768px)' });

  const handleUpload = async () => {
    setUploading(true);

    try {
      const file = fileList[0] as unknown as File;
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch('http://localhost:5000/api/research/upload', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Failed to upload file');
      }

      const result = await response.json();
      message.success('File uploaded successfully');
      setFileList([]);
    } catch (error) {
      message.error('Failed to upload file');
      console.error('Upload Error:', error);
    }

    setUploading(false);
  };

  const props = {
    onRemove: (file: UploadFile) => {
      const index = fileList.indexOf(file);
      const newFileList = fileList.slice();
      newFileList.splice(index, 1);
      setFileList(newFileList);
    },
    beforeUpload: (file: File) => {
      const isExcel = file.type === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' || 
                      file.type === 'application/vnd.ms-excel';
      if (!isExcel) {
        message.error(`${file.name} is not an Excel file`);
        return false;
      }
      setFileList([...fileList, file as unknown as UploadFile]);
      return false;
    },
    fileList,
  };

  return (
    <div
      className="bg-white rounded-lg border border-gray-200"
      style={{ padding: isMobile ? '16px' : '24px' }}
    >
      <Upload.Dragger {...props} className="mb-6">
        <p className="ant-upload-drag-icon">
          <InboxOutlined />
        </p>
        <p className="ant-upload-text">Click or drag Excel files to this area to upload</p>
        <p className="ant-upload-hint">
          Support for single or bulk upload of Excel files (.xlsx, .xls)
        </p>
      </Upload.Dragger>

      <div className="flex justify-end mt-4">
        <Button
          type="primary"
          onClick={handleUpload}
          disabled={fileList.length === 0}
          loading={uploading}
          className="w-32"
          style={{ fontSize: isMobile ? '14px' : '16px' }}
        >
          {uploading ? 'Uploading' : 'Upload'}
        </Button>
      </div>
    </div>
  );
}