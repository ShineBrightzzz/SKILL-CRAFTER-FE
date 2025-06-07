'use client'

import { useState, useEffect } from 'react';
import Editor from '@monaco-editor/react';
import { useSubmitCodeMutation, useRunCodeMutation, LANGUAGE_IDS } from '@/services/codesubmit.service';
import { useUserCode } from '@/store/hooks';

export type SupportedLanguage = 'javascript' | 'python' | 'java' | 'csharp';

interface Language {
  id: SupportedLanguage;
  name: string;
  icon: string;
}

// Hỗ trợ các ngôn ngữ lập trình theo programmingLanguage trong form
const LANGUAGES: Record<SupportedLanguage, Language> = {
  'javascript': { id: 'javascript', name: 'JavaScript', icon: 'js' },
  'python': { id: 'python', name: 'Python', icon: 'py' },
  'java': { id: 'java', name: 'Java', icon: 'java' },
  'csharp': { id: 'csharp', name: 'C#', icon: 'cs' }
};

// Helper function to validate and normalize programming language
export function validateProgrammingLanguage(lang: string | undefined): SupportedLanguage {
  if (!lang) return 'javascript';
  const normalized = lang.toLowerCase();
  return (normalized in LANGUAGES) ? normalized as SupportedLanguage : 'javascript';
}

interface CodeEditorProps {
  initialCode?: string;
  programmingLanguage?: SupportedLanguage;
  className?: string;
  lessonId?: string;
  userId?: string;
  onCodeChange?: (code: string) => void;
  onComplete?: () => void | Promise<void>;
  useReduxStore?: boolean;
}

