
const { Redis } = require('@upstash/redis');

const redis = new Redis({
  url: 'https://growing-firefly-50232.upstash.io',
  token: 'AcQ4AAIncDFlYjI2ZWM2ODhmOGQ0N2YwOTI1Njg5ZDA3ZjRjMDdhMHAxNTAyMzI',
});

const User = {
  create: async (username, password) => {
    if(!username || !password) return false;
    
    // Hilangkan spasi di depan/belakang
    const cleanUser = username.trim().toLowerCase();
    const cleanPass = password.trim();

    const exists = await redis.get(`user:${cleanUser}`);
    if (exists) return false;

    await redis.set(`user:${cleanUser}`, cleanPass);
    return true;
  },
  
  login: async (username, password) => {
    if(!username || !password) return false;

    const cleanUser = username.trim().toLowerCase();
    const cleanPass = password.trim();

    const savedPass = await redis.get(`user:${cleanUser}`);
    
    // Konversi keduanya ke String untuk memastikan perbandingan valid
    return String(savedPass) === String(cleanPass);
  }
};

module.exports = User;
