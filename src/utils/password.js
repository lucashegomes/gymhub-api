const bcrypt = require('bcryptjs');

const PASSWORD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z\d]).{8,}$/;

function validatePasswordStrength(password) {
  if (!PASSWORD_REGEX.test(password || '')) {
    throw new Error(
      'Senha fraca. Use no minimo 8 caracteres com letra maiuscula, minuscula, numero e caractere especial.',
    );
  }
}

async function hashPassword(password) {
  validatePasswordStrength(password);
  return bcrypt.hash(password, 10);
}

async function verifyPassword(password, hash) {
  return bcrypt.compare(password || '', hash || '');
}

module.exports = {
  hashPassword,
  verifyPassword,
  validatePasswordStrength,
};
