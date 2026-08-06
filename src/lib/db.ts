// Import the mongoose library to manage MongoDB connections and object schemas
import mongoose from 'mongoose';

// Read the MongoDB Connection URI from environment variables
const MONGODB_URI = process.env.MONGODB_URI;

/**
 * Global caching is used here to maintain a single cached database connection
 * across hot reloads in Next.js development. This prevents MongoDB connections
 * from growing exponentially during frequent API route executions.
 */
let cached = (global as any).mongoose;

// If mongoose cache does not exist on the global context (e.g. initial start)
if (!cached) {
  // Initialize the cached object on global scope with empty connection and promise references
  cached = (global as any).mongoose = { conn: null, promise: null };
}

// Declare the asynchronous database connector function
async function connectDB() {
  // If the MONGODB_URI variable is missing, throw a configuration error immediately
  if (!MONGODB_URI) {
    throw new Error('Please define the MONGODB_URI environment variable inside .env.local');
  }

  // If a connection is active AND readyState is 1 (connected), return it directly
  if (cached.conn && mongoose.connection.readyState === 1) {
    return cached.conn;
  }

  // If connection is disconnected (0) or missing, reset stale cache
  if (!cached.conn || mongoose.connection.readyState === 0) {
    cached.conn = null;
    cached.promise = null;
  }

  // If there is no connection request currently in progress
  if (!cached.promise) {
    const opts = {
      bufferCommands: true, // Enable Mongoose command buffering during serverless connection handshakes
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 5000,
    };

    // Trigger mongoose.connect and save the returned Promise in cache
    cached.promise = mongoose.connect(MONGODB_URI, opts).then((mongooseInstance) => {
      return mongooseInstance;
    });
  }

  try {
    // Await the connection promise to resolve and store the established connection instance in cache
    cached.conn = await cached.promise;
  } catch (e) {
    // If connection establishment fails, reset the cache to null so subsequent attempts can retry
    cached.promise = null;
    cached.conn = null;
    throw e;
  }

  // Return the active connection instance
  return cached.conn;
}

// Export the connectDB function as default export
export default connectDB;

