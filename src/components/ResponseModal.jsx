import { useState } from 'react'

const QUESTIONS = [
  ['1. Do you support DC Statehood?', 'statehoodSupport'],
  ['2. What are the top three actions you are most proud of having already taken for Statehood over the last two years?', 'topThreeActions'],
  ['3. What specific actions do you intend to take to promote DC Statehood and protect Home Rule, as a DC elected official?', 'intendedActions'],
  ["4. If elected, how will you respond when Congress attempts to overturn DC laws or block DC's budget? Please name at least one specific action you would take.", 'congressResponse'],
  ['5. Name the top 2-3 partners you intend to work with in promoting Statehood, and what your relationship is with those partners today.', 'partners'],
  ['6. How do you intend to involve DC voters and residents in the fight for Statehood?', 'voterInvolvement'],
  ['7. Is there anything else you would like to share with DC voters about your stance on DC Statehood?', 'additionalComments'],
]

function ResponseModal({ candidate, onClose }) {
  const [copied, setCopied] = useState(false)

  if (!candidate) return null

  const copyLink = () => {
    navigator.clipboard.writeText(window.location.href).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    })
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose}>&times;</button>
        <h2 className="modal-title">{candidate.name}</h2>
        <p className="modal-subtitle">
          {candidate.office} • {candidate.party}
        </p>
        <button className="copy-link-btn" onClick={copyLink} title="Copy link to this response">
          {copied ? '✓ Copied!' : '🔗 Copy link'}
        </button>

        <div className="modal-body">
          {QUESTIONS.map(([question, field]) => (
            <div className="question-block" key={field}>
              <h3 className="question">{question}</h3>
              <p className="answer">{candidate.responses?.[field] || 'No response provided'}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default ResponseModal
