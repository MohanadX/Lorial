import mongoose, { ConnectOptions, Mongoose } from "mongoose";

// Augment globalThis to store a cache across module reloads (useful in development
// where Next.js may re-import modules several times). We avoid `any` by using
// the `Mongoose` type from the mongoose package.
declare global {
	var mongooseCache:
		| {
				conn: Mongoose | null;
				promise: Promise<Mongoose> | null;
		  }
		| undefined;
}

// Initialize the cache on the global object if it's not already present.
if (!global.mongooseCache) {
	global.mongooseCache = { conn: null, promise: null };
}

// Read the MongoDB connection string from the environment. Fail fast with a
// helpful error if it's missing — this makes misconfiguration obvious.
const MONGODB_URI = process.env.MONGODB_URI;
if (!MONGODB_URI) {
	throw new Error(
		"The MONGODB_URI environment variable is not set. Please add it to your environment or .env file."
	);
}
// At this point MONGODB_URI is guaranteed to be defined. Create a typed alias
// so TypeScript sees a `string` (avoids non-null assertions at call sites).
const uri: string = MONGODB_URI;

/**
 * Connects to MongoDB using Mongoose and returns the Mongoose instance.
 *
 * This function caches the connection (and the connect promise) on the
 * global object to avoid making new connections during hot-reloads in
 * development. In production the module is loaded once and the cached
 * connection will be used as usual.
 *
 * Returns:
 *  - A Promise that resolves to the connected Mongoose instance.
 */
export async function connectToDatabase(): Promise<Mongoose> {
	// If we already have a cached connection, return it immediately.
	if (global.mongooseCache?.conn) {
		return global.mongooseCache.conn;
	}

	// If there's no active connect promise, create one and cache it. This
	// ensures multiple concurrent calls wait on the same promise instead of
	// opening duplicate connections.
	if (!global.mongooseCache?.promise) {
		const options: ConnectOptions = {
			// Recommended for modern mongoose (v6+) — remove legacy flags.
			bufferCommands: false, // Don't buffer model commands if not connected
			// You can add other options here if needed (e.g., tls, family, appName).
		} as ConnectOptions;

		global.mongooseCache!.promise = mongoose
			.connect(uri, options)
			.then((mongooseInstance) => {
				return mongooseInstance;
			});
	}

	// Await the (possibly newly created) connection promise and cache the
	// resulting Mongoose instance for subsequent calls.
	global.mongooseCache!.conn = await global.mongooseCache!.promise;
	return global.mongooseCache!.conn;
}

// For convenience, also export the mongoose default export so callers can
// access models/types directly if needed.
export { mongoose };

export default connectToDatabase;

// Note: If you need to disconnect (for example in tests), call
// `await mongoose.disconnect()` and reset `global.mongooseCache` as desired.
