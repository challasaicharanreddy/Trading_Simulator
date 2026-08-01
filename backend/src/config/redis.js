import Redis from 'ioredis';
import dotenv from 'dotenv';

dotenv.config();
const RedisClient=new Redis(process.env.REDIS_URL,{
    tls:{},
});
RedisClient.on('connect',()=>{
    console.log('Redis connected');
});
RedisClient.on('error',(err)=>{
    console.error('Redis error',err.message);
});

export default RedisClient;
