import { Link } from 'react-router-dom'
import { useState, useMemo } from 'react'
import './App.css'
import candidatesData from './data/party-candidates.json'

function Party() {
  const PRIMARY_DATE = "June 16, 2026";
  const [selectedOffice, setSelectedOffice] = useState("all");
  const [selectedSlate, setSelectedSlate] = useState("all");
  const [selectedCandidate, setSelectedCandidate] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const slates = ['Free DC Slate', 'Democrats United to Free DC', 'Independent'];

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
    // Custom sort order for party positions
    const order = [
      'National Committeeman', 'National Committeewoman',
      'At-Large Committeeman', 'At-Large Committeewoman',
      'Ward 1 Committeeman', 'Ward 1 Committeewoman',
      'Ward 2 Committeeman', 'Ward 2 Committeewoman',
      'Ward 3 Committeeman', 'Ward 3 Committeewoman',
      'Ward 4 Committeeman', 'Ward 4 Committeewoman',
      'Ward 5 Committeeman', 'Ward 5 Committeewoman',
      'Ward 6 Committeeman', 'Ward 6 Committeewoman',
      'Ward 7 Committeeman', 'Ward 7 Committeewoman',
      'Ward 8 Committeeman', 'Ward 8 Committeewoman'
    ];
    return uniqueOffices.sort((a, b) => order.indexOf(a) - order.indexOf(b));
  }, []);

  // Filter and group candidates
  const filteredCandidates = useMemo(() => {
    return candidatesData.candidates.filter(c => {
      const matchesOffice = selectedOffice === "all" || c.office === selectedOffice;
      const matchesSlate = selectedSlate === "all" || c.slate === selectedSlate;
      return matchesOffice && matchesSlate;
    });
  }, [selectedOffice, selectedSlate]);

  // Group candidates by office
  const groupedCandidates = useMemo(() => {
    const groups = {};
    const order = [
      'National Committeeman', 'National Committeewoman',
      'At-Large Committeeman', 'At-Large Committeewoman',
      'Ward 1 Committeeman', 'Ward 1 Committeewoman',
      'Ward 2 Committeeman', 'Ward 2 Committeewoman',
      'Ward 3 Committeeman', 'Ward 3 Committeewoman',
      'Ward 4 Committeeman', 'Ward 4 Committeewoman',
      'Ward 5 Committeeman', 'Ward 5 Committeewoman',
      'Ward 6 Committeeman', 'Ward 6 Committeewoman',
      'Ward 7 Committeeman', 'Ward 7 Committeewoman',
      'Ward 8 Committeeman', 'Ward 8 Committeewoman'
    ];
    filteredCandidates.forEach(candidate => {
      if (!groups[candidate.office]) {
        groups[candidate.office] = [];
      }
      groups[candidate.office].push(candidate);
    });
    // Sort groups by order
    const sorted = {};
    order.forEach(office => {
      if (groups[office]) {
        sorted[office] = groups[office];
      }
    });
    return sorted;
  }, [filteredCandidates]);

  const getSlateClass = (slate) => {
    if (slate === 'Free DC Slate') return 'free-dc';
    if (slate === 'Democrats United to Free DC') return 'dems-united';
    return 'independent';
  };

  const getSlateAbbrev = (slate) => {
    if (slate === 'Free DC Slate') return 'FDC';
    if (slate === 'Democrats United to Free DC') return 'DU';
    return 'IND';
  };

  return (
    <div className="app">
      {/* Navigation Banner */}
      <div className="candidate-banner">
        <div className="container">
          <span className="banner-text">
            Also on the ballot: Elected offices
          </span>
          <Link to="/" className="banner-link">
            View Mayor, Council & Delegate candidates →
          </Link>
        </div>
      </div>

      {/* Hero Section */}
      <section className="hero">
        <div className="container">
          <div className="hero-badge">DC Democratic Party Elections 2026</div>
          <h1 className="hero-title">
            DC Dems Committee <span className="highlight">Statehood Tracker</span>
          </h1>
          <p className="hero-subtitle">
            The DC Democratic State Committee sets party priorities and strategy. Their stance on statehood matters.
          </p>
          <p className="hero-description">
            Compare candidates for DC Democratic Party committee positions. These leaders will shape how the party fights for statehood and home rule.
          </p>
        </div>
      </section>

      {/* Why This Matters */}
      <section className="about">
        <div className="container">
          <h2>Why Party Elections Matter</h2>
          <p className="lead">
            The DC Democratic State Committee is the governing body of the DC Democratic Party.
            Committee members vote on party resolutions, endorse candidates, allocate resources,
            and set the strategic direction for Democrats in DC.
          </p>
          <p>
            <strong>With Congress threatening DC autonomy, party leadership that prioritizes statehood
            and home rule is more important than ever.</strong> These positions are elected during the
            {PRIMARY_DATE} primary.
          </p>
          <p style={{ marginTop: '1rem' }}>
            Learn more at <a href="https://www.dcdemocraticparty.org" target="_blank" rel="noopener noreferrer" style={{ color: '#DC143C', fontWeight: 600 }}>dcdemocraticparty.org</a>
          </p>
        </div>
      </section>

      {/* Slate Legend */}
      <section className="slate-legend">
        <div className="container">
          <h3>Candidate Slates</h3>
          <div className="slate-list">
            <div className="slate-item">
              <span className="slate-badge free-dc">FDC</span>
              <span className="slate-name">Free DC Slate</span>
              <span className="slate-count">({candidatesData.candidates.filter(c => c.slate === 'Free DC Slate').length} candidates)</span>
            </div>
            <div className="slate-item">
              <span className="slate-badge dems-united">DU</span>
              <span className="slate-name">Democrats United to Free DC</span>
              <span className="slate-count">({candidatesData.candidates.filter(c => c.slate === 'Democrats United to Free DC').length} candidates)</span>
            </div>
            <div className="slate-item">
              <span className="slate-badge independent">IND</span>
              <span className="slate-name">Independent</span>
              <span className="slate-count">({candidatesData.candidates.filter(c => c.slate === 'Independent').length} candidate)</span>
            </div>
          </div>
        </div>
      </section>

      {/* Results Preview */}
      <section className="results-preview">
        <div className="container">
          <h2>Candidate Responses — Updated as They Come In</h2>
          <p className="section-intro">
            Showing {filteredCandidates.length} of {candidatesData.candidates.length} candidates. Use filters to narrow down the list.
          </p>

          {/* Filters */}
          <div className="filter-row">
            <div className="filter-container">
              <label htmlFor="office-filter" className="filter-label">Position:</label>
              <select
                id="office-filter"
                className="office-filter"
                value={selectedOffice}
                onChange={(e) => setSelectedOffice(e.target.value)}
              >
                <option value="all">All Positions ({candidatesData.candidates.length})</option>
                {offices.map(office => {
                  const count = candidatesData.candidates.filter(c => c.office === office).length;
                  return <option key={office} value={office}>{office} ({count})</option>;
                })}
              </select>
            </div>

            <div className="filter-container">
              <label htmlFor="slate-filter" className="filter-label">Slate:</label>
              <select
                id="slate-filter"
                className="office-filter"
                value={selectedSlate}
                onChange={(e) => setSelectedSlate(e.target.value)}
              >
                <option value="all">All Slates ({candidatesData.candidates.length})</option>
                {slates.map(slate => {
                  const count = candidatesData.candidates.filter(c => c.slate === slate).length;
                  return <option key={slate} value={slate}>{slate} ({count})</option>;
                })}
              </select>
            </div>
          </div>

          <div className="table-container">
            <table className="results-table">
              <thead>
                <tr>
                  <th>Candidate Name</th>
                  <th>Slate</th>
                  {selectedOffice === "all" && <th>Position</th>}
                  <th>Responded?</th>
                  <th>Supports Statehood?</th>
                  <th>Full Response</th>
                </tr>
              </thead>
              <tbody>
                {Object.entries(groupedCandidates).map(([office, candidates]) => (
                  candidates.map((candidate, index) => {
                    const getStatus = () => {
                      if (candidate.responded) return { class: 'responded', label: '✓ Yes' };
                      if (candidate.declined) return { class: 'declined', label: '✗ Declined' };
                      if (candidate.undeliverable) return { class: 'undeliverable', label: '⚠ No Valid Contact' };
                      return { class: 'no-response', label: '— Pending' };
                    };
                    const status = getStatus();
                    return (
                      <tr key={`${candidate.name}-${candidate.office}`} className={`sample-row ${status.class}`}>
                        <td><strong>{candidate.name}</strong></td>
                        <td>
                          <span className={`slate-badge ${getSlateClass(candidate.slate)}`} title={candidate.slate}>
                            {getSlateAbbrev(candidate.slate)}
                          </span>
                        </td>
                        {selectedOffice === "all" && <td>{candidate.office}</td>}
                        <td>
                          <span className={`status-badge ${status.class}`}>
                            {status.label}
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
                    );
                  })
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
              {selectedCandidate.office} • {selectedCandidate.slate}
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
              and sent to all declared candidates for party committee positions.
            </p>
            <p style={{ marginBottom: '1rem' }}>
              Results are published independently on RepresentDC.org to provide
              voter information. We believe DC Democrats deserve to know where party leadership
              candidates stand on statehood, home rule, and congressional interference.
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
              <h3>Also on the Ballot</h3>
              <ul>
                <li><Link to="/">Elected Office Candidates</Link></li>
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

export default Party
