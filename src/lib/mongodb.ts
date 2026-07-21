// Import MongoClient class and ServerApiVersion enum from the official mongodb driver package
import { MongoClient, ServerApiVersion } from "mongodb";

// Retrieve the MongoDB Connection URI from environment variables
const uri = process.env.MONGODB_URI;

// Define connection configuration options for MongoClient instantiation
const options = {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: false,
    deprecationErrors: true,
  },
};

// Declare module-scoped variables for the MongoClient instance and its connection promise wrapper
let client: MongoClient;
let clientPromise: Promise<MongoClient>;

// If the MONGODB_URI connection string is not defined
if (!uri) {
  // Assign a rejected promise payload to clientPromise notifying of configuration error
  clientPromise = Promise.reject(new Error('Invalid/Missing environment variable: "MONGODB_URI"')) as any;

  // Attach a silent catch handler to prevent the app builder/compiler from crashing on unhandled promise warnings
  clientPromise.catch(() => { });
} else {
  // If running in development mode (hot reloading is active)
  if (process.env.NODE_ENV === "development") {
    // Typecast global context to hold the mongo connection promise cache key
    let globalWithMongo = global as typeof globalThis & {
      _mongoClientPromise?: Promise<MongoClient>;
    };

    // If the global database connection promise does not exist yet (first-time boot)
    if (!globalWithMongo._mongoClientPromise) {
      client = new MongoClient(uri, options); // Instantiate a new client instance
      globalWithMongo._mongoClientPromise = client.connect(); // Begin async connection and cache it globally
    }
    // Retrieve connection promise from global cache to avoid spawning duplicate clients during dev reloads
    clientPromise = globalWithMongo._mongoClientPromise;
  } else {
    // If running in production mode, instantiate a direct client connection without global context wrapping
    client = new MongoClient(uri, options);
    clientPromise = client.connect();
  }
}

// Export the MongoClient connection promise.
// This allows sharing a single active client pool across all Next.js serverless functions.
export default clientPromise;

