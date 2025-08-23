const mongoose = require("mongoose");
const logger = require("../shared/logger");

let connected = false;

async function connectMongo() {
  if (connected) return;
  const uri = process.env.MONGODB_URI;
  if (!uri) throw new Error("MONGODB_URI is not set");

  mongoose.set("strictQuery", true);
  await mongoose.connect(uri, {
    maxPoolSize: 10
  });

  connected = true;
  logger.info({ uri: redactUri(uri) }, "Connected to MongoDB");
}

function redactUri(uri) {
  try {
    const u = new URL(uri);
    if (u.password) u.password = "***";
    return u.toString();
  } catch {
    return "mongodb://***";
  }
}

module.exports = { connectMongo };
