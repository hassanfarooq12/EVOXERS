/* routes/siteContact.js */
const express = require('express');
const router = express.Router();

router.get('/api/site-contact', (req, res) => {
  const instagramUrl = process.env.NEXT_PUBLIC_INSTAGRAM_URL || 'https://www.instagram.com/evoxers_?igsh=MTFobzg4aDNzOWw5Zw==';
  const contactEmail = process.env.NEXT_PUBLIC_CONTACT_EMAIL || 'info@evoxers.com';
  
  const subject = 'Project Inquiry - Evoxers';
  const body = `Hello Evoxers,

I am interested in a project with you. Please find the details below:

* Project Type: [Website/Branding/Ads]
* Brief: [One-line description]
* Budget: [Estimated]
* Timeline: [Weeks/Months]
* Contact: [Phone or WhatsApp]

Please reply with available slots for a quick call.

Thanks,
[Your Name]
[Company / Role]`;

  const mailtoLink = `mailto:${encodeURIComponent(contactEmail)}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;

  res.json({
    instagramUrl,
    contactEmail,
    mailtoLink
  });
});

module.exports = router;

