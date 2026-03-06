const { isValidCpf, normalizeCpf } = require('../../../utils/cpf');
const AppError = require('../../../lib/appError');

function validateAndNormalizeCpf(value) {
  const normalized = normalizeCpf(value);
  if (!isValidCpf(normalized)) {
    throw new AppError('CPF invalido', 400);
  }
  return normalized;
}

module.exports = {
  validateAndNormalizeCpf,
};
