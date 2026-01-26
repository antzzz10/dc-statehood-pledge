import { Link } from 'react-router-dom'
import './App.css'

function Respond() {
  const QUESTIONNAIRE_LINK = "https://docs.google.com/forms/d/e/1FAIpQLScQ0P9SS8VRLoZsQCtDBbl70znVX0kGMQu92R42WPAK5AFyRg/viewform";
  const PRIMARY_DATE = "June 16, 2026";

  return (
    <div className="app">
      {/* Hero Section - Candidate Focused */}
      <section className="hero">
        <div className="container">
          <div className="hero-badge">For Candidates</div>
          <h1 className="hero-title">
            Share Your Position with <span className="highlight">DC Voters</span>
          </h1>
          <p className="hero-subtitle">
            Help voters make informed decisions by completing our brief questionnaire
          </p>
          <p className="hero-description">
            Your responses will be published on candidates.representdc.org for all DC voters to see before the {PRIMARY_DATE} primary election.
          </p>
          <a
            href={QUESTIONNAIRE_LINK}
            className="cta-primary"
            target="_blank"
            rel="noopener noreferrer"
          >
            Complete Questionnaire →
          </a>
          <p className="deadline">Takes 10-15 minutes • Primary Election: {PRIMARY_DATE}</p>
        </div>
      </section>

      {/* Why Respond */}
      <section className="about">
        <div className="container">
          <h2>Why Respond?</h2>
          <div className="info-grid">
            <div className="info-card">
              <h3>📊 Transparency Matters</h3>
              <ul>
                <li>Voters deserve to know where you stand</li>
                <li>Shows you're serious about engaging with constituents</li>
                <li>"No response" is visible to all voters</li>
              </ul>
            </div>

            <div className="info-card">
              <h3>🗳️ Timely Issue</h3>
              <ul>
                <li>Congress blocked $1.1 billion of DC's budget</li>
                <li>74+ bills undermining DC autonomy introduced</li>
                <li>Voters want to know how you'll respond</li>
              </ul>
            </div>

            <div className="info-card">
              <h3>✅ Quick & Easy</h3>
              <ul>
                <li>Takes just 10-15 minutes</li>
                <li>Published on a rolling basis</li>
                <li>Non-partisan voter information</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* What We're Asking */}
      <section className="questionnaire-info">
        <div className="container">
          <h2>What We're Asking</h2>

          <div className="info-grid">
            <div className="info-card">
              <h3>📝 Core Questions</h3>
              <ul>
                <li>Do you support DC Statehood?</li>
                <li>Have you signed the DC Statehood Pledge?</li>
                <li>What actions have you taken to advance statehood?</li>
                <li>How will you respond to congressional overreach?</li>
              </ul>
            </div>

            <div className="info-card">
              <h3>📋 Your Information</h3>
              <ul>
                <li>Name and office you're running for</li>
                <li>Contact information (optional)</li>
                <li>Campaign website (optional)</li>
              </ul>
            </div>

            <div className="info-card">
              <h3>⏱️ Timeline</h3>
              <ul>
                <li><strong>Time:</strong> 10-15 minutes</li>
                <li><strong>Published:</strong> Rolling basis</li>
                <li><strong>Primary:</strong> {PRIMARY_DATE}</li>
              </ul>
            </div>
          </div>

          <div className="cta-box">
            <h3>Ready to Share Your Position?</h3>
            <p>Complete the questionnaire now to help DC voters make informed decisions.</p>
            <a
              href={QUESTIONNAIRE_LINK}
              className="cta-secondary"
              target="_blank"
              rel="noopener noreferrer"
            >
              Complete Questionnaire →
            </a>
          </div>
        </div>
      </section>

      {/* Sample Results Preview */}
      <section className="results-preview">
        <div className="container">
          <h2>How Your Response Will Appear</h2>
          <p className="section-intro">
            Your responses will be published in a simple table format alongside all other candidates:
          </p>

          <div className="table-container">
            <table className="results-table">
              <thead>
                <tr>
                  <th>Candidate Name</th>
                  <th>Office</th>
                  <th>Responded?</th>
                  <th>Supports Statehood?</th>
                  <th>Signed Pledge?</th>
                </tr>
              </thead>
              <tbody>
                <tr className="sample-row responded">
                  <td><strong>Your Name</strong></td>
                  <td>Your Office</td>
                  <td><span className="status-badge responded">✓ Yes</span></td>
                  <td>Your Response</td>
                  <td>Your Response</td>
                </tr>
                <tr className="sample-row pending">
                  <td><strong>Other Candidate</strong></td>
                  <td>Same Office</td>
                  <td><span className="status-badge pending">⏳ Pending</span></td>
                  <td>—</td>
                  <td>—</td>
                </tr>
              </tbody>
            </table>
          </div>

          <p className="table-note">
            <Link to="/" style={{ color: '#DC143C', fontWeight: 600 }}>View full results table →</Link>
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="footer">
        <div className="container">
          <div className="footer-content">
            <div className="footer-section">
              <h3>DC Candidate Tracker</h3>
              <p>
                Organized by the DC Democratic Party Statehood Committee.<br />
                Results published independently on <Link to="/" style={{ color: '#FFD700' }}>RepresentDC.org</Link> for non-partisan voter information.
              </p>
            </div>
            <div className="footer-section">
              <h3>For Voters</h3>
              <ul>
                <li><Link to="/">View Results</Link></li>
                <li><a href="https://www.representdc.org">Main Site</a></li>
                <li><a href="https://billtracker.representdc.org">Bill Tracker</a></li>
              </ul>
            </div>
            <div className="footer-section">
              <h3>Resources</h3>
              <ul>
                <li><a href="https://dcstatehoodpledge.org" target="_blank" rel="noopener noreferrer">DC Statehood Pledge</a></li>
                <li><a href="https://www.representdc.org">About This Project</a></li>
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

export default Respond
