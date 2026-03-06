const crypto = require('node:crypto');
const { getPool } = require('../../config/database');
const UsersRepository = require('../users/repository');

class AuthRepository {
  constructor() {
    this.pool = getPool();
    this.usersRepository = new UsersRepository();
  }

  async findUserByIdentifier(identifier) {
    const value = String(identifier || '').trim();
    if (!value) return null;

    if (value.includes('@')) {
      return this.usersRepository.findByIdentifier({ email: value.toLowerCase() });
    }

    return this.usersRepository.findByIdentifier({ cpf: value.replace(/\D/g, '') });
  }

  async getAccessData(userId) {
    const [permissions, featureFlags] = await Promise.all([
      this.usersRepository.getUserPermissions(userId),
      this.usersRepository.getUserFeatureFlags(userId),
    ]);

    return { permissions, featureFlags };
  }

  async updateLastLogin(userId) {
    return this.usersRepository.updateLastLogin(userId);
  }

  async createPasswordResetToken(userId) {
    const plainToken = crypto.randomBytes(32).toString('hex');
    const tokenHash = crypto.createHash('sha256').update(plainToken).digest('hex');

    await this.pool.query(
      `insert into password_reset_tokens (user_id, token_hash, expires_at)
       values ($1, $2, now() + interval '1 hour')`,
      [userId, tokenHash],
    );

    return plainToken;
  }

  async findValidResetToken(token) {
    const tokenHash = crypto.createHash('sha256').update(token).digest('hex');

    const result = await this.pool.query(
      `
      select prt.id, prt.user_id
      from password_reset_tokens prt
      where prt.token_hash = $1
        and prt.used_at is null
        and prt.expires_at > now()
      order by prt.created_at desc
      limit 1
      `,
      [tokenHash],
    );

    return result.rows[0] || null;
  }

  async useResetToken(id) {
    await this.pool.query('update password_reset_tokens set used_at = now() where id = $1', [id]);
  }

  async updatePassword(userId, passwordHash) {
    await this.pool.query('update users set password_hash = $1 where id = $2', [passwordHash, userId]);
  }

  async getUserById(userId) {
    return this.usersRepository.findById(userId);
  }
}

module.exports = AuthRepository;
