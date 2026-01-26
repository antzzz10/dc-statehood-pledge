import { Link } from 'react-router-dom'
import './App.css'

function App() {
  const PRIMARY_DATE = "June 16, 2026";

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
            DC Candidate <span className="highlight">Tracker</span>
          </h1>
          <p className="hero-subtitle">
            Track where candidates stand on statehood and home rule
          </p>
          <p className="hero-description">
            See which candidates in the June 2026 primary have responded to our questionnaire
            and compare their positions on DC Statehood and defending home rule.
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
          <h2>Results — Updated as Responses Come In</h2>
          <p className="section-intro">
            Candidate responses are published on a rolling basis. Here's what the results will look like:
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
                  <td><strong>Sample Candidate A</strong></td>
                  <td>Mayor</td>
                  <td><span className="status-badge responded">✓ Yes</span></td>
                  <td>Yes</td>
                  <td>Yes</td>
                </tr>
                <tr className="sample-row responded">
                  <td><strong>Sample Candidate B</strong></td>
                  <td>At-Large Council</td>
                  <td><span className="status-badge responded">✓ Yes</span></td>
                  <td>Conditional</td>
                  <td>Plans to</td>
                </tr>
                <tr className="sample-row pending">
                  <td><strong>Sample Candidate C</strong></td>
                  <td>Mayor</td>
                  <td><span className="status-badge pending">⏳ Pending</span></td>
                  <td>—</td>
                  <td>—</td>
                </tr>
                <tr className="sample-row no-response">
                  <td><strong>Sample Candidate D</strong></td>
                  <td>Ward 6 Council</td>
                  <td><span className="status-badge no-response">✗ No Response</span></td>
                  <td>Unknown</td>
                  <td>Unknown</td>
                </tr>
              </tbody>
            </table>
          </div>

          <p className="table-note">
            <strong>Note:</strong> This is sample data. Actual candidate responses will be published as they come in.
            The table will include all declared candidates and be sortable by office.
          </p>
        </div>
      </section>

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
              <h3>DC Candidate Tracker</h3>
              <p>
                Non-partisan voter information project
              </p>
            </div>
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
                <li><a href="https://dcstatehoodpledge.org" target="_blank" rel="noopener noreferrer">DC Statehood Pledge</a></li>
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
