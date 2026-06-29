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
  
  // If a connection is already established and cached, return it directly (0ms latency, reused connection)
  if (cached.conn) {
    return cached.conn;
  }

  // If there is no connection request currently in progress
  if (!cached.promise) {
    const opts = {
      bufferCommands: false, // Disable Mongoose buffering. Queries fail immediately if connection is down instead of hanging.
    };

    // Trigger mongoose.connect and save the returned Promise in cache to prevent duplicate concurrent connection requests
    cached.promise = mongoose.connect(MONGODB_URI, opts).then((mongooseInstance) => {
      return mongooseInstance;
    });
  }

  try {
    // Await the connection promise to resolve and store the established connection instance in cache
    cached.conn = await cached.promise;
  } catch (e) {
    // If connection establishment fails, reset the promise cache to null so subsequent attempts can retry
    cached.promise = null;
    throw e; // Re-throw connection error
  }

  // Return the active connection instance
  return cached.conn;
}

// Export the connectDB function as default export
export default connectDB;

