
const { Redis } = require('@upstash/redis');

const redis = new Redis({
  url: 'https://growing-firefly-50232.upstash.io',
  token: 'AcQ4AAIncDFlYjI2ZWM2ODhmOGQ0N2YwOTI1Njg5ZDA3ZjRjMDdhMHAxNTAyMzI',
});

const User = {
  create: async (username, password) => {
    if(!username || !password) return false;
    const exists = await redis.get(`user:${username}`);
    if (exists) return false;
    await redis.set(`user:${username}`, password);
    return true;
  },
  login: async (username, password) => {
    const savedPass = await redis.get(`user:${username}`);
    return savedPass === password;
  }
};

module.exports = User;
