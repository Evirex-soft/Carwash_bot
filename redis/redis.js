const redis = require("redis");
const client = redis.createClient({
    socket: {
        host: "127.0.0.1",
        port: 6379
    }
});

// Handle Redis connection errors
client.on("error", (err) => {
    console.error("Redis error ❌", err);
});

// Ensure Redis client is connected before using it
(async () => {
    try {
        await client.connect();
        console.log("✅ Connected to Redis");
    } catch (error) {
        console.error("Failed to connect to Redis:", error);
    }
})();

// Save conversation to redis
const saveConversation = async (senderId, data) => {
    await client.set(`conversation:${senderId}`, JSON.stringify(data));
};

// Retrieve conversation state
const getConversation = async (senderId) => {
    const data = await client.get(`conversation:${senderId}`);
    return data ? JSON.parse(data) : null;
};

module.exports = {
    saveConversation,
    getConversation
}