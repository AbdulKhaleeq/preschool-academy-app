const redis = require('redis');

class OTPStorage {
  constructor() {
    this.isProduction = process.env.NODE_ENV === 'production';
    this.memoryStore = new Map(); // Fallback for development
    
    if (this.isProduction) {
      this.redisClient = redis.createClient({
        url: process.env.REDIS_URL || 'redis://localhost:6379',
        password: process.env.REDIS_PASSWORD,
        retry_strategy: (options) => {
          if (options.error && options.error.code === 'ECONNREFUSED') {
            console.error('Redis connection refused');
            return new Error('Redis connection refused');
          }
          if (options.total_retry_time > 1000 * 60 * 60) {
            return new Error('Retry time exhausted');
          }
          if (options.attempt > 10) {
            return undefined;
          }
          return Math.min(options.attempt * 100, 3000);
        }
      });

      this.redisClient.on('error', (err) => {
        console.error('Redis Client Error:', err);
      });

      this.redisClient.connect().catch(console.error);
    }
  }

  async set(phone, otpData) {
    const data = JSON.stringify(otpData);
    const expirySeconds = Math.ceil((otpData.expiresAt - Date.now()) / 1000);
    
    if (this.isProduction && this.redisClient) {
      try {
        await this.redisClient.setEx(`otp:${phone}`, expirySeconds, data);
      } catch (error) {
        console.error('Redis set error:', error);
        // Fallback to memory store
        this.memoryStore.set(phone, otpData);
      }
    } else {
      this.memoryStore.set(phone, otpData);
    }
  }

  async get(phone) {
    if (this.isProduction && this.redisClient) {
      try {
        const data = await this.redisClient.get(`otp:${phone}`);
        return data ? JSON.parse(data) : null;
      } catch (error) {
        console.error('Redis get error:', error);
        // Fallback to memory store
        return this.memoryStore.get(phone) || null;
      }
    } else {
      return this.memoryStore.get(phone) || null;
    }
  }

  async delete(phone) {
    if (this.isProduction && this.redisClient) {
      try {
        await this.redisClient.del(`otp:${phone}`);
      } catch (error) {
        console.error('Redis delete error:', error);
        // Fallback to memory store
        this.memoryStore.delete(phone);
      }
    } else {
      this.memoryStore.delete(phone);
    }
  }

  async close() {
    if (this.redisClient) {
      await this.redisClient.quit();
    }
  }
}

// Create singleton instance
const otpStorage = new OTPStorage();

module.exports = otpStorage;