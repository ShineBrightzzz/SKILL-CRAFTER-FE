'use client'

import { useState } from 'react';
import Editor from '@monaco-editor/react';
import { useSubmitCodeMutation, LANGUAGE_IDS } from '@/services/codesubmit.service';

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
  onCodeChange?: (code: string) => void;
}

export default function CodeEditor({ 
  initialCode = '', 
  language = 'javascript',
  className = '',
  lessonId = '',
  onCodeChange
}: CodeEditorProps) {
  const [code, setCode] = useState(initialCode);
  const [selectedLanguage, setSelectedLanguage] = useState(language);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [submitCode, { isLoading }] = useSubmitCodeMutation();
  const [result, setResult] = useState<{
    success?: boolean;
    output?: string;
    error?: string;
    executionTime?: number;
    memoryUsed?: number;
    testCasesPassed?: number;
    totalTestCases?: number;
  } | null>(null);

  const handleEditorChange = (value: string = '') => {
    setCode(value);
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
      console.log('Code:', code);      const response = await submitCode({
        language_id: languageId,
        source_code: code
      }).unwrap();

      console.log('Response:', response);
      
      if (response.statusCode === 200) {
        setResult({
          success: response.data.success,
          output: response.data.output,
          error: response.data.error === 'null' ? null : response.data.error,
          executionTime: response.data.executionTime,
          memoryUsed: response.data.memoryUsed,
          testCasesPassed: response.data.testCasesPassed,
          totalTestCases: response.data.totalTestCases
        });
      } else {
        setResult({
          success: false,
          error: response.error || 'An error occurred during execution',
          executionTime: 0,
          memoryUsed: 0
        });
      }} catch (error: any) {
      let errorMessage = 'Failed to execute code.';
      
      // Xử lý các loại lỗi từ API
      if (error.status === 400) {
        errorMessage = 'Invalid code submission. Please check your syntax.';
      } else if (error.status === 429) {
        errorMessage = 'Too many requests. Please wait a moment before trying again.';
      } else if (error.data?.message) {
        errorMessage = error.data.message;
      } else if (error.status >= 500) {
        errorMessage = 'The code execution server is currently unavailable. Please try again later.';
      }

      setResult({
        success: false,
        error: errorMessage
      });
    }
  };

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
              ${isLoading 
                ? 'bg-gray-600 cursor-not-allowed' 
                : 'bg-green-600 hover:bg-green-700'}`}
            onClick={handleRunCode}
            disabled={isLoading}
          >
            {isLoading ? (
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
            {isLoading ? 'Running...' : 'Run'}
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
      />

      {/* Result Panel */}
      {result && (
        <div className={`border-t border-gray-700 bg-[#1e1e1e] text-white p-4 ${
          result.success ? 'bg-opacity-90' : 'bg-opacity-95'
        }`}>
          <div className="flex items-center justify-between mb-2">
            <h3 className={`font-medium ${
              result.success ? 'text-green-400' : 'text-red-400'
            }`}>
              {result.success ? 'Execution Successful' : 'Execution Failed'}
            </h3>
            {result.executionTime && (
              <div className="text-sm text-gray-400">
                Time: {result.executionTime}ms | Memory: {result.memoryUsed}KB
              </div>
            )}
          </div>
          
          {result.error ? (
            <pre className="bg-red-900 bg-opacity-20 p-3 rounded-md text-red-300 text-sm overflow-auto">
              {result.error}
            </pre>
          ) : (
            <pre className="bg-gray-900 bg-opacity-50 p-3 rounded-md text-gray-300 text-sm overflow-auto">
              {result.output || 'No output'}
            </pre>
          )}

          {(result.testCasesPassed !== undefined && result.totalTestCases !== undefined) && (
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
