import './App.css'

function App() {
  const QUESTIONNAIRE_LINK = "https://docs.google.com/forms/d/e/1FAIpQLScQ0P9SS8VRLoZsQCtDBbl70znVX0kGMQu92R42WPAK5AFyRg/viewform";
  const RESULTS_DATE = "March 15, 2026";
  const DEADLINE = "March 1, 2026";

  return (
    <div className="app">
      {/* Hero Section */}
      <section className="hero">
        <div className="container">
          <div className="hero-badge">DC Elections 2026</div>
          <h1 className="hero-title">
            DC Statehood <span className="highlight">Questionnaire</span>
          </h1>
          <p className="hero-subtitle">
            Where do candidates for DC elected office stand on statehood and home rule?
            Help DC voters make informed decisions in the June 2026 primary.
          </p>
          <a
            href={QUESTIONNAIRE_LINK}
            className="cta-primary"
            target="_blank"
            rel="noopener noreferrer"
          >
            Complete the Questionnaire →
          </a>
          <p className="deadline">Deadline: {DEADLINE}</p>
        </div>
      </section>

      {/* About Section */}
      <section className="about">
        <div className="container">
          <h2>Why This Matters</h2>
          <p className="lead">
            In the past year alone, Congress has blocked $1.1 billion of DC's locally-raised budget,
            passed bills to eliminate DC's traffic safety cameras, overturned DC's criminal justice reforms,
            and introduced 74+ bills undermining DC autonomy.
          </p>
          <p>
            <strong>We need elected leaders who will stand up to congressional overreach.</strong>
          </p>
          <p>
            This questionnaire asks all candidates in the June 2026 primary about their position on
            DC Statehood and their plans to defend DC Home Rule.
          </p>
        </div>
      </section>

      {/* Who Section */}
      <section className="who">
        <div className="container">
          <h2>Who Should Complete This?</h2>
          <div className="who-grid">
            <div className="who-card">
              <div className="who-icon">🏛️</div>
              <h3>Mayoral Candidates</h3>
              <p>All candidates running for Mayor of the District of Columbia</p>
            </div>
            <div className="who-card">
              <div className="who-icon">⚖️</div>
              <h3>Council Candidates</h3>
              <p>At-Large, Ward, and Council Chairman candidates</p>
            </div>
            <div className="who-card">
              <div className="who-icon">🗽</div>
              <h3>Other Offices</h3>
              <p>Attorney General, Shadow Senator, Shadow Representative</p>
            </div>
          </div>
        </div>
      </section>

      {/* Timeline Section */}
      <section className="timeline">
        <div className="container">
          <h2>Timeline</h2>
          <div className="timeline-grid">
            <div className="timeline-item">
              <div className="timeline-date">January 2026</div>
              <div className="timeline-content">
                <h3>Questionnaire Launch</h3>
                <p>Outreach to all declared candidates begins</p>
              </div>
            </div>
            <div className="timeline-item">
              <div className="timeline-date">{DEADLINE}</div>
              <div className="timeline-content">
                <h3>Submission Deadline</h3>
                <p>Last day for candidates to complete questionnaire</p>
              </div>
            </div>
            <div className="timeline-item">
              <div className="timeline-date">{RESULTS_DATE}</div>
              <div className="timeline-content">
                <h3>Results Published</h3>
                <p>Voter guide published with candidate responses</p>
              </div>
            </div>
            <div className="timeline-item">
              <div className="timeline-date">June 16, 2026</div>
              <div className="timeline-content">
                <h3>Primary Election Day</h3>
                <p>DC voters cast ballots in Democratic primary</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Results Placeholder */}
      <section className="results-placeholder">
        <div className="container">
          <div className="placeholder-box">
            <h2>📊 Results Coming Soon</h2>
            <p>
              Candidate responses will be published here on <strong>{RESULTS_DATE}</strong>.
            </p>
            <p>
              The voter guide will show each candidate's position on DC Statehood,
              whether they've signed the DC Statehood Pledge, and their plans to
              defend Home Rule if elected.
            </p>
          </div>
        </div>
      </section>

      {/* Questions Preview */}
      <section className="questions">
        <div className="container">
          <h2>What's in the Questionnaire?</h2>
          <p className="section-intro">
            The questionnaire takes 10-15 minutes to complete and covers:
          </p>
          <div className="questions-grid">
            <div className="question-category">
              <h3>Your Position</h3>
              <ul>
                <li>Do you support DC Statehood?</li>
                <li>Have you signed the DC Statehood Pledge?</li>
              </ul>
            </div>
            <div className="question-category">
              <h3>Your Advocacy</h3>
              <ul>
                <li>What actions have you taken to support DC Statehood?</li>
                <li>What role will you play in the fight for statehood?</li>
                <li>How will you respond to congressional overreach?</li>
              </ul>
            </div>
            <div className="question-category">
              <h3>Office-Specific Questions</h3>
              <ul>
                <li>Shadow officials: Strategy for advancing statehood in Congress</li>
                <li>Citywide offices: Using visibility to advance statehood nationally</li>
                <li>Ward officials: Engaging residents in the statehood fight</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="cta-section">
        <div className="container">
          <h2>Ready to Make Your Position Known?</h2>
          <p>
            Complete the questionnaire and help DC voters understand where you stand
            on the most important issue facing our democracy.
          </p>
          <a
            href={QUESTIONNAIRE_LINK}
            className="cta-primary"
            target="_blank"
            rel="noopener noreferrer"
          >
            Complete the Questionnaire →
          </a>
        </div>
      </section>

      {/* Footer */}
      <footer className="footer">
        <div className="container">
          <div className="footer-content">
            <div className="footer-section">
              <h3>DC Statehood Questionnaire</h3>
              <p>
                Part of the <a href="https://www.representdc.org">Represent DC</a> project
              </p>
            </div>
            <div className="footer-section">
              <h3>Resources</h3>
              <ul>
                <li><a href="https://billtracker.representdc.org">Bill Tracker</a></li>
                <li><a href="https://www.representdc.org">Represent DC</a></li>
                <li><a href="https://dcstatehoodpledge.org">DC Statehood Pledge</a></li>
              </ul>
            </div>
            <div className="footer-section">
              <h3>About</h3>
              <p className="about-text">
                This is an independent, volunteer-run project created by a proud DC resident
                to help voters make informed decisions about candidates' positions on DC Statehood
                and Home Rule. Not affiliated with any organization.
              </p>
            </div>
          </div>
          <div className="footer-bottom">
            <p>&copy; 2026 Represent DC. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}

export default App