export default function CodeEditor({ 
  initialCode = '', 
  programmingLanguage: inputLanguage = 'java',
  className = '',
  lessonId,
  userId = '',
  onCodeChange,
  onComplete,
  useReduxStore = false
}: CodeEditorProps) {
  const currentLanguage = validateProgrammingLanguage(inputLanguage);
  const reduxCodeHook = useReduxStore && lessonId ? useUserCode(lessonId) : null;
  
  // Responsive height state for better display in learning environment
  const [editorHeight, setEditorHeight] = useState('500px');
  
  // Set editor height based on viewport on component mount
  useEffect(() => {
    function updateEditorHeight() {
      const vh = window.innerHeight;
      // Adjust the calculation based on the container in learning/[id]
      // Leave space for toolbar, input area and results
      const newHeight = Math.max(300, vh - 400) + 'px';
      setEditorHeight(newHeight);
    }
    
    updateEditorHeight();
    window.addEventListener('resize', updateEditorHeight);
    return () => window.removeEventListener('resize', updateEditorHeight);
  }, []);
  
  const [code, setCode] = useState(
    reduxCodeHook?.code || initialCode
  );
  
  const [userInput, setUserInput] = useState('');
  
  const [result, setResult] = useState<{
    success: boolean;
    output: string | null;
    error: string | null;
    executionTime?: number;
    memoryUsed?: number;
    testCasesPassed?: number | null;
    totalTestCases?: number | null;
  } | null>(null);

  // Update local state if Redux state changes
  useEffect(() => {
    if (reduxCodeHook?.code && reduxCodeHook.code !== code) {
      setCode(reduxCodeHook.code);
    }
  }, [reduxCodeHook?.code]);

  const handleEditorChange = (value: string = '') => {
    setCode(value);
    
    // Save to Redux if enabled
    if (reduxCodeHook?.saveCode) {
      reduxCodeHook.saveCode(value);
    }
    
    if (onCodeChange) {
      onCodeChange(value);
    }
  };
  const handleRunCode = async () => {
    try {
      const languageId = LANGUAGE_IDS[currentLanguage];
      
      const response = await runCode({
        language_id: languageId,
        source_code: code,
        stdin: userInput || undefined
      }).unwrap();
      
      if (response.success) {
        const hasError = response.data.error && response.data.error !== 'null' && response.data.error !== '';
        const resultObject = {
          success: !hasError,
          output: response.data.output,
          error: hasError ? response.data.error : null,
          executionTime: response.data.executionTime,
          memoryUsed: response.data.memoryUsed,
          testCasesPassed: null,
          totalTestCases: null
        };
        
        setResult(resultObject);
      } else {
        setResult({
          success: false,
          output: null,
          error: response.error || 'An error occurred during execution',
          executionTime: 0,
          memoryUsed: 0
        });
      }
    } catch (error: any) {
      let errorMessage = 'Failed to execute code.';
      
      if (error.status === 400) {
        errorMessage = 'Invalid code submission. Please check your syntax.';
      } else if (error.status === 429) {
        errorMessage = 'Too many requests. Please wait a moment before trying again.';
      } else if (error.data?.message) {
        errorMessage = error.data.message;
      } else if (error.status >= 500) {
        errorMessage = 'The code execution server is currently unavailable. Please try again later.';
      }

      console.error('Error running code:', error);
      setResult({
        success: false,
        output: null,
        error: errorMessage,
        executionTime: 0,
        memoryUsed: 0
      });
    }
  };  const handleSubmitCode = async () => {
    try {
      // Validate lessonId is present
      if (!lessonId) {
        setResult({
          success: false,
          output: null,
          error: 'Invalid submission: lessonId is required',
          executionTime: 0,
          memoryUsed: 0
        });
        return;
      }

      const languageId = LANGUAGE_IDS[currentLanguage];

      const response = await submitCode({
        language_id: languageId,
        source_code: code,
        lessonId: lessonId,
        userId: userId
      }).unwrap();
      
      if (response.success) {
        const hasError = response.data.error && response.data.error !== 'null' && response.data.error !== '';
        const resultObject = {
          success: !hasError && (response.data.testCasesPassed === null || response.data.testCasesPassed === response.data.totalTestCases),
          output: response.data.output,
          error: hasError ? response.data.error : null,
          executionTime: response.data.executionTime,
          memoryUsed: response.data.memoryUsed,
          testCasesPassed: response.data.testCasesPassed,
          totalTestCases: response.data.totalTestCases
        };

        setResult(resultObject);
        
        // Call onComplete callback if all test cases passed
        if (!hasError && response.data.testCasesPassed === response.data.totalTestCases) {
          onComplete?.();
        }
      } else {
        setResult({
          success: false,
          output: null,
          error: response.error || 'An error occurred during execution',
          executionTime: 0,
          memoryUsed: 0
        });
      }
    } catch (error: any) {
      let errorMessage = 'Failed to submit code.';
      
      if (error.status === 400) {
        errorMessage = 'Invalid code submission. Please check your syntax.';
      } else if (error.status === 429) {
        errorMessage = 'Too many requests. Please wait a moment before trying again.';
      } else if (error.data?.message) {
        errorMessage = error.data.message;
      } else if (error.status >= 500) {
        errorMessage = 'The code execution server is currently unavailable. Please try again later.';
      }

      console.error('Error submitting code:', error);
      setResult({
        success: false,
        output: null,
        error: errorMessage,
        executionTime: 0,
        memoryUsed: 0
      });
    }
  };

  const [submitCode, { isLoading: isSubmitting }] = useSubmitCodeMutation();
  const [runCode, { isLoading: isRunning }] = useRunCodeMutation();

  return (
    <div className={`code-editor-container border border-gray-200 rounded-lg shadow-lg ${className}`}>
      {/* Toolbar */}
      <div className="flex justify-between items-center px-4 py-2 bg-[#1e1e1e] text-white border-b border-gray-700">
        <div className="flex items-center gap-4">
          {/* Language Selector */}
          <div className="relative">
            <button
              className="flex items-center gap-2 px-3 py-1.5 bg-gray-800 rounded-md text-sm"
              disabled
            >
              <span className="font-medium">
                {LANGUAGES[currentLanguage]?.name || 'Unknown Language'}
              </span>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => navigator.clipboard.writeText(code)}
            className="px-3 py-1.5 bg-gray-800 hover:bg-gray-700 rounded-md text-sm transition-colors"
          >
            Copy
          </button>
          <button
            onClick={() => handleEditorChange(initialCode)}
            className="px-3 py-1.5 bg-gray-800 hover:bg-gray-700 rounded-md text-sm transition-colors"
          >
            Reset
          </button>
          <button
            className={`px-3 py-1.5 rounded-md text-sm transition-colors flex items-center gap-2
              ${isRunning 
                ? 'bg-gray-600 cursor-not-allowed' 
                : 'bg-green-600 hover:bg-green-700'}`}
            onClick={handleRunCode}
            disabled={isRunning || isSubmitting}
          >
            {isRunning ? (
              <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
            ) : (
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            )}
            {isRunning ? 'Running...' : 'Run Code'}
          </button>          <button
            className={`px-3 py-1.5 rounded-md text-sm transition-colors flex items-center gap-2
              ${isSubmitting 
                ? 'bg-gray-600 cursor-not-allowed' 
                : !lessonId
                ? 'bg-gray-600 cursor-not-allowed'
                : 'bg-blue-600 hover:bg-blue-700'}`}
            onClick={handleSubmitCode}
            disabled={isRunning || isSubmitting || !lessonId}
            title={!lessonId ? 'Lesson ID is required for submission' : ''}
          >
            {isSubmitting ? (
              <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
            ) : (
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            )}
            {isSubmitting ? 'Submitting...' : 'Submit Code'}
          </button>
        </div>
      </div>

      {/* Editor */}      
      <Editor
        height={editorHeight}
        defaultLanguage={currentLanguage}
        language={currentLanguage}
        value={code}
        onChange={handleEditorChange}
        theme="vs-dark"
        options={{
          minimap: { enabled: false },
          fontSize: 14,
          lineHeight: 1.6,
          fontFamily: "'Fira Code', 'Consolas', monospace",
          fontLigatures: true,
          scrollBeyondLastLine: false,
          automaticLayout: true,
          tabSize: 2,
          wordWrap: 'on',
          renderLineHighlight: 'all',
          padding: { top: 12, bottom: 12 },
          lineNumbers: 'on',
          matchBrackets: 'always',
          autoClosingBrackets: 'always',
          autoClosingQuotes: 'always',
          formatOnPaste: true,
          formatOnType: true,
          suggestOnTriggerCharacters: true,
          acceptSuggestionOnEnter: 'on',
          rulers: [80],
          bracketPairColorization: {
            enabled: true
          }
        }}
      />      {/* User Input Panel */}
      <div className="border-t border-gray-700 bg-[#1e1e1e] p-4">
        <label className="block text-sm text-gray-400 mb-2">
          Input (Optional):
        </label>
        <textarea
          value={userInput}
          onChange={(e) => setUserInput(e.target.value)}
          className="w-full p-3 bg-gray-800 rounded-md text-sm text-white focus:ring-2 focus:ring-blue-600 focus:outline-none resize-y min-h-[60px] max-h-[150px]"
          placeholder="Enter your input here..."
        />
        <p className="mt-1 text-xs text-gray-400">
          Input will be passed to your program as stdin. For multiple inputs, enter each value on a new line.
        </p>
      </div>      {/* Result Panel */}
      {result && (
        <div className={`border-t border-gray-700 bg-[#1e1e1e] text-white p-4 max-h-none ${
          result.success ? 'bg-opacity-90' : 'bg-opacity-95'
        }`}>
          <div className="flex items-center justify-between mb-2">
            <h3 className={`font-medium ${
              result.success ? 'text-green-400' : 
              (result.testCasesPassed !== null && result.testCasesPassed !== undefined && 
               result.totalTestCases !== null && result.totalTestCases !== undefined && 
               result.testCasesPassed < result.totalTestCases) ? 'text-yellow-400' : 'text-red-400'
            }`}>
              {result.success 
                ? 'Execution Successful' 
                : (result.testCasesPassed !== null && result.testCasesPassed !== undefined && 
                   result.totalTestCases !== null && result.totalTestCases !== undefined && 
                   result.testCasesPassed < result.totalTestCases)
                  ? `Tests Partially Passed (${result.testCasesPassed}/${result.totalTestCases})` 
                  : (result.error ? 'Execution Failed' : 'Execution Completed with Issues')}
            </h3>
            {result.executionTime !== undefined && (
              <div className="text-sm text-gray-400">
                Time: {result.executionTime}ms | Memory: {result.memoryUsed}KB
              </div>
            )}
          </div>{result.error && result.error !== '' && result.error !== 'null' ? (
            <div className="bg-red-900 bg-opacity-20 p-3 rounded-md text-red-300 text-sm whitespace-pre-wrap break-words max-h-none">
              {result.error}
            </div>
          ) : (
            <div className="bg-gray-900 bg-opacity-50 p-3 rounded-md text-gray-300 text-sm whitespace-pre-wrap break-words max-h-none">
              {result.output || 'No output'}
            </div>
          )}

          {(result.testCasesPassed !== undefined && result.testCasesPassed !== null && 
            result.totalTestCases !== undefined && result.totalTestCases !== null) && (
            <div className="mt-2 text-sm">
              <span className={result.testCasesPassed === result.totalTestCases ? 'text-green-400' : 'text-yellow-400'}>
                Passed {result.testCasesPassed}/{result.totalTestCases} test cases
              </span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
