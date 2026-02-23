import { Link } from 'react-router-dom'
import { useState, useMemo } from 'react'
import './App.css'
import candidatesData from './data/candidates.json'

function App() {
  const PRIMARY_DATE = "June 16, 2026";
  const [selectedOffice, setSelectedOffice] = useState("all");
  const [selectedParty, setSelectedParty] = useState("all");
  const [selectedCandidate, setSelectedCandidate] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [expandedGroups, setExpandedGroups] = useState(new Set());

  const openModal = (candidate) => {
    setSelectedCandidate(candidate);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedCandidate(null);
  };

  const toggleGroup = (office) => {
    setExpandedGroups(prev => {
      const next = new Set(prev);
      if (next.has(office)) {
        next.delete(office);
      } else {
        next.add(office);
      }
      return next;
    });
  };

  // Recent responses (within last 14 days)
  const RECENT_DAYS = 14;
  const recentCutoff = useMemo(() => {
    const d = new Date();
    d.setDate(d.getDate() - RECENT_DAYS);
    return d.toISOString().split('T')[0];
  }, []);

  const recentResponses = useMemo(() => {
    return candidatesData.candidates
      .filter(c => c.responded && c.respondedDate && c.respondedDate >= recentCutoff)
      .sort((a, b) => b.respondedDate.localeCompare(a.respondedDate));
  }, [recentCutoff]);

  const isRecent = (candidate) => {
    return candidate.responded && candidate.respondedDate && candidate.respondedDate >= recentCutoff;
  };

  // Get unique offices for filter
  const offices = useMemo(() => {
    const uniqueOffices = [...new Set(candidatesData.candidates.map(c => c.office))];
    return uniqueOffices.sort();
  }, []);

  // Get unique parties for filter
  const parties = useMemo(() => {
    const uniqueParties = [...new Set(candidatesData.candidates.map(c => c.party))];
    return uniqueParties.sort();
  }, []);

  // Filter and group candidates
  const filteredCandidates = useMemo(() => {
    return candidatesData.candidates.filter(c => {
      const matchesOffice = selectedOffice === "all" || c.office === selectedOffice;
      const matchesParty = selectedParty === "all" || c.party === selectedParty;
      return matchesOffice && matchesParty;
    });
  }, [selectedOffice, selectedParty]);

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

      {/* Party Positions Banner */}
      <div className="candidate-banner party-banner">
        <div className="container">
          <span className="banner-text">
            Also on the ballot: DC Democratic Party positions
          </span>
          <Link to="/party" className="banner-link">
            View party committee candidates →
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

      {/* Recent Responses */}
      {recentResponses.length > 0 && (
        <section className="recent-responses">
          <div className="container">
            <h2>Latest Responses</h2>
            <div className="recent-list">
              {recentResponses.map(candidate => (
                <div
                  key={`recent-${candidate.name}`}
                  className="recent-item"
                  onClick={() => openModal(candidate)}
                >
                  <span className="recent-new-badge">NEW</span>
                  <strong>{candidate.name}</strong>
                  <span className="recent-office">{candidate.office}</span>
                  <span className="recent-date">
                    {new Date(candidate.respondedDate + 'T12:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                  </span>
                  <span className="recent-statehood">
                    Supports Statehood: <strong>{candidate.supportsStatehood}</strong>
                  </span>
                  <span className="recent-arrow">View →</span>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Results Preview */}
      <section className="results-preview">
        <div className="container">
          <h2>Candidate Responses — Updated as They Come In</h2>
          <p className="section-intro">
            Showing {filteredCandidates.length} of {candidatesData.candidates.length} candidates. Filter by office or party to narrow down the list.
          </p>

          {/* Filters */}
          <div className="filter-row">
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

            <div className="filter-container">
              <label htmlFor="party-filter" className="filter-label">Filter by Party:</label>
              <select
                id="party-filter"
                className="office-filter"
                value={selectedParty}
                onChange={(e) => setSelectedParty(e.target.value)}
              >
                <option value="all">All Parties ({candidatesData.candidates.length})</option>
                {parties.map(party => {
                  const count = candidatesData.candidates.filter(c => c.party === party).length;
                  return <option key={party} value={party}>{party} ({count})</option>;
                })}
              </select>
            </div>
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
                  candidates.map((candidate, index) => {
                    const getStatus = () => {
                      if (candidate.withdrew) return { class: 'withdrew', label: '⊘ Withdrew' };
                      if (candidate.responded) return { class: 'responded', label: '✓ Yes' };
                      if (candidate.declined) return { class: 'declined', label: '✗ Declined' };
                      if (candidate.undeliverable) return { class: 'undeliverable', label: '⚠ No Valid Contact' };
                      return { class: 'no-response', label: '— Pending' };
                    };
                    const status = getStatus();
                    return (
                      <tr key={`${candidate.name}-${candidate.office}`} className={`sample-row ${status.class} ${isRecent(candidate) ? 'recent' : ''}`}>
                        <td>
                          <strong>{candidate.name}</strong>
                          {isRecent(candidate) && <span className="new-badge">NEW</span>}
                        </td>
                        <td>
                          <span className={`party-badge ${candidate.party.toLowerCase().replace(' ', '-')}`}>
                            {candidate.party.charAt(0)}
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

          {/* Mobile Card Layout */}
          <div className="cards-container">
            {Object.entries(groupedCandidates).map(([office, candidates]) => {
              const isExpanded = expandedGroups.has(office);
              return (
                <div key={office} className="office-group">
                  <button
                    className={`office-group-header ${isExpanded ? 'expanded' : ''}`}
                    onClick={() => toggleGroup(office)}
                    aria-expanded={isExpanded}
                  >
                    <span className="office-group-title">
                      {office} <span className="candidate-count">({candidates.length})</span>
                    </span>
                    <span className="expand-icon">{isExpanded ? '−' : '+'}</span>
                  </button>
                  {isExpanded && (
                    <div className="office-group-content">
                      {candidates.map((candidate) => {
                        const getStatus = () => {
                          if (candidate.withdrew) return { class: 'withdrew', label: '⊘ Withdrew' };
                          if (candidate.responded) return { class: 'responded', label: '✓ Yes' };
                          if (candidate.declined) return { class: 'declined', label: '✗ Declined' };
                          if (candidate.undeliverable) return { class: 'undeliverable', label: '⚠ No Valid Contact' };
                          return { class: 'no-response', label: '— Pending' };
                        };
                        const status = getStatus();
                        return (
                          <div
                            key={`card-${candidate.name}-${candidate.office}`}
                            className={`candidate-card ${status.class} ${candidate.responded ? 'clickable' : ''} ${isRecent(candidate) ? 'recent' : ''}`}
                            onClick={() => candidate.responded && openModal(candidate)}
                          >
                            <div className="candidate-card-header">
                              <div className="candidate-name-row">
                                <strong className="candidate-name">{candidate.name}</strong>
                                {isRecent(candidate) && <span className="new-badge">NEW</span>}
                              </div>
                              <div className="candidate-badges">
                                <span className={`party-badge ${candidate.party.toLowerCase().replace(' ', '-')}`}>
                                  {candidate.party.charAt(0)}
                                </span>
                                <span className={`status-badge ${status.class}`}>
                                  {status.label}
                                </span>
                              </div>
                            </div>
                            <div className="candidate-card-body">
                              <div className="candidate-info-row">
                                <span className="info-label">Statehood:</span>
                                <span className="info-value">{candidate.supportsStatehood || '—'}</span>
                              </div>
                              {candidate.responded && (
                                <span className="view-response-indicator">View response →</span>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
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
          <div className="about-content">
            <p className="about-mission">
              DC's elected leaders are the front line of defense for home rule and the face of the
              statehood movement. This tracker exists so voters can see where every candidate stands
              before they vote — because the fight for DC's rights starts with who we elect.
            </p>

            <div className="faq-section">
              <details className="faq-item">
                <summary>Why does this matter?</summary>
                <div className="faq-answer">
                  <p>
                    DC is under unprecedented attack. Congress has introduced 74+ anti-DC bills, blocked
                    $1.1 billion of our budget, overturned local criminal justice reforms, and passed
                    bills to eliminate traffic cameras. This isn't another policy questionnaire — it's
                    about whether candidates will defend DC's basic right to self-governance.
                  </p>
                  <p>
                    Our elected leaders are the front line. Voters deserve to know who will fight boldly
                    for DC, not just talk about it.
                  </p>
                </div>
              </details>

              <details className="faq-item">
                <summary>Who is behind this?</summary>
                <div className="faq-answer">
                  <p>
                    The questionnaire was developed by the DC Democratic Party Statehood Committee and
                    sent to all declared candidates regardless of party. Results are published independently
                    on <a href="https://www.representdc.org">RepresentDC.org</a>, a volunteer-run advocacy
                    platform. This project is not affiliated with any campaign or political organization.
                  </p>
                </div>
              </details>

              <details className="faq-item">
                <summary>Why are Republicans and independents included?</summary>
                <div className="faq-answer">
                  <p>
                    Statehood and home rule are about the democratic rights of 700,000 DC residents, not
                    partisan politics. Every candidate for DC office will face congressional interference.
                    Voters of all affiliations deserve to know where candidates stand on defending DC's
                    right to govern itself.
                  </p>
                </div>
              </details>

              <details className="faq-item">
                <summary>How are responses handled?</summary>
                <div className="faq-answer">
                  <p>
                    Candidates submit responses via a secure Google Form. Each response is reviewed before
                    publication and published exactly as submitted — nothing is edited or summarized.
                    Candidates who haven't responded yet are shown as "Pending," not penalized.
                  </p>
                </div>
              </details>

              <details className="faq-item">
                <summary>What is RepresentDC?</summary>
                <div className="faq-answer">
                  <p>
                    RepresentDC is a volunteer-run advocacy platform for DC statehood and home rule. In
                    addition to this candidate tracker, it includes
                    a <a href="https://billtracker.representdc.org">bill tracker</a> monitoring 74+
                    anti-DC bills in Congress.
                  </p>
                  <p>
                    Questions or feedback? Contact us
                    at <a href="mailto:info@representdc.org">info@representdc.org</a>.
                  </p>
                </div>
              </details>
            </div>
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
              <h3>Also on the Ballot</h3>
              <ul>
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

export default App
