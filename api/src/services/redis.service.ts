import Redis from "ioredis";

//@ts-ignore
const redis= new Redis({
  host: process.env.REDIS_HOST,
  password: process.env.REDIS_PASSWORD,
  port: process.env.REDIS_PORT,
  username: "default"
})
redis.on('connect', ()=>{
  console.log("REDIS CONNECTED")
})

export default redis;
