const dotenv = require('dotenv');

dotenv.config();

function requireEnv(name, fallback) {
  const value = process.env[name] ?? fallback;
  if (value === undefined || value === null || value === '') {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}

const env = {
  port: Number(process.env.PORT || 3000),
  gympassApiKey: requireEnv('GYMPASS_API_KEY', ''),
  bookingBaseUrl: process.env.GYMPASS_BOOKING_BASE_URL || 'https://apitesting.partners.gympass.com/booking/v1',
  bookingV2BaseUrl: process.env.GYMPASS_BOOKING_V2_BASE_URL || 'https://apitesting.partners.gympass.com/booking/v2',
  accessBaseUrl: process.env.GYMPASS_ACCESS_BASE_URL || 'https://apitesting.partners.gympass.com/access/v1',
  setupBaseUrl: process.env.GYMPASS_SETUP_BASE_URL || 'https://apitesting.partners.gympass.com/setup/v1',
  webhookSecret: process.env.GYMPASS_WEBHOOK_SECRET || '',
};

module.exports = env;
