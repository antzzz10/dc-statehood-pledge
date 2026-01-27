import { Link } from 'react-router-dom'
import { useState, useMemo } from 'react'
import './App.css'
import candidatesData from './data/candidates.json'

function App() {
  const PRIMARY_DATE = "June 16, 2026";
  const [selectedOffice, setSelectedOffice] = useState("all");
  const [selectedCandidate, setSelectedCandidate] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const openModal = (candidate) => {
    setSelectedCandidate(candidate);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedCandidate(null);
  };

  // Get unique offices for filter
  const offices = useMemo(() => {
    const uniqueOffices = [...new Set(candidatesData.candidates.map(c => c.office))];
    return uniqueOffices.sort();
  }, []);

  // Filter and group candidates
  const filteredCandidates = useMemo(() => {
    if (selectedOffice === "all") {
      return candidatesData.candidates;
    }
    return candidatesData.candidates.filter(c => c.office === selectedOffice);
  }, [selectedOffice]);

  // Group candidates by office
  const groupedCandidates = useMemo(() => {
    const groups = {};
    filteredCandidates.forEach(candidate => {
      if (!groups[candidate.office]) {
        groups[candidate.office] = [];
      }
      groups[candidate.office].push(candidate);
    });
    return groups;
  }, [filteredCandidates]);

  return (
    <div className="app">
      {/* Candidate Banner */}
      <div className="candidate-banner">
        <div className="container">
          <span className="banner-text">
            🎯 Are you a candidate?
          </span>
          <Link to="/respond" className="banner-link">
            Complete the questionnaire →
          </Link>
        </div>
      </div>

      {/* Hero Section */}
      <section className="hero">
        <div className="container">
          <div className="hero-badge">DC Elections 2026</div>
          <h1 className="hero-title">
            DC Candidate <span className="highlight">Statehood Tracker</span>
          </h1>
          <p className="hero-subtitle">
            With Congress threatening Home Rule, DC needs leaders who will fight back.
          </p>
          <p className="hero-description">
            Compare June 2026 primary candidates' positions on statehood, their commitment to defending Home Rule, and their plans to resist Congressional interference.
          </p>
        </div>
      </section>

      {/* Why This Matters */}
      <section className="about">
        <div className="container">
          <h2>Why This Matters</h2>
          <p className="lead">
            In the past year, Congress blocked $1.1 billion of DC's budget, passed bills to
            eliminate traffic cameras, overturned criminal justice reforms, and introduced
            74+ bills undermining DC autonomy.
          </p>
          <p>
            <strong>Before you vote in the {PRIMARY_DATE} primary, see where candidates stand on defending home rule and fighting for statehood.</strong>
          </p>
        </div>
      </section>

      {/* Results Preview */}
      <section className="results-preview">
        <div className="container">
          <h2>Candidate Responses — Updated as They Come In</h2>
          <p className="section-intro">
            Showing {filteredCandidates.length} of {candidatesData.candidates.length} candidates. Filter by office to narrow down the list.
          </p>

          {/* Office Filter */}
          <div className="filter-container">
            <label htmlFor="office-filter" className="filter-label">Filter by Office:</label>
            <select
              id="office-filter"
              className="office-filter"
              value={selectedOffice}
              onChange={(e) => setSelectedOffice(e.target.value)}
            >
              <option value="all">All Offices ({candidatesData.candidates.length})</option>
              {offices.map(office => {
                const count = candidatesData.candidates.filter(c => c.office === office).length;
                return <option key={office} value={office}>{office} ({count})</option>;
              })}
            </select>
          </div>

          <div className="table-container">
            <table className="results-table">
              <thead>
                <tr>
                  <th>Candidate Name</th>
                  <th>Party</th>
                  {selectedOffice === "all" && <th>Office</th>}
                  <th>Responded?</th>
                  <th>Supports Statehood?</th>
                  <th>Full Response</th>
                </tr>
              </thead>
              <tbody>
                {Object.entries(groupedCandidates).map(([office, candidates]) => (
                  candidates.map((candidate, index) => (
                    <tr key={`${candidate.name}-${candidate.office}`} className={`sample-row ${candidate.responded ? 'responded' : 'no-response'}`}>
                      <td><strong>{candidate.name}</strong></td>
                      <td>
                        <span className={`party-badge ${candidate.party.toLowerCase().replace(' ', '-')}`}>
                          {candidate.party.charAt(0)}
                        </span>
                      </td>
                      {selectedOffice === "all" && <td>{candidate.office}</td>}
                      <td>
                        <span className={`status-badge ${candidate.responded ? 'responded' : 'no-response'}`}>
                          {candidate.responded ? '✓ Yes' : '✗ No Response'}
                        </span>
                      </td>
                      <td>{candidate.supportsStatehood || '—'}</td>
                      <td>
                        {candidate.responded ? (
                          <button
                            className="view-response-btn"
                            onClick={() => openModal(candidate)}
                          >
                            View Response
                          </button>
                        ) : (
                          <span className="not-available">—</span>
                        )}
                      </td>
                    </tr>
                  ))
                ))}
              </tbody>
            </table>
          </div>

          <p className="table-note">
            <strong>Note:</strong> Responses will be published on a rolling basis as candidates complete the questionnaire. Last updated: {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}.
          </p>
        </div>
      </section>

      {/* Response Modal */}
      {isModalOpen && selectedCandidate && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close" onClick={closeModal}>&times;</button>
            <h2 className="modal-title">{selectedCandidate.name}</h2>
            <p className="modal-subtitle">
              {selectedCandidate.office} • {selectedCandidate.party}
            </p>

            <div className="modal-body">
              <div className="question-block">
                <h3 className="question">1. Do you support DC Statehood?</h3>
                <p className="answer">{selectedCandidate.responses?.statehoodSupport || 'No response provided'}</p>
              </div>

              <div className="question-block">
                <h3 className="question">2. What are the top three actions you are most proud of having already taken for Statehood over the last two years?</h3>
                <p className="answer">{selectedCandidate.responses?.topThreeActions || 'No response provided'}</p>
              </div>

              <div className="question-block">
                <h3 className="question">3. What specific actions do you intend to take to promote DC Statehood and protect Home Rule, as a DC elected official?</h3>
                <p className="answer">{selectedCandidate.responses?.intendedActions || 'No response provided'}</p>
              </div>

              <div className="question-block">
                <h3 className="question">4. If elected, how will you respond when Congress attempts to overturn DC laws or block DC's budget? Please name at least one specific action you would take.</h3>
                <p className="answer">{selectedCandidate.responses?.congressResponse || 'No response provided'}</p>
              </div>

              <div className="question-block">
                <h3 className="question">5. Name the top 2-3 partners you intend to work with in promoting Statehood, and what your relationship is with those partners today.</h3>
                <p className="answer">{selectedCandidate.responses?.partners || 'No response provided'}</p>
              </div>

              <div className="question-block">
                <h3 className="question">6. How do you intend to involve DC voters and residents in the fight for Statehood?</h3>
                <p className="answer">{selectedCandidate.responses?.voterInvolvement || 'No response provided'}</p>
              </div>

              <div className="question-block">
                <h3 className="question">7. Is there anything else you would like to share with DC voters about your stance on DC Statehood?</h3>
                <p className="answer">{selectedCandidate.responses?.additionalComments || 'No response provided'}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* About Section */}
      <section className="questionnaire-info">
        <div className="container">
          <h2>About This Tracker</h2>
          <div className="cta-box">
            <p style={{ marginBottom: '1rem' }}>
              This questionnaire was organized by the DC Democratic Party Statehood Committee
              and sent to all declared candidates regardless of party affiliation.
            </p>
            <p style={{ marginBottom: '1rem' }}>
              Results are published independently on RepresentDC.org to provide non-partisan
              voter information. We believe DC voters deserve to know where every candidate—Democrat,
              Republican, and Statehood Green—stands on statehood, home rule, and congressional interference.
            </p>
            <p style={{ fontSize: '0.9rem', color: '#666' }}>
              Questions or feedback? Contact: <a href="mailto:info@representdc.org" style={{ color: '#DC143C' }}>info@representdc.org</a>
            </p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="footer">
        <div className="container">
          <div className="footer-content">
            <div className="footer-section">
              <h3>Contact</h3>
              <ul>
                <li><a href="mailto:info@representdc.org">Contact RepresentDC</a></li>
                <li><a href="mailto:statehood@dcdemocraticparty.org">Contact DC Dems Statehood Committee</a></li>
              </ul>
            </div>
            <div className="footer-section">
              <h3>For Candidates</h3>
              <ul>
                <li><Link to="/respond">Complete Questionnaire</Link></li>
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

export default App
