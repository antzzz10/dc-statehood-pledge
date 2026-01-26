import './App.css'

function App() {
  const QUESTIONNAIRE_LINK = "https://docs.google.com/forms/d/e/1FAIpQLScQ0P9SS8VRLoZsQCtDBbl70znVX0kGMQu92R42WPAK5AFyRg/viewform";
  const PRIMARY_DATE = "June 16, 2026";

  return (
    <div className="app">
      {/* Hero Section */}
      <section className="hero">
        <div className="container">
          <div className="hero-badge">DC Elections 2026</div>
          <h1 className="hero-title">
            DC Candidate <span className="highlight">Tracker</span>
          </h1>
          <p className="hero-subtitle">
            Track DC candidate positions on statehood and home rule
          </p>
          <p className="hero-description">
            We're asking all candidates in the June 2026 primary where they stand on DC Statehood
            and Home Rule. See who responds and compare their positions.
          </p>
          <a
            href={QUESTIONNAIRE_LINK}
            className="cta-primary"
            target="_blank"
            rel="noopener noreferrer"
          >
            Share Your Position →
          </a>
          <p className="deadline">Primary Election: {PRIMARY_DATE}</p>
        </div>
      </section>

      {/* Why This Matters */}
      <section className="about">
        <div className="container">
          <h2>Why Track Candidate Positions?</h2>
          <p className="lead">
            In the past year, Congress blocked $1.1 billion of DC's budget, passed bills to
            eliminate traffic cameras, overturned criminal justice reforms, and introduced
            74+ bills undermining DC autonomy.
          </p>
          <p>
            <strong>DC voters deserve to know where candidates stand on defending home rule and fighting for statehood.</strong>
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

      {/* Questionnaire Info */}
      <section className="questionnaire-info">
        <div className="container">
          <h2>About the Questionnaire</h2>

          <div className="info-grid">
            <div className="info-card">
              <h3>📝 What We Ask</h3>
              <ul>
                <li>Do you support DC Statehood?</li>
                <li>Have you signed the DC Statehood Pledge?</li>
                <li>What actions have you taken to advance statehood?</li>
                <li>How will you respond to congressional overreach?</li>
              </ul>
            </div>

            <div className="info-card">
              <h3>👥 Who Should Respond</h3>
              <ul>
                <li>Mayoral candidates</li>
                <li>Council candidates (At-Large, Ward, Chairman)</li>
                <li>Attorney General candidates</li>
                <li>Shadow Senator/Representative candidates</li>
              </ul>
            </div>

            <div className="info-card">
              <h3>⏱️ Quick Details</h3>
              <ul>
                <li><strong>Time to complete:</strong> 10-15 minutes</li>
                <li><strong>Published:</strong> Rolling basis (as responses come in)</li>
                <li><strong>Primary Election:</strong> {PRIMARY_DATE}</li>
              </ul>
            </div>
          </div>

          <div className="cta-box">
            <h3>Candidates: Share Your Position</h3>
            <p>Help DC voters make informed decisions before the {PRIMARY_DATE} primary by completing the questionnaire.</p>
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

      {/* Footer */}
      <footer className="footer">
        <div className="container">
          <div className="footer-content">
            <div className="footer-section">
              <h3>DC Candidate Tracker</h3>
              <p>
                Part of the <a href="https://www.representdc.org">Represent DC</a> project
              </p>
            </div>
            <div className="footer-section">
              <h3>Other Tools</h3>
              <ul>
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

export default App
