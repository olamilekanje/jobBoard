const Resume = require('../models/Resume');
const { chromium } = require('playwright'); // Ensure this is installed

// Generate PDF of Resume
exports.getResumePDF = async (req, res) => {
  try {
    const resume = await Resume.findOne({ user: req.user.id });
    if (!resume) return res.status(404).json({ message: 'Resume not found' });

    const html = `
      <html>
        <head><title>${resume.personalInfo.fullName} Resume</title></head>
        <body style="font-family: sans-serif; padding: 20px;">
          <h1>${resume.personalInfo.fullName}</h1>
          <p><strong>Email:</strong> ${resume.personalInfo.email}</p>
          <p><strong>Phone:</strong> ${resume.personalInfo.phone}</p>
          <p><strong>Address:</strong> ${resume.personalInfo.address}</p>
          <h2>Summary</h2>
          <p>${resume.personalInfo.summary}</p>

          <h2>Education</h2>
          ${resume.education.map(edu => `
            <div>
              <strong>${edu.degree}</strong> in ${edu.field}<br/>
              ${edu.school} (${edu.startDate} - ${edu.endDate})
            </div>
          `).join('')}

          <h2>Experience</h2>
          ${resume.experience.map(exp => `
            <div>
              <strong>${exp.position}</strong> at ${exp.company}<br/>
              ${exp.startDate} - ${exp.endDate}<br/>
              ${exp.description}
            </div>
          `).join('')}

          <h2>Skills</h2>
          <ul>${resume.skills.map(skill => `<li>${skill}</li>`).join('')}</ul>
        </body>
      </html>
    `;

    const browser = await chromium.launch();
    const page = await browser.newPage();
    await page.setContent(html, { waitUntil: 'load' });
    const pdfBuffer = await page.pdf({ format: 'A4' });
    await browser.close();

    res.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename=resume-${resume._id}.pdf`
    });

    res.send(pdfBuffer);
  } catch (err) {
    console.error('PDF generation error:', err);
    res.status(500).json({ message: 'Error generating PDF', error: err.message });
  }
};

// Placeholder for createOrUpdateResume
exports.createOrUpdateResume = async (req, res) => {
  try {
    const existing = await Resume.findOneAndUpdate(
      { user: req.user.id },
      { ...req.body, user: req.user.id },
      { new: true, upsert: true }
    );
    res.status(200).json(existing);
  } catch (error) {
    res.status(500).json({ message: 'Failed to save resume', error: error.message });
  }
};

// Placeholder for getMyResume
exports.getMyResume = async (req, res) => {
  try {
    const resume = await Resume.findOne({ user: req.user.id });
    if (!resume) return res.status(404).json({ message: 'Resume not found' });
    res.status(200).json(resume);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching resume', error: error.message });
  }
};

// Placeholder for uploadResume (optional implementation)
exports.uploadResume = (req, res) => {
  res.status(200).json({ message: 'Upload resume functionality not implemented yet' });
};
