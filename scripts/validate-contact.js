/* scripts/validate-contact.js */
const instagramUrl = process.env.NEXT_PUBLIC_INSTAGRAM_URL;
const contactEmail = process.env.NEXT_PUBLIC_CONTACT_EMAIL;

let hasError = false;

if (!instagramUrl) {
  console.error('ERROR: NEXT_PUBLIC_INSTAGRAM_URL is not set');
  hasError = true;
} else {
  try {
    const url = new URL(instagramUrl);
    if (!['http:', 'https:'].includes(url.protocol)) {
      console.error('ERROR: NEXT_PUBLIC_INSTAGRAM_URL must be a valid http/https URL');
      hasError = true;
    }
  } catch (e) {
    console.error('ERROR: NEXT_PUBLIC_INSTAGRAM_URL is not a valid URL');
    hasError = true;
  }
}

if (!contactEmail) {
  console.error('ERROR: NEXT_PUBLIC_CONTACT_EMAIL is not set');
  hasError = true;
} else {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(contactEmail)) {
    console.error('ERROR: NEXT_PUBLIC_CONTACT_EMAIL is not a valid email address');
    hasError = true;
  }
}

if (hasError) {
  process.exit(1);
}

console.log('Contact config validation: OK');
process.exit(0);

