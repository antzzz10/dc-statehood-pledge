import { Link } from 'react-router-dom'
import { useState, useMemo } from 'react'
import './App.css'
import ResponseModal from './components/ResponseModal.jsx'
import candidatesData from './data/candidates.json'
import resultsData from './data/post-primary-results.json'

function PostPrimaryResults() {
  const [selectedCandidate, setSelectedCandidate] = useState(null)

  const { races, bannerCopy, boeResultsUrl } = resultsData

  const respondedCount = useMemo(() => races.filter((r) => r.responded).length, [races])

  const openResponse = (winnerId) => {
    const candidate = candidatesData.candidates.find((c) => c.id === winnerId)
    if (candidate) setSelectedCandidate(candidate)
  }

  return (
    <div className="app">
      {/* Congratulatory Banner */}
      <section className="hero hero-compact">
        <div className="container">
          <div className="hero-badge">2026 Primary Results</div>
          <h1 className="hero-title">{bannerCopy.heading}</h1>
          {bannerCopy.paragraphs.map((p, i) => (
            <p key={i} className="hero-description">{p}</p>
          ))}
        </div>
      </section>

      {/* Winners List */}
      <section className="results-preview results-compact">
        <div className="container">
          <details className="faq-item" style={{ maxWidth: '800px', margin: '0 auto 1.5rem' }}>
            <summary>About the Candidate Questionnaire</summary>
            <div className="faq-answer">
              <p>
                This page exists so every candidate for DC public office makes a public commitment
                to statehood before taking office. That record lets constituents follow up with
                elected officials on the specific statehood actions they proposed while running.
              </p>
            </div>
          </details>

          <p className="section-intro">
            <strong>{respondedCount} of {races.length}</strong> winners ({Math.round((respondedCount / races.length) * 100)}%) responded.
            See other responses in our{' '}
            <Link to="/archive" style={{ color: '#DC143C', fontWeight: 600 }}>
              response archive →
            </Link>
            , or browse the full{' '}
            <Link to="/2026/primary" style={{ color: '#DC143C', fontWeight: 600 }}>
              2026 primary candidate list →
            </Link>
          </p>

          <div className="cards-container" style={{ display: 'grid', gap: '1rem' }}>
            {races.map((race) => (
              <div
                key={race.office}
                className={`candidate-card ${race.responded ? 'responded' : 'no-response'}`}
              >
                <div className="candidate-card-header">
                  <div className="candidate-name-row">
                    <strong className="candidate-name">{race.winnerName}</strong>
                  </div>
                  <span className={`status-badge ${race.responded ? 'responded' : 'no-response'}`}>
                    {race.responded ? '✓ Responded' : '— Did not respond'}
                  </span>
                </div>
                <p style={{ margin: '0.4rem 0', fontSize: '0.9rem', color: '#6b7280' }}>
                  {race.label}
                  {race.note && ` — ${race.note}`}
                </p>

                {race.quote && (
                  <blockquote
                    style={{
                      borderLeft: '3px solid #DC143C',
                      margin: '0.6rem 0',
                      padding: '0.4rem 0 0.4rem 1rem',
                      fontStyle: 'italic',
                      color: '#374151',
                    }}
                  >
                    "{race.quote}"
                  </blockquote>
                )}

                {!race.responded && (
                  <p style={{ margin: '0.6rem 0', fontSize: '0.9rem', color: '#374151' }}>
                    {race.winnerName} hasn't answered our statehood questionnaire yet. If you're a
                    constituent, ask them to fill it out.
                  </p>
                )}

                <div className="candidate-card-body">
                  {race.responded ? (
                    <button className="view-response-btn" onClick={() => openResponse(race.winnerId)}>
                      Read full response
                    </button>
                  ) : (
                    <Link
                      to="/respond"
                      className="view-response-btn"
                      style={{ textDecoration: 'none', display: 'inline-block' }}
                    >
                      Ask {race.winnerName} to respond →
                    </Link>
                  )}
                  <a
                    href={boeResultsUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="view-response-indicator"
                  >
                    Official BOE results →
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <ResponseModal candidate={selectedCandidate} onClose={() => setSelectedCandidate(null)} />

      {/* Footer */}
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
                <li><Link to="/archive">Other Responses from DC Leaders</Link></li>
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

export default PostPrimaryResults
