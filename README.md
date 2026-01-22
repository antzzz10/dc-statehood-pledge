# DC Statehood Questionnaire - pledge.representdc.org

A voter information website for the 2026 DC elections, asking candidates about their positions on DC Statehood and Home Rule.

## 🚀 Quick Start

```bash
npm install
npm run dev
```

Visit http://localhost:5173 to preview the site.

## 📋 Next Steps

### 1. Create Google Form Questionnaire

**Follow the setup guide:** `/Users/andriathomas/Projects/dc-questionnaire-setup-guide.md`

**Quick steps:**
1. Go to forms.google.com
2. Create new form: "DC Elections 2026: Statehood Questionnaire"
3. Add all 16 questions from the setup guide
4. Configure settings (limit to 1 response, allow edits)
5. Get shortened link (forms.gle/XXXXX)

**After creating form:**
- Update `QUESTIONNAIRE_LINK` in `src/App.jsx` (line 5)

### 2. Set Up GitHub Repository

```bash
# Create new repository on GitHub named "dc-statehood-pledge"
# DO NOT initialize with README (you already have one)

# Add remote and push
git remote add origin https://github.com/YOUR_USERNAME/dc-statehood-pledge.git
git branch -M main
git push -u origin main
```

### 3. Deploy to GitHub Pages

```bash
npm run deploy
```

This will:
- Build the production site
- Deploy to `gh-pages` branch
- Make it accessible at your GitHub Pages URL

### 4. Configure DNS for pledge.representdc.org

**In your DNS provider (where you manage representdc.org):**

Add a **CNAME record**:
- **Name/Host:** `pledge`
- **Value/Points to:** `YOUR_USERNAME.github.io`
- **TTL:** 3600 (or automatic)

**Example:**
```
Type    Name      Value
CNAME   pledge    andriathomas.github.io
```

**Verify DNS propagation:**
- Wait 5-60 minutes for DNS to propagate
- Check: https://dnschecker.org/#CNAME/pledge.representdc.org

### 5. Enable Custom Domain in GitHub

1. Go to your repository on GitHub
2. Settings → Pages
3. Under "Custom domain", enter: `pledge.representdc.org`
4. Wait for DNS check to complete
5. Enable "Enforce HTTPS" (after DNS check passes)

### 6. Send Questionnaire to Candidates

**Use the tracking spreadsheet:** `/Users/andriathomas/Projects/dc-questionnaire-tracking-spreadsheet.csv`

**Contact info found for 18/24 candidates:**

✅ **With Email:**
- Janeese Lewis George: info@janeesefordc.com
- Gary Goodweather: anthony@goodweatherfordc.com
- Rhonda Hamilton: advocates4mi@gmail.com
- Adoyeo Owolewa: team@vote4oye.com
- Lisa Raymond: lisa@lisaraymondfordc.com
- Phil Mendelson: pmendelson@dccouncil.gov
- Miguel Trindade Deramo: 1B06@anc.dc.gov
- Matt Frumin: mfrumin@dccouncil.gov
- Charles Allen: callen@dccouncil.gov
- Gloria Nauden: info@gloriaforward6.com
- Brian Schwalb: Brian.Schwalb@dc.gov

⚠️ **Website/Form Only:**
- Kenyan McDuffie: mcduffiefordc.com
- Kevin Chavous: kevinbchavous.com
- Candace Nelson: candacefordc.com
- Leniqua'dominique Jenkins: jenkinsfordc.com
- Nathan Bennett Fleming: nate4dc.com (contact form)
- Elissa Silverman: elissafordc.com

❌ **Need to find contact:**
- Adrian Byrd, Robert Gross, Da'Moni Ivey, Regan Jones, James McMorris, Jeffrey Wincott, Patricia Stamper

**For missing contacts:**
- Call DC Office of Campaign Finance: (202) 671-0547
- Email: [email protected]
- Try social media DMs

### 7. Update Questionnaire Link After Creating Form

**In `src/App.jsx` (line 5):**

```javascript
// Replace this:
const QUESTIONNAIRE_LINK = "https://forms.gle/YOUR_FORM_ID_HERE";

// With your actual Google Form link:
const QUESTIONNAIRE_LINK = "https://forms.gle/AbC123XyZ";
```

Then deploy the update:
```bash
git add src/App.jsx
git commit -m "Update questionnaire link with actual Google Form"
git push
npm run deploy
```

## 📁 Project Structure

```
dc-statehood-pledge/
├── src/
│   ├── App.jsx          # Main component with all content
│   ├── App.css          # Styles matching representdc.org
│   └── main.jsx         # React entry point
├── public/
│   ├── CNAME            # Custom domain: pledge.representdc.org
│   └── .nojekyll        # Disables Jekyll on GitHub Pages
├── package.json
├── vite.config.js
└── README.md
```

## 🎨 Design

Matches the RepresentDC.org design system:
- **Primary Red:** #DC143C
- **Dark Red:** #A00000
- **Accent Gold:** #FFD700
- Same typography and spacing

## 📅 Timeline

**Current Phase:** Setup & Outreach
- ✅ Website created
- ⏳ Create Google Form
- ⏳ Deploy to pledge.representdc.org
- ⏳ Send initial emails to candidates

**Key Dates:**
- **Now - Feb 24:** Outreach wave 1 & 2
- **March 1, 2026:** Submission deadline
- **March 15, 2026:** Publish results
- **June 16, 2026:** Primary Election Day

## 🔗 Related Projects

- **Main Site:** [www.representdc.org](https://www.representdc.org)
- **Bill Tracker:** [billtracker.representdc.org](https://billtracker.representdc.org)

## 📝 License

© 2026 Represent DC. All rights reserved.

This is an independent, volunteer-run project created by a proud DC resident.

---

## Quick Reference: Common Commands

```bash
# Development
npm run dev          # Start dev server
npm run build        # Build for production
npm run preview      # Preview production build

# Deployment
npm run deploy       # Deploy to GitHub Pages

# Git
git add -A
git commit -m "Your message"
git push
```

## Troubleshooting

### Custom Domain Not Working
1. Verify CNAME record in DNS: `dig pledge.representdc.org`
2. Check `public/CNAME` contains `pledge.representdc.org`
3. Wait for DNS propagation (up to 24 hours, usually <1 hour)
4. Check GitHub Pages settings

### Build Errors
```bash
rm -rf node_modules package-lock.json
npm install
npm run build
```

### Need Help?
Check the setup guide: `/Users/andriathomas/Projects/dc-questionnaire-setup-guide.md`
