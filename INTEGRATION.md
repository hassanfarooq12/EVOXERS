/* INTEGRATION.md */
Add the .env keys to production: Set NEXT_PUBLIC_INSTAGRAM_URL and NEXT_PUBLIC_CONTACT_EMAIL in your production environment variables.
Drop the route file into the existing Express app and mount it at `/api`: `app.use(require('./routes/siteContact'));`
Add the CI script to the pipeline: Run `node scripts/validate-contact.js` in your CI/CD pipeline before deployment.

