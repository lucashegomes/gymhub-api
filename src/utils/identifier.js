function normalizeEmail(value) {
  return String(value || '').trim().toLowerCase();
}

function normalizeCpf(value) {
  return String(value || '').replace(/\D/g, '');
}

function isEmail(value) {
  return /@/.test(String(value || ''));
}

module.exports = {
  normalizeEmail,
  normalizeCpf,
  isEmail,
};
