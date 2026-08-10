import { Link } from 'react-router-dom'
import { useState, useMemo } from 'react'
import './App.css'
import ResponseModal from './components/ResponseModal.jsx'
import candidatesData from './data/candidates.json'
import resultsData from './data/post-primary-results.json'

function PostPrimaryArchive() {
  const [selectedCandidate, setSelectedCandidate] = useState(null)

  const archivedByOffice = useMemo(() => {
    const raceOffices = new Set(resultsData.races.map((r) => r.office))
    const winnerIds = new Set(resultsData.races.map((r) => r.winnerId))

    const archived = candidatesData.candidates.filter(
      (c) => raceOffices.has(c.office) && c.responded && !winnerIds.has(c.id)
    )

    const groups = {}
    archived.forEach((c) => {
      if (!groups[c.office]) groups[c.office] = []
      groups[c.office].push(c)
    })
    return groups
  }, [])

  return (
    <div className="app">
      <section className="hero">
        <div className="container">
          <div className="hero-badge">Also Responded</div>
          <h1 className="hero-title">
            Other Responses from <span className="highlight">DC Leaders</span>
          </h1>
          <p className="hero-subtitle">
            Every response to our statehood questionnaire stays on the record.
          </p>
          <p className="hero-description">
            These candidates ran in the 2026 DC primary. While they weren't successful this time,
            we applaud their commitment to statehood — their responses remain here so residents
            can keep engaging with them on their statehood work.
          </p>
        </div>
      </section>

      <section className="results-preview">
        <div className="container">
          <p className="table-note" style={{ marginBottom: '2rem' }}>
            <Link to="/" style={{ color: '#DC143C', fontWeight: 600 }}>
              ← Back to results
            </Link>
          </p>

          {Object.entries(archivedByOffice).map(([office, candidates]) => (
            <div key={office} style={{ marginBottom: '2.5rem' }}>
              <h2 style={{ fontSize: '1.3rem', color: '#DC143C', marginBottom: '1rem' }}>{office}</h2>
              <div className="cards-container" style={{ display: 'grid' }}>
                {candidates.map((candidate) => (
                  <div
                    key={candidate.id}
                    className="candidate-card responded clickable"
                    onClick={() => setSelectedCandidate(candidate)}
                  >
                    <div className="candidate-card-header">
                      <div className="candidate-name-row">
                        <strong className="candidate-name">{candidate.name}</strong>
                      </div>
                      <div className="candidate-badges">
                        <span className={`party-badge ${candidate.party.toLowerCase().replace(' ', '-')}`}>
                          {candidate.party.charAt(0)}
                        </span>
                      </div>
                    </div>
                    <div className="candidate-card-body">
                      <div className="candidate-info-row">
                        <span className="info-label">Statehood:</span>
                        <span className="info-value">{candidate.supportsStatehood || '—'}</span>
                      </div>
                      <span className="view-response-indicator">View response →</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      <ResponseModal candidate={selectedCandidate} onClose={() => setSelectedCandidate(null)} />

      <footer className="footer">
        <div className="container">
          <div className="footer-content">
            <div className="footer-section">
              <h3>Contact</h3>
              <ul>
                <li><a href="mailto:info@representdc.org">Contact RepresentDC</a></li>
              </ul>
            </div>
            <div className="footer-section">
              <h3>More</h3>
              <ul>
                <li><Link to="/">Back to Results Summary</Link></li>
                <li><Link to="/2026/primary">Full 2026 Primary Candidate List</Link></li>
                <li><Link to="/party">DC Democratic Party Positions</Link></li>
              </ul>
            </div>
            <div className="footer-section">
              <h3>Represent DC Tools</h3>
              <ul>
                <li><a href="https://www.representdc.org">Main Site</a></li>
                <li><a href="https://billtracker.representdc.org">Bill Tracker</a></li>
              </ul>
            </div>
          </div>
          <div className="footer-bottom">
            <p>&copy; 2026 Represent DC. All rights reserved.</p>
            <p className="footer-disclaimer">
              Independent voter information project. Not affiliated with any campaign or organization.
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}

export default PostPrimaryArchive
