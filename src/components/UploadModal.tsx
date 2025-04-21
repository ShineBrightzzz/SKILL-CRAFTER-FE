import { useState } from 'react';
import { Modal, Upload, Button, message } from 'antd';
import { UploadOutlined } from '@ant-design/icons';

interface Semester {
  id: string;
  number: number;
  year: number;
}

interface UploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  semester: Semester | null;
  uploadType: string;
  onUpload: (file: File, metadata?: Record<string, any>) => Promise<void>;
}

const UploadModal = ({ isOpen, onClose, semester, uploadType, onUpload }: UploadModalProps) => {
  const [file, setFile] = useState<File | null>(null);
  const [fileList, setFileList] = useState<any[]>([]);
  const [uploading, setUploading] = useState(false);
  const handleFileChange = ({ fileList: newFileList }: any) => {
    setFileList(newFileList);
    const selectedFile = newFileList?.[0]?.originFileObj;
    if (selectedFile) setFile(selectedFile);
    else setFile(null);
  };

  const handleSubmit = async () => {
    await new Promise((r) => setTimeout(r, 100));
    if (!file || !semester) {
      message.error('Vui lòng chọn học kỳ và tệp hợp lệ.');
      return;
    }

    try {
      setUploading(true);
      await onUpload(file, {
        semesterId: semester?.id,
        type: uploadType,
      });
      message.success(`Tải lên ${uploadType} thành công`);
      handleClose();
    } catch {
      message.error(`Lỗi khi tải lên ${uploadType}, vui lòng thử lại.`);
    } finally {
      setUploading(false);
    }
  };

  const handleClose = () => {
    setFile(null);
    setFileList([]);
    onClose();
  };

  return (
    <Modal
      title={`Upload Excel - ${uploadType}`}
      open={isOpen}
      onCancel={handleClose}
      onOk={handleSubmit}
      okText="Upload"
      cancelText="Cancel"
      confirmLoading={uploading}
      okButtonProps={{ disabled: !file }}
    >
      <h3>Học kỳ: Kì {semester?.number} năm {semester?.year}</h3>
      <Upload
        accept=".xlsx,.xls"
        showUploadList={true}
        beforeUpload={() => false}
        onChange={handleFileChange}
        fileList={fileList}
        maxCount={1}
      >
        <Button icon={<UploadOutlined />}>Chọn tệp Excel</Button>
      </Upload>
    </Modal>
  );
};

export default UploadModal;
