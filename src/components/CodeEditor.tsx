'use client'

import { useState, useEffect } from 'react';
import Editor from '@monaco-editor/react';
import { useSubmitCodeMutation, useRunCodeMutation, LANGUAGE_IDS } from '@/services/codesubmit.service';
import { useUserCode } from '@/store/hooks';

const LANGUAGES = [
  { id: 'javascript', name: 'JavaScript', icon: 'js' },
  { id: 'typescript', name: 'TypeScript', icon: 'ts' },
  { id: 'python', name: 'Python', icon: 'py' },
  { id: 'java', name: 'Java', icon: 'java' },
  { id: 'cpp', name: 'C++', icon: 'cpp' },
  { id: 'csharp', name: 'C#', icon: 'cs' },
  { id: 'go', name: 'Go', icon: 'go' },
  { id: 'rust', name: 'Rust', icon: 'rs' },
];

interface CodeEditorProps {
  initialCode?: string;
  language?: string;
  className?: string;
  lessonId?: string;
  userId?: string;
  onCodeChange?: (code: string) => void;
  onComplete?: () => void | Promise<void>;
  useReduxStore?: boolean;
}

export default function CodeEditor({ 
  initialCode = '', 
  language = 'javascript',
  className = '',
  lessonId = '',
  userId = '',
  onCodeChange,
  onComplete,
  useReduxStore = false
}: CodeEditorProps) {
  // If useReduxStore is true, use Redux hook for code state
  const reduxCodeHook = useReduxStore && lessonId ? useUserCode(lessonId) : null;
  
  // Initialize state either from Redux or from props
  const [code, setCode] = useState(
    reduxCodeHook?.code || initialCode
  );  const [selectedLanguage, setSelectedLanguage] = useState(language);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [submitCode, { isLoading: isSubmitting }] = useSubmitCodeMutation();
  const [runCode, { isLoading: isRunning }] = useRunCodeMutation();    const [result, setResult] = useState<{
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

  const handleLanguageChange = (langId: string) => {
    setSelectedLanguage(langId);
    setIsDropdownOpen(false);
    setResult(null);
  };

    const handleRunCode = async () => {
    try {
      const languageId = LANGUAGE_IDS[selectedLanguage as keyof typeof LANGUAGE_IDS];   
      console.log('Language ID:', languageId);
      console.log('Code:', code);
        const response = await runCode({
        language_id: languageId,
        source_code: code
      }).unwrap();      console.log('Run Response:', response);
      console.log('Response success:', response.success);
      console.log('Response data success:', response.data.success);
      console.log('Response data error:', response.data.error);
        if (response.success) {
        // If the overall response is successful, we should display a success message
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
        
        console.log('Setting result to:', resultObject);
        setResult(resultObject);
      } else {
        setResult({
          success: false,
          output: null,
          error: response.error || 'An error occurred during execution',
          executionTime: 0,
          memoryUsed: 0
        });
      }    } catch (error: any) {
      let errorMessage = 'Failed to execute code.';
      
      // Handle API error types
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
  };
  const handleSubmitCode = async () => {
    try {
      const languageId = LANGUAGE_IDS[selectedLanguage as keyof typeof LANGUAGE_IDS];
      console.log('Language ID:', languageId);
      console.log('Code:', code);
      console.log('Lesson ID:', lessonId);
      console.log('User ID:', userId);

      const response = await submitCode({
        language_id: languageId,
        source_code: code,
        lessonId: lessonId,
        userId: userId
      }).unwrap();

      console.log('Submit Response:', response);
      console.log('Response success:', response.success);
      console.log('Response data success:', response.data.success);
      console.log('Response data error:', response.data.error);
      
      if (response.success) {
        // For submit code, we might want to show success based on the test case results
        // But preserve the actual test case results for display
        const hasError = response.data.error && response.data.error !== 'null' && response.data.error !== '';
        
        // For submissions, we might want to consider a case where some tests fail
        // as a "successful submission" but with failing tests
        const allTestsPassed = response.data.testCasesPassed === response.data.totalTestCases;
        
        const resultObject = {
          // We consider it a success if there's no error and all tests pass (if tests exist)
          // If tests don't exist, just check for errors
          success: !hasError && (response.data.testCasesPassed === null || allTestsPassed), 
          output: response.data.output,
          error: hasError ? response.data.error : null,
          executionTime: response.data.executionTime,
          memoryUsed: response.data.memoryUsed,
          testCasesPassed: response.data.testCasesPassed,
          totalTestCases: response.data.totalTestCases
        };

        console.log('Setting result to:', resultObject);
        setResult(resultObject);

        // If all test cases pass, trigger onComplete callback
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
      }    } catch (error: any) {
      let errorMessage = 'Failed to submit code.';
      
      // Handle API error types
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
  console.log('Result:', result);
  return (
    <div className={`code-editor-container border border-gray-200 rounded-lg shadow-lg ${className}`}>
      {/* Toolbar */}
      <div className="flex justify-between items-center px-4 py-2 bg-[#1e1e1e] text-white border-b border-gray-700">
        <div className="flex items-center gap-4">
          {/* Language Selector */}
          <div className="relative">
            <button
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className="flex items-center gap-2 px-3 py-1.5 bg-gray-800 hover:bg-gray-700 rounded-md text-sm transition-colors"
            >
              <span className="font-medium">
                {LANGUAGES.find(l => l.id === selectedLanguage)?.name || 'Select Language'}
              </span>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            {isDropdownOpen && (
              <div className="absolute top-full left-0 mt-1 w-48 bg-gray-800 rounded-md shadow-lg z-10">
                <ul className="py-1">
                  {LANGUAGES.map(lang => (
                    <li key={lang.id}>
                      <button
                        onClick={() => handleLanguageChange(lang.id)}
                        className={`w-full px-4 py-2 text-sm text-left hover:bg-gray-700 ${
                          selectedLanguage === lang.id ? 'bg-gray-700' : ''
                        }`}
                      >
                        {lang.name}
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>        <div className="flex items-center gap-2">
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
          </button>
          <button
            className={`px-3 py-1.5 rounded-md text-sm transition-colors flex items-center gap-2
              ${isSubmitting 
                ? 'bg-gray-600 cursor-not-allowed' 
                : 'bg-blue-600 hover:bg-blue-700'}`}
            onClick={handleSubmitCode}
            disabled={isRunning || isSubmitting}
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
        height="500px"
        defaultLanguage={selectedLanguage}
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
      />      {/* Result Panel */}
      {result && (
        <div className={`border-t border-gray-700 bg-[#1e1e1e] text-white p-4 ${
          result.success ? 'bg-opacity-90' : 'bg-opacity-95'
        }`}>
          <div className="flex items-center justify-between mb-2">            <h3 className={`font-medium ${
              result.success ? 'text-green-400' : 
              (result.testCasesPassed !== null && result.testCasesPassed !== undefined && 
               result.totalTestCases !== null && result.totalTestCases !== undefined && 
               result.testCasesPassed < result.totalTestCases) ? 'text-yellow-400' : 'text-red-400'
            }`}>              {result.success 
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
          </div>
            {result.error && result.error !== '' && result.error !== 'null' ? (
            <pre className="bg-red-900 bg-opacity-20 p-3 rounded-md text-red-300 text-sm overflow-auto">
              {result.error}
            </pre>
          ) : (
            <pre className="bg-gray-900 bg-opacity-50 p-3 rounded-md text-gray-300 text-sm overflow-auto">
              {result.output || 'No output'}
            </pre>
          )}          {(result.testCasesPassed !== undefined && result.testCasesPassed !== null && 
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
