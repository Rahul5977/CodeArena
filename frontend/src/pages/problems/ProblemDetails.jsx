import { useState, useEffect } from 'react'
import { useParams, Link as RouterLink } from 'react-router-dom'
import { FiArrowLeft, FiPlay } from 'react-icons/fi'
import Editor from '@monaco-editor/react'
import api from '../../utils/api'
import { useToastContext } from '../../contexts/ToastContext'

const ProblemDetail = () => {
  const { id } = useParams()
  const [problem, setProblem] = useState(null)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [code, setCode] = useState('')
  const [language, setLanguage] = useState('PYTHON')
  const [results, setResults] = useState(null)
  const [aiReview, setAiReview] = useState('')
  const [isReviewOpen, setIsReviewOpen] = useState(false)
  const { showError, showSuccess } = useToastContext()

  const languages = {
    PYTHON: {
      id: 71,
      name: 'Python',
      template: '# Write your solution here\ndef solution():\n    pass'
    },
    JAVASCRIPT: {
      id: 63,
      name: 'JavaScript',
      template: '// Write your solution here\nfunction solution() {\n    \n}'
    },
    JAVA: {
      id: 62,
      name: 'Java',
      template: 'public class Solution {\n    public void solution() {\n        \n    }\n}'
    }
  }

  const fetchProblem = async () => {
    try {
      setLoading(true)
      const response = await api.get(`/problems/get-all-problems/${id}`)
      if (response.data.success) {
        setProblem(response.data.problem)
        const template = response.data.problem.codeSnippets?.[language] || languages[language].template
        setCode(template)
      }
    } catch (error) {
      showError('Error', 'Failed to fetch problem details')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchProblem()
  }, [id])

  useEffect(() => {
    if (problem) {
      const template = problem.codeSnippets?.[language] || languages[language].template
      setCode(template)
    }
  }, [language, problem])

  const handleSubmit = async () => {
    if (!code.trim()) {
      showError('Error', 'Please write some code before submitting')
      return
    }

    try {
      setSubmitting(true)
      const testCases = problem.testcases
      const stdin = testCases.map(tc => tc.input)
      const expectedOutputs = testCases.map(tc => tc.output)

      const response = await api.post('/execute-code/', {
        source_code: code,
        language_id: languages[language].id,
        stdin,
        expected_outputs: expectedOutputs,
        problemId: id
      })

      if (response.data.success) {
        setResults(response.data.submission)
        if (response.data.submission.status === 'Acepted') {
          showSuccess('Success!', 'All test cases passed!')
        } else {
          showError('Some test cases failed', 'Check the results below')
        }
      }
    } catch (error) {
      showError('Error', 'Failed to submit solution')
    } finally {
      setSubmitting(false)
    }
  }

  const handleAiReview = async () => {
    if (!code.trim()) {
      showError('Error', 'Please write some code before requesting review')
      return
    }

    try {
      const response = await api.post('/aiCodeReview/get-code-review', {
        source_code: code
      })
      setAiReview('AI Code Review feature is coming soon!')
      setIsReviewOpen(true)
    } catch (error) {
      showError('Error', 'Failed to get AI review')
    }
  }

  const getDifficultyColor = (difficulty) => {
    switch (difficulty) {
      case 'EASY': return 'badge-success'
      case 'MEDIUM': return 'badge-warning'
      case 'HARD': return 'badge-error'
      default: return 'badge-ghost'
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-96">
        <span className="loading loading-spinner loading-lg"></span>
      </div>
    )
  }

  if (!problem) {
    return (
      <div className="flex flex-col items-center justify-center h-96 space-y-4">
        <p className="text-lg text-base-content/50">Problem not found</p>
        <RouterLink to="/problems" className="btn btn-primary">
          <FiArrowLeft className="mr-2" />
          Back to Problems
        </RouterLink>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <RouterLink
        to="/problems"
        className="btn btn-ghost btn-sm"
      >
        <FiArrowLeft className="mr-2" />
        Back to Problems
      </RouterLink>

      {/* Problem Info */}
      <div className="card bg-base-100 shadow-xl">
        <div className="card-header p-6 pb-0">
          <div className="flex justify-between items-start">
            <div className="space-y-2">
              <h1 className="text-2xl font-bold">{problem.title}</h1>
              <div className="flex items-center gap-4">
                <div className={`badge ${getDifficultyColor(problem.difficulty)}`}>
                  {problem.difficulty}
                </div>
                <div className="flex flex-wrap gap-1">
                  {problem.tags.map((tag) => (
                    <span key={tag} className="badge badge-outline badge-sm">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <div className="card-body">
          <p className="mb-4">{problem.description}</p>
          
          {problem.examples && (
            <div className="mb-4">
              <h3 className="font-bold mb-2">Examples:</h3>
              {Object.entries(problem.examples).map(([lang, example]) => (
                <div key={lang} className="mb-3 p-3 bg-base-200 rounded-lg">
                  <p className="font-semibold text-sm mb-1">{lang}:</p>
                  <div className="mockup-code text-sm">
                    <pre><code>Input: {example.input}</code></pre>
                    <pre><code>Output: {example.output}</code></pre>
                  </div>
                  {example.explanation && (
                    <p className="text-sm text-base-content/60 mt-1">
                      {example.explanation}
                    </p>
                  )}
                </div>
              ))}
            </div>
          )}
          
          <div>
            <h3 className="font-bold mb-1">Constraints:</h3>
            <p className="text-sm text-base-content/60">{problem.constraints}</p>
          </div>
        </div>
      </div>

      {/* Code Editor */}
      <div className="card bg-base-100 shadow-xl">
        <div className="card-header p-6 pb-0">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-bold">Solution</h2>
            <div className="flex items-center gap-4">
              <select 
                className="select select-bordered select-sm max-w-xs"
                value={language} 
                onChange={(e) => setLanguage(e.target.value)}
              >
                {Object.entries(languages).map(([key, lang]) => (
                  <option key={key} value={key}>{lang.name}</option>
                ))}
              </select>
              <button 
                className="btn btn-outline btn-sm"
                onClick={handleAiReview}
              >
                AI Review
              </button>
              <button
                className={`btn btn-primary btn-sm ${submitting ? 'loading' : ''}`}
                onClick={handleSubmit}
                disabled={submitting}
              >
                {submitting ? (
                  'Running...'
                ) : (
                  <>
                    <FiPlay className="mr-2" />
                    Submit
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
        
        <div className="card-body">
          <div className="border border-base-300 rounded-lg overflow-hidden">
            <Editor
              height="400px"
              language={language.toLowerCase()}
              value={code}
              onChange={(value) => setCode(value || '')}
              theme="vs-light"
              options={{
                minimap: { enabled: false },
                fontSize: 14,
                wordWrap: 'on',
                automaticLayout: true
              }}
            />
          </div>
        </div>
      </div>

      {/* Results */}
      {results && (
        <div className="card bg-base-100 shadow-xl">
          <div className="card-header p-6 pb-0">
            <h2 className="text-xl font-bold">Results</h2>
          </div>
          <div className="card-body">
            <div className={`alert ${results.status === 'Acepted' ? 'alert-success' : 'alert-error'} mb-4`}>
              <span>{results.status === 'Acepted' ? 'All test cases passed!' : 'Some test cases failed'}</span>
            </div>
            
            <div className="overflow-x-auto">
              <table className="table table-sm">
                <thead>
                  <tr>
                    <th>Test Case</th>
                    <th>Status</th>
                    <th>Expected</th>
                    <th>Output</th>
                    <th>Time</th>
                    <th>Memory</th>
                  </tr>
                </thead>
                <tbody>
                  {results.testCases?.map((testCase) => (
                    <tr key={testCase.testCase}>
                      <td>{testCase.testCase}</td>
                      <td>
                        <div className={`badge ${testCase.passed ? 'badge-success' : 'badge-error'}`}>
                          {testCase.passed ? 'PASS' : 'FAIL'}
                        </div>
                      </td>
                      <td>
                        <code className="text-xs">{testCase.expected}</code>
                      </td>
                      <td>
                        <code className="text-xs">{testCase.stdout}</code>
                      </td>
                      <td>{testCase.time}</td>
                      <td>{testCase.memory}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* AI Review Modal */}
      {isReviewOpen && (
        <dialog className="modal modal-open">
          <div className="modal-box">
            <h3 className="font-bold text-lg">AI Code Review</h3>
            <div className="py-4">
              <textarea
                className="textarea textarea-bordered w-full h-48"
                value={aiReview}
                readOnly
                placeholder="AI review will appear here..."
              />
            </div>
            <div className="modal-action">
              <button 
                className="btn"
                onClick={() => setIsReviewOpen(false)}
              >
                Close
              </button>
            </div>
          </div>
        </dialog>
      )}
    </div>
  )
}

export default ProblemDetail