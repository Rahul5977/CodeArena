import { useState, useEffect } from 'react'
import { useParams, Link as RouterLink } from 'react-router-dom'
import { FiArrowLeft, FiPlay } from 'react-icons/fi'
import Editor from '@monaco-editor/react'
import api from '../../utils/api'
import { useToastContext } from '../../contexts/ToastContext'

const ContestSubmit = () => {
  const { contestId, problemId } = useParams()
  const [problem, setProblem] = useState(null)
  const [contest, setContest] = useState(null)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [code, setCode] = useState('')
  const [language, setLanguage] = useState('PYTHON')
  const { showError, showSuccess } = useToastContext()

  const languages = {
    PYTHON: { id: 71, name: 'Python', template: '# Write your solution here\ndef solution():\n    pass' },
    JAVASCRIPT: { id: 63, name: 'JavaScript', template: '// Write your solution here\nfunction solution() {\n    \n}' },
    JAVA: { id: 62, name: 'Java', template: 'public class Solution {\n    public void solution() {\n        \n    }\n}' }
  }

  const fetchData = async () => {
    try {
      setLoading(true)
      const [contestResponse, problemResponse] = await Promise.all([
        api.get(`/contests/${contestId}`),
        api.get(`/contests/${contestId}/problems/${problemId}`)
      ])
      
      if (contestResponse.data.success && problemResponse.data.success) {
        setContest(contestResponse.data.contest)
        setProblem(problemResponse.data.problem)
        setCode(languages[language].template)
      }
    } catch (error) {
      showError('Error', 'Failed to fetch problem details')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [contestId, problemId])

  useEffect(() => {
    if (problem) {
      setCode(languages[language].template)
    }
  }, [language, problem])

  const handleSubmit = async () => {
    if (!code.trim()) {
      showError('Error', 'Please write some code before submitting')
      return
    }

    try {
      setSubmitting(true)
      const response = await api.post(`/contests/${contestId}/problems/${problemId}/submit`, {
        source_code: code,
        language_id: languages[language].id
      })

      if (response.data.success) {
        showSuccess('Success!', 'Solution submitted successfully!')
      }
    } catch (error) {
      showError('Error', 'Failed to submit solution')
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-96">
        <span className="loading loading-spinner loading-lg"></span>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <RouterLink
        to={`/contests/${contestId}`}
        className="btn btn-ghost btn-sm"
      >
        <FiArrowLeft className="mr-2" />
        Back to Contest
      </RouterLink>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Problem Description */}
        <div className="card bg-base-100 shadow-xl">
          <div className="card-header p-6 pb-0">
            <h1 className="text-xl font-bold">{problem?.title}</h1>
          </div>
          <div className="card-body">
            <p className="mb-4">{problem?.description}</p>
            
            {problem?.examples && (
              <div className="mb-4">
                <h3 className="font-bold mb-2">Examples:</h3>
                {Object.entries(problem.examples).map(([lang, example]) => (
                  <div key={lang} className="mb-3 p-3 bg-base-200 rounded-lg">
                    <div className="mockup-code text-sm">
                      <pre><code>Input: {example.input}</code></pre>
                      <pre><code>Output: {example.output}</code></pre>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Code Editor */}
        <div className="card bg-base-100 shadow-xl">
          <div className="card-header p-6 pb-0">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-bold">Solution</h2>
              <div className="flex items-center gap-4">
                <select 
                  className="select select-bordered select-sm"
                  value={language} 
                  onChange={(e) => setLanguage(e.target.value)}
                >
                  {Object.entries(languages).map(([key, lang]) => (
                    <option key={key} value={key}>{lang.name}</option>
                  ))}
                </select>
                <button
                  className={`btn btn-primary btn-sm ${submitting ? 'loading' : ''}`}
                  onClick={handleSubmit}
                  disabled={submitting}
                >
                  {submitting ? (
                    'Submitting...'
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
      </div>
    </div>
  )
}

export default ContestSubmit