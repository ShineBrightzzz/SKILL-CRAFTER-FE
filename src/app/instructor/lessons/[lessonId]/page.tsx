'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Card, Form, Input, Select, InputNumber, Button, 
  message, Tabs, Spin, Typography, Modal
} from 'antd';
import { ArrowLeftOutlined, DeleteOutlined, PlusOutlined, DragOutlined } from '@ant-design/icons';
import { useGetLessonByIdQuery, useUpdateLessonMutation } from '@/services/lesson.service';
import { QuizQuestion, LessonUpdateDTO, TestCaseDTO } from '@/types/quiz';
import { useAuth } from '@/store/hooks';
import LessonStatusDisplay from '@/components/instructor/LessonStatusDisplay';
import { 
  useGetTestCasesByLessonIdQuery, 
  useCreateTestCaseMutation, 
  useUpdateTestCaseMutation,
  useDeleteTestCaseMutation 
} from '@/services/testcase.service';
import LessonPreview from '@/components/instructor/LessonPreview';
import { validateAndProcessQuizData } from '@/utils/quiz';

const { TextArea } = Input;
const { Option } = Select;
const { TabPane } = Tabs;
const { Title, Text } = Typography;

const lessonTypes = [
  { value: 1, label: 'Trắc nghiệm' },
  { value: 2, label: 'Video' },
  { value: 3, label: 'Bài tập lập trình' },
  { value: 4, label: 'Bài đọc' }
];

export default function LessonDetailPage({ params }: { params: { lessonId: string } }) {
  const router = useRouter();
  const lessonId = params.lessonId;
  const [form] = Form.useForm();
  const { user } = useAuth();  const [activeTab, setActiveTab] = useState('edit');
  const [lessonType, setLessonType] = useState<number>(4);
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [testCases, setTestCases] = useState<TestCaseDTO[]>([]);
  const [activeTestCase, setActiveTestCase] = useState<number | null>(null);  const [modifiedTestCases, setModifiedTestCases] = useState<Set<number>>(new Set());
  // Fetch lesson details    
  const { data: lessonResponse, isLoading: lessonLoading } = useGetLessonByIdQuery(lessonId);
  const lesson = lessonResponse;

  // Fetch test cases for programming lessons
  const { data: testCasesResponse, isLoading: testCasesLoading } = useGetTestCasesByLessonIdQuery(
    lessonId, 
    { skip: lessonType !== 3 }
  );
  
  // Update lesson mutation
  const [updateLesson, { isLoading: isUpdating }] = useUpdateLessonMutation();
    // Test case mutations
  const [createTestCase] = useCreateTestCaseMutation();
  const [updateTestCase] = useUpdateTestCaseMutation();
  const [deleteTestCase] = useDeleteTestCaseMutation();
    // Initialize form with lesson data
  useEffect(() => {
    if (lesson) {
      setLessonType(lesson.type);
      form.setFieldsValue({
        title: lesson.title,
        type: lesson.type,
        content: lesson.content,
        videoUrl: lesson.videoUrl,
        duration: lesson.duration,
        initialCode: lesson.initialCode,
        language: lesson.language,
        statusMessage: lesson.statusMessage
      });
    }
  }, [lesson, form]);
  // Initialize quiz questions from lesson data
  useEffect(() => {
    if (lesson?.quizData) {
      try {
        const quizData = typeof lesson.quizData === 'string' 
          ? JSON.parse(lesson.quizData) 
          : lesson.quizData;
        if (quizData.questions) {
          setQuestions(quizData.questions);
        }
      } catch (error) {
        console.error('Error parsing quiz data:', error);
      }
    }
  }, [lesson]);// Initialize test cases when data is loaded
  useEffect(() => {
    if (testCasesResponse) {
      // Ensure testCasesResponse is an array
      const testCasesArray = Array.isArray(testCasesResponse) 
        ? testCasesResponse 
        : (testCasesResponse as any).data || [];
      setTestCases(testCasesArray);
    }
  }, [testCasesResponse]);

  // Add a confirmation before navigating away if there are unsaved changes
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (modifiedTestCases.size > 0) {
        const message = 'Bạn có test cases chưa lưu. Bạn có chắc chắn muốn rời khỏi trang này?';
        e.returnValue = message;
        return message;
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [modifiedTestCases]);

  // Validate questions whenever they change
  useEffect(() => {
    const validateQuestions = () => {
      questions.forEach((q, index) => {
        // Ensure all questions have 4 options
        if (q.options.length !== 4) {
          message.error(`Question ${index + 1} must have exactly 4 options`);
          return;
        }
        
        // Validate correct answer
        if (q.correctAnswer < 0 || q.correctAnswer > 3) {
          message.error(`Question ${index + 1} has an invalid correct answer`);
          return;
        }
      });
    };
    
    validateQuestions();
  }, [questions]);
  // Handle form submission
  const handleSubmit = async (values: any) => {
    try {
      const formData = new FormData();

      // Add basic fields
      formData.append('title', values.title?.trim());
      formData.append('type', values.type.toString());

      // Process quiz data if it's a quiz lesson
      if (values.type === 1) {
        const quizValidation = validateAndProcessQuizData({
          questions: questions.map(q => ({
            ...q,
            question: q.question.trim(),
            options: q.options.map(opt => opt.trim())
          }))
        });

        if (!quizValidation.isValid) {
          message.error(quizValidation.error || 'Dữ liệu trắc nghiệm không hợp lệ');
          return;
        }

        formData.append('quizData', JSON.stringify(quizValidation.data));
        // Clear other type-specific fields
        formData.append('content', '');
        formData.append('videoUrl', '');
        formData.append('initialCode', '');
        formData.append('duration', '0');
      }

      // Handle other lesson types
      switch (values.type) {
        case 2: // Video
          formData.append('quizData', '');
          if (values.videoUrl) formData.append('videoUrl', values.videoUrl.trim());
          if (values.duration) formData.append('duration', values.duration.toString());
          if (values.content) formData.append('content', values.content.trim());
          break;

        case 3: // Programming
          formData.append('quizData', '');
          if (values.content) formData.append('content', values.content.trim());
          if (values.initialCode) formData.append('initialCode', values.initialCode.trim());
          if (values.solutionCode) formData.append('solutionCode', values.solutionCode.trim());
          if (values.testCases) formData.append('testCases', values.testCases.trim());
          if (values.language) formData.append('language', values.language);
          break;

        case 4: // Reading
          formData.append('quizData', '');
          if (values.content) formData.append('content', values.content.trim());
          break;
      }      // Send the update
      // Preserve the status if it exists
      if (lesson && lesson.status !== undefined) {
        formData.append('status', String(lesson.status));
      }
      if (lesson && lesson.statusMessage) {
        formData.append('statusMessage', lesson.statusMessage);
      }
      
      await updateLesson({
        id: lessonId,
        body: formData
      }).unwrap();

      message.success('Cập nhật bài học thành công!');
      router.push(`/instructor/chapters/${lesson?.chapterId}`);
    } catch (error) {
      console.error('Failed to update lesson:', error);
      message.error('Có lỗi xảy ra khi cập nhật bài học');
    }
  };
    // Handle lesson type change
  const handleLessonTypeChange = (value: number) => {
    setLessonType(value);
    
    // If changing to programming exercise, switch to testcases tab
    if (value === 3 && activeTab !== 'testcases') {
      // We don't want to switch tabs immediately as it might confuse the user
      // Just keep the current tab active
    }
    
    // If changing from programming exercise, switch back to edit tab if on testcases
    if (value !== 3 && activeTab === 'testcases') {
      setActiveTab('edit');
    }
  };

  const addQuestion = () => {
    const newQuestion: QuizQuestion = {
      question: '',
      options: new Array(4).fill(''),  // Always initialize with 4 empty options
      correctAnswer: 0,
      explanation: ''  // Initialize empty explanation
    };
    setQuestions(prevQuestions => [...prevQuestions, newQuestion]);
  };

  const removeQuestion = (index: number) => {
    setQuestions(questions.filter((_, i) => i !== index));
  };

  const updateQuestion = (index: number, field: keyof QuizQuestion, value: any) => {
    const updatedQuestions = questions.map((q, i) => {
      if (i !== index) return q;
      
      if (field === 'options') {
        const [optionIndex, optionValue] = value;
        // Ensure optionIndex is valid
        if (optionIndex < 0 || optionIndex > 3) {
          message.error('Invalid option index');
          return q;
        }
        // Create new options array with updated value at index
        const newOptions = [...q.options];
        newOptions[optionIndex] = optionValue;
        return {
          ...q,
          options: newOptions
        };
      }
      
      if (field === 'correctAnswer') {
        // Validate correct answer is between 0-3
        const answer = Number(value);
        if (isNaN(answer) || answer < 0 || answer > 3) {
          message.error('Correct answer must be between 0 and 3');
          return q;
        }
        return {
          ...q,
          correctAnswer: answer
        };
      }
      
      // Handle other fields
      return {
        ...q,
        [field]: value
      };
    });
      setQuestions(updatedQuestions);
  };

  // Test case management functions
  const addTestCase = () => {
    const newTestCase: TestCaseDTO = {
      lessonId: lessonId,
      input: '',
      expectedOutput: '',
      isSample: false
    };
    
    // Add to test cases
    const currentTestCases = Array.isArray(testCases) ? testCases : [];
    const newTestCases = [...currentTestCases, newTestCase];
    setTestCases(newTestCases);
    
    // Mark as modified
    setModifiedTestCases(prev => {
      const newSet = new Set(prev);
      newSet.add(newTestCases.length - 1); // Index of the newly added test case
      return newSet;
    });
    
    // Auto scroll to the new test case after a short delay
    setTimeout(() => {
      const testCaseElements = document.querySelectorAll('.test-case-card');
      if (testCaseElements.length > 0) {
        const lastElement = testCaseElements[testCaseElements.length - 1];
        lastElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }, 100);
  };

  const removeTestCase = async (index: number) => {
    if (!Array.isArray(testCases) || index < 0 || index >= testCases.length) return;
    
    const testCase = testCases[index];
    
    // Show confirmation modal
    Modal.confirm({
      title: 'Xóa Test Case',
      content: 'Bạn có chắc chắn muốn xóa test case này?',
      okText: 'Xóa',
      okType: 'danger',
      cancelText: 'Hủy',
      onOk: async () => {
        // If test case has an ID, it's saved in the database and needs to be deleted
        if (testCase.id) {
          try {
            setActiveTestCase(index); // Set loading state
            await deleteTestCase(testCase.id).unwrap();
            message.success('Đã xóa test case thành công');
          } catch (error) {
            console.error('Error deleting test case:', error);
            message.error('Có lỗi xảy ra khi xóa test case');
            setActiveTestCase(null); // Clear loading state on error
            return; // Don't proceed with removing from UI if server delete failed
          }
        }
        
        // Remove from UI
        setTestCases(prev => prev.filter((_, i) => i !== index));
        setActiveTestCase(null); // Clear loading state
      }
    });
  };

  const updateTestCaseField = (index: number, field: keyof TestCaseDTO, value: any) => {
    if (!Array.isArray(testCases) || index < 0 || index >= testCases.length) return;
    
    setTestCases(prev => prev.map((tc, i) => 
      i === index ? { ...tc, [field]: value } : tc
    ));
    
    // Mark this test case as modified
    setModifiedTestCases(prev => {
      const newSet = new Set(prev);
      newSet.add(index);
      return newSet;
    });
  };

  const saveTestCase = async (index: number) => {
    if (!Array.isArray(testCases) || index < 0 || index >= testCases.length) return;
    
    try {
      const testCase = testCases[index];
      if (!testCase.input.trim() || !testCase.expectedOutput.trim()) {
        message.error('Vui lòng nhập đầy đủ input và expected output');
        return;
      }

      setActiveTestCase(index); // Set loading state

      if (testCase.id) {
        // Update existing test case
        await updateTestCase(testCase).unwrap();
        message.success('Cập nhật test case thành công!');
      } else {
        // Create new test case
        const result = await createTestCase(testCase).unwrap();
        // Update the test case with the returned ID
        setTestCases(prev => prev.map((tc, i) => 
          i === index ? { ...tc, id: result.id } : tc
        ));
        message.success('Tạo test case thành công!');
      }
      
      // Remove from modified set after successful save
      setModifiedTestCases(prev => {
        const newSet = new Set(prev);
        newSet.delete(index);
        return newSet;
      });
    } catch (error) {
      console.error('Error saving test case:', error);
      message.error('Có lỗi xảy ra khi lưu test case');
    } finally {
      setActiveTestCase(null); // Clear loading state
    }
  };

  const moveTestCaseUp = (index: number) => {
    if (!Array.isArray(testCases) || index <= 0) return; // Can't move up the first item
    
    // Create a copy of the array
    const newTestCases = [...testCases];
    // Swap the item with the one above it
    [newTestCases[index - 1], newTestCases[index]] = [newTestCases[index], newTestCases[index - 1]];
    
    // Update state
    setTestCases(newTestCases);
    
    // Mark both affected test cases as modified if they have IDs
    const updatedSet = new Set(modifiedTestCases);
    if (newTestCases[index - 1].id) updatedSet.add(index - 1);
    if (newTestCases[index].id) updatedSet.add(index);
    setModifiedTestCases(updatedSet);
  };
  const moveTestCaseDown = (index: number) => {
    if (!Array.isArray(testCases) || index >= testCases.length - 1) return; // Can't move down the last item
    
    // Create a copy of the array
    const newTestCases = [...testCases];
    // Swap the item with the one below it
    [newTestCases[index], newTestCases[index + 1]] = [newTestCases[index + 1], newTestCases[index]];
    
    // Update state
    setTestCases(newTestCases);
    
    // Mark both affected test cases as modified if they have IDs
    const updatedSet = new Set(modifiedTestCases);
    if (newTestCases[index].id) updatedSet.add(index);
    if (newTestCases[index + 1].id) updatedSet.add(index + 1);
    setModifiedTestCases(updatedSet);
  };

  const duplicateTestCase = (index: number) => {
    if (!Array.isArray(testCases) || index < 0 || index >= testCases.length) return;
    
    const testCase = testCases[index];
    
    // Create a duplicate without the ID
    const duplicatedTestCase: TestCaseDTO = {
      lessonId: testCase.lessonId,
      input: testCase.input,
      expectedOutput: testCase.expectedOutput,
      isSample: testCase.isSample
      // Note: We don't copy ID, so it will be treated as a new test case
    };
    
    // Insert after the current position
    const newTestCases = [
      ...testCases.slice(0, index + 1),
      duplicatedTestCase,
      ...testCases.slice(index + 1)
    ];
    
    // Update state
    setTestCases(newTestCases);
    
    // Mark the new test case as modified
    setModifiedTestCases(prev => {
      const newSet = new Set(prev);
      newSet.add(index + 1); // Index of the newly added duplicate
      return newSet;
    });
    
    // Show success message
    message.success('Đã sao chép test case thành công');
  };
  
  const saveAllTestCases = async () => {
    if (!Array.isArray(testCases) || modifiedTestCases.size === 0) {
      message.info('Không có test case nào cần lưu');
      return;
    }

    const hasEmptyFields = testCases.some(tc => 
      modifiedTestCases.has(testCases.indexOf(tc)) && 
      (!tc.input.trim() || !tc.expectedOutput.trim())
    );

    if (hasEmptyFields) {
      message.error('Vui lòng nhập đầy đủ input và expected output cho tất cả test cases');
      return;
    }

    try {
      // Convert Set to Array for easier iteration
      const modifiedIndices = Array.from(modifiedTestCases);
      
      // Show loading
      message.loading('Đang lưu test cases...', 0);
      
      // Process each modified test case sequentially
      for (const index of modifiedIndices) {
        const testCase = testCases[index];
        
        if (testCase.id) {
          // Update existing test case
          await updateTestCase(testCase).unwrap();
        } else {
          // Create new test case
          const result = await createTestCase(testCase).unwrap();
          // Update the test case with the returned ID
          setTestCases(prev => prev.map((tc, i) => 
            i === index ? { ...tc, id: result.id } : tc
          ));
        }
      }
      
      // Clear all modified flags
      setModifiedTestCases(new Set());
      
      // Hide loading and show success
      message.destroy();
      message.success(`Đã lưu thành công ${modifiedIndices.length} test case`);
    } catch (error) {
      console.error('Error saving test cases:', error);
      message.destroy();
      message.error('Có lỗi xảy ra khi lưu test cases');
    }
  };
  
  // Add a confirmation before navigating away if there are unsaved changes
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (modifiedTestCases.size > 0) {
        const message = 'Bạn có test cases chưa lưu. Bạn có chắc chắn muốn rời khỏi trang này?';
        e.returnValue = message;
        return message;
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [modifiedTestCases]);
  
  // Render different form fields based on lesson type
  const renderLessonTypeFields = () => {
    switch (lessonType) {      case 1: // Quiz
        return (
          <>
            <div className="space-y-6">
              {questions.map((question, questionIndex) => (
                <Card 
                  key={questionIndex} 
                  className="bg-gray-50"
                  extra={
                    <Button 
                      danger 
                      icon={<DeleteOutlined />} 
                      onClick={() => removeQuestion(questionIndex)}
                    >
                      Xóa câu hỏi
                    </Button>
                  }
                >
                  <Form.Item
                    label={`Câu hỏi ${questionIndex + 1}`}
                    required
                  >
                    <Input
                      value={question.question}
                      onChange={(e) => updateQuestion(questionIndex, 'question', e.target.value)}
                      placeholder="Nhập câu hỏi"
                    />
                  </Form.Item>                  <div className="space-y-4">
                    {question.options.map((option, optionIndex) => (
                      <div key={optionIndex} className="flex items-center space-x-2">
                        <Form.Item
                          className="flex-1 mb-0"
                          required
                        >
                          <Input
                            value={option}
                            onChange={(e) => updateQuestion(questionIndex, 'options', [optionIndex, e.target.value])}
                            placeholder={`Đáp án ${optionIndex + 1}`}
                            className={question.correctAnswer === optionIndex ? 'border-green-500' : ''}
                          />
                        </Form.Item>
                        <Form.Item className="mb-0">
                          <Button
                            type={question.correctAnswer === optionIndex ? 'primary' : 'default'}
                            onClick={() => updateQuestion(questionIndex, 'correctAnswer', optionIndex)}
                          >
                            Đáp án đúng
                          </Button>
                        </Form.Item>
                      </div>
                    ))}

                    <Form.Item
                      label="Giải thích đáp án (tùy chọn)"
                    >
                      <Input.TextArea
                        value={question.explanation}
                        onChange={(e) => updateQuestion(questionIndex, 'explanation', e.target.value)}
                        placeholder="Nhập giải thích cho đáp án đúng (không bắt buộc)"
                        rows={2}
                      />
                    </Form.Item>
                  </div>
                </Card>
              ))}
              
              <Button 
                type="dashed" 
                onClick={addQuestion} 
                block
                icon={<PlusOutlined />}
              >
                Thêm câu hỏi
              </Button>

              {questions.length === 0 && (
                <div className="text-center text-gray-500 my-4">
                  Chưa có câu hỏi nào. Nhấn nút "Thêm câu hỏi" để bắt đầu.
                </div>
              )}
              
              <Form.Item name="quizData" hidden>
                <Input />
              </Form.Item>
            </div>
          </>
        );
        
      case 2: // Video
        return (
          <>
            <Form.Item
              name="videoUrl"
              label="Đường dẫn video"
              rules={[{ required: true, message: 'Vui lòng nhập đường dẫn video!' }]}
            >
              <Input placeholder="Nhập đường dẫn video (YouTube, Vimeo,...)" />
            </Form.Item>
            <Form.Item
              name="duration"
              label="Thời lượng (phút)"
              rules={[{ required: true, message: 'Vui lòng nhập thời lượng video!' }]}
            >
              <InputNumber className="w-full" placeholder="Nhập thời lượng video" />
            </Form.Item>
            <Form.Item
              name="content"
              label="Nội dung mô tả (Markdown - tùy chọn)"
            >
              <TextArea rows={6} placeholder="Nhập nội dung mô tả bằng Markdown (tùy chọn)" />
            </Form.Item>
          </>
        );      case 3: // Programming exercise
        return (
          <>
            <Form.Item
              name="content"
              label="Nội dung bài tập (Markdown)"
              rules={[{ required: true, message: 'Vui lòng nhập nội dung bài tập!' }]}
            >
              <TextArea rows={6} placeholder="Nhập nội dung bài tập bằng Markdown" />
            </Form.Item>
            <Form.Item
              name="initialCode"
              label="Mã khởi tạo"
              rules={[{ required: true, message: 'Vui lòng nhập mã khởi tạo!' }]}
            >
              <TextArea rows={6} placeholder="Nhập mã khởi tạo cho học viên" />
            </Form.Item>
            <Form.Item
              name="language"
              label="Ngôn ngữ lập trình"
              rules={[{ required: true, message: 'Vui lòng chọn ngôn ngữ lập trình!' }]}
            >
              <Select placeholder="Chọn ngôn ngữ lập trình">
                <Option value="javascript">JavaScript</Option>
                <Option value="python">Python</Option>
                <Option value="java">Java</Option>
                <Option value="csharp">C#</Option>
              </Select>
            </Form.Item>
            
            <div className="bg-blue-50 p-4 rounded-lg mt-4">
              <p className="text-blue-800 text-sm">
                💡 <strong>Lưu ý:</strong> Để quản lý test cases cho bài tập lập trình, 
                vui lòng chuyển sang tab "Test Cases" ở trên.
              </p>
            </div>
          </>
        );
        
      case 4: // Reading
      default:
        return (
          <Form.Item
            name="content"
            label="Nội dung bài đọc (Markdown)"
            rules={[{ required: true, message: 'Vui lòng nhập nội dung bài đọc!' }]}
          >
            <TextArea rows={10} placeholder="Nhập nội dung bài đọc bằng Markdown" />
          </Form.Item>
        );
    }
  };
    if (lessonLoading || testCasesLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Spin size="large" />
        <p className="ml-2">Đang tải thông tin bài học...</p>
      </div>
    );
  }

  if (!lesson) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-xl text-red-600">Không tìm thấy bài học</p>
      </div>
    );
  }
  
  const getLessonTypeName = (type: number) => {
    const lessonType = lessonTypes.find(lt => lt.value === type);
    return lessonType ? lessonType.label : 'Không xác định';
  };
  
  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <Button 
            icon={<ArrowLeftOutlined />} 
            onClick={() => router.push(`/instructor/chapters/${lesson.chapterId}`)}
            className="mb-4"
          >
            Quay lại danh sách bài học
          </Button>
        </div>
        
        <Card className="shadow-md">
          <Title level={3}>{lesson.title}</Title>
          <div className="mb-4 flex flex-wrap gap-4">
            <Text type="secondary">Chương: {lesson.chapterName}</Text>
            <Text type="secondary">Loại: {getLessonTypeName(lesson.type)}</Text>
            {lesson.duration && <Text type="secondary">Thời lượng: {lesson.duration} phút</Text>}            <LessonStatusDisplay 
              status={Number(lesson.status) || 0} 
              message={lesson.statusMessage} 
            />
          </div>
          <Tabs activeKey={activeTab} onChange={setActiveTab}>
            <TabPane tab="Chỉnh sửa bài học" key="edit">
              <Form 
                form={form} 
                layout="vertical" 
                onFinish={handleSubmit}
                initialValues={{
                  title: lesson.title,
                  type: lesson.type,
                  content: lesson.content,
                  videoUrl: lesson.videoUrl,
                  duration: lesson.duration,
                  initialCode: lesson.initialCode,
                  language: lesson.language,
                  status: lesson.status || 1,
                  statusMessage: lesson.statusMessage
                }}
              >
                <Form.Item
                  name="title"
                  label="Tên bài học"
                  rules={[{ required: true, message: 'Vui lòng nhập tên bài học!' }]}
                >
                  <Input placeholder="Nhập tên bài học" />
                </Form.Item>
                
                <Form.Item
                  name="type"
                  label="Loại bài học"
                  rules={[{ required: true, message: 'Vui lòng chọn loại bài học!' }]}
                >
                  <Select 
                    placeholder="Chọn loại bài học" 
                    onChange={handleLessonTypeChange}
                  >
                    {lessonTypes.map(type => (
                      <Option key={type.value} value={type.value}>{type.label}</Option>
                    ))}
                  </Select>
                </Form.Item>

                <Form.Item
                  name="status"
                  label="Trạng thái"
                  rules={[{ required: true, message: 'Vui lòng chọn trạng thái!' }]}
                >
                  <Select placeholder="Chọn trạng thái">
                    <Option value={1}>Chờ phê duyệt</Option>
                    <Option value={2}>Đã phê duyệt</Option>
                    <Option value={3}>Đã từ chối</Option>
                  </Select>
                </Form.Item>

                <Form.Item
                  name="statusMessage"
                  label="Thông báo trạng thái"
                >
                  <Input.TextArea 
                    rows={2}
                    placeholder="Nhập thông báo về trạng thái của bài học (tùy chọn)"
                  />
                </Form.Item>

                {/* Render different fields based on lesson type */}
                {renderLessonTypeFields()}
                
                <Form.Item className="mt-6">
                  <div className="flex justify-end space-x-2">
                    <Button onClick={() => router.back()}>
                      Hủy
                    </Button>
                    <Button type="primary" htmlType="submit" loading={isUpdating}>
                      Cập nhật bài học
                    </Button>
                  </div>
                </Form.Item>
              </Form>
            </TabPane>            {/* Test Cases Tab - Only show for programming lessons */}
            {lessonType === 3 && (
              <TabPane tab={`Test Cases (${Array.isArray(testCases) ? testCases.length : 0})`} key="testcases">
                <div className="bg-white"><div className="flex justify-between items-center mb-6">                    <div>                      <Title level={4}>Quản lý Test Cases</Title>
                      <p className="text-gray-500">
                        Tổng số: {Array.isArray(testCases) ? testCases.length : 0} test case{Array.isArray(testCases) && testCases.length !== 1 ? 's' : ''}, 
                        {Array.isArray(testCases) ? testCases.filter(tc => tc.isSample).length : 0} mẫu
                      </p>
                      {modifiedTestCases.size > 0 && (
                        <p className="text-orange-500 mt-1">
                          Bạn có {modifiedTestCases.size} test case chưa lưu hoặc đã sửa đổi
                        </p>
                      )}
                    </div>
                    <div className="space-x-2">
                      {modifiedTestCases.size > 0 && (
                        <Button 
                          type="primary" 
                          onClick={saveAllTestCases}
                        >
                          Lưu tất cả ({modifiedTestCases.size})
                        </Button>
                      )}
                      <Button 
                        type="primary" 
                        icon={<PlusOutlined />} 
                        onClick={addTestCase}
                      >
                        Thêm Test Case
                      </Button>
                    </div>
                  </div>                  {(!Array.isArray(testCases) || testCases.length === 0) && (
                    <div className="text-center text-gray-500 p-8 border-2 border-dashed border-gray-300 rounded-lg">
                      <p className="text-lg mb-2">Chưa có test case nào</p>
                      <p className="text-sm">Test cases giúp kiểm tra và chấm điểm tự động cho bài tập lập trình</p>
                    </div>
                  )}                  <div className="space-y-6">
                    {Array.isArray(testCases) && testCases.map((testCase, index) => (                      <Card 
                        key={index}
                        className="shadow-sm test-case-card"
                        title={
                          <div className="flex items-center justify-between">
                            <span>Test Case #{index + 1}</span>                            <div className="flex items-center space-x-2">
                              {testCase.isSample && (
                                <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                                  Sample
                                </span>
                              )}
                              {modifiedTestCases.has(index) && !testCase.id && (
                                <span className="px-2 py-1 bg-yellow-100 text-yellow-800 text-xs rounded-full">
                                  Chưa lưu
                                </span>
                              )}
                              {modifiedTestCases.has(index) && testCase.id && (
                                <span className="px-2 py-1 bg-orange-100 text-orange-800 text-xs rounded-full">
                                  Đã chỉnh sửa
                                </span>
                              )}
                              <Button 
                                type="primary"
                                size="small"
                                onClick={() => saveTestCase(index)}
                                loading={activeTestCase === index}
                                disabled={(!modifiedTestCases.has(index) && testCase.id) ? true : false}
                              >
                                {testCase.id ? 'Cập nhật' : 'Lưu'}
                              </Button>
                              <Button 
                                danger 
                                size="small"
                                icon={<DeleteOutlined />} 
                                onClick={() => removeTestCase(index)}
                                disabled={activeTestCase === index}
                              >
                                Xóa
                              </Button>
                            </div>
                          </div>
                        }
                      >
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Input <span className="text-red-500">*</span>
                            </label>
                            <TextArea
                              rows={6}
                              value={testCase.input}
                              onChange={(e) => updateTestCaseField(index, 'input', e.target.value)}
                              placeholder="Nhập dữ liệu đầu vào cho test case..."
                              className="font-mono"
                            />
                            <p className="text-xs text-gray-500 mt-1">
                              Dữ liệu đầu vào sẽ được truyền vào chương trình
                            </p>
                          </div>
                          
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Expected Output <span className="text-red-500">*</span>
                            </label>
                            <TextArea
                              rows={6}
                              value={testCase.expectedOutput}
                              onChange={(e) => updateTestCaseField(index, 'expectedOutput', e.target.value)}
                              placeholder="Nhập kết quả mong đợi..."
                              className="font-mono"
                            />
                            <p className="text-xs text-gray-500 mt-1">
                              Kết quả mong đợi khi chạy chương trình với input trên
                            </p>
                          </div>
                        </div>
                          <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center">
                              <input
                                type="checkbox"
                                id={`sample-${index}`}
                                checked={testCase.isSample}
                                onChange={(e) => updateTestCaseField(index, 'isSample', e.target.checked)}
                                className="mr-3"
                              />
                              <div>
                                <label htmlFor={`sample-${index}`} className="text-sm font-medium text-gray-700">
                                  Sample Test Case
                                </label>
                                <p className="text-xs text-gray-500">
                                  Nếu được chọn, test case này sẽ hiển thị cho học viên để tham khảo
                                </p>
                              </div>
                            </div>

                            <div className="flex space-x-2">
                              {index > 0 && (
                                <Button 
                                  size="small" 
                                  onClick={() => moveTestCaseUp(index)}
                                  icon={<span>↑</span>}
                                  title="Di chuyển lên"
                                />
                              )}                              {index < (Array.isArray(testCases) ? testCases.length - 1 : 0) && (
                                <Button 
                                  size="small" 
                                  onClick={() => moveTestCaseDown(index)}
                                  icon={<span>↓</span>}
                                  title="Di chuyển xuống"
                                />
                              )}
                              <Button 
                                size="small" 
                                onClick={() => duplicateTestCase(index)}
                                title="Sao chép test case"
                              >
                                Sao chép
                              </Button>
                            </div>
                          </div>
                        </div>

                        {testCase.id && (
                          <div className="mt-2 text-xs text-gray-500">
                            ID: {testCase.id}
                          </div>
                        )}
                      </Card>
                    ))}
                  </div>
                </div>
              </TabPane>
            )}
              <TabPane tab="Xem trước" key="preview">
              <div className="bg-white p-4 rounded-md">                  {lesson ? (                  <LessonPreview lesson={{
                    ...lesson,                    initialCode: lesson.initialCode || null,
                    language: lesson.language || null,
                    content: lesson.content || null,
                    videoUrl: lesson.videoUrl || null,
                    duration: lesson.duration || null,
                    contentFile: null,
                    videoFile: null,
                    quizData: lesson.quizData || null
                  }} />
                ) : (
                  <p className="text-gray-500 mb-4">Không thể tải dữ liệu bài học.</p>
                )}
              </div>
            </TabPane>
            
            <TabPane tab="Phản hồi học viên" key="feedback">
              <div className="bg-white p-4 rounded-md">
                <p className="text-gray-500 mb-4">Tính năng xem phản hồi của học viên sẽ được phát triển sau.</p>
              </div>
            </TabPane>
          </Tabs>
        </Card>
      </div>
    </div>
  );
}
