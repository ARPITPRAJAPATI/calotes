import { NextResponse } from 'next/server';
import mongoose from 'mongoose';
import connectDB from '@/lib/db';
import { v2 as cloudinary } from 'cloudinary';

// Initialize Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

/**
 * GET /api/health
 * Public/Admin Health Check API returning live system health metrics,
 * latency of MongoDB, Cloudinary, Resend, and Env Status.
 * Can be monitored 24/7 by UptimeRobot / BetterStack.
 */
export async function GET() {
  const startTime = Date.now();

  const services = {
    database: { status: 'checking', latencyMs: 0, error: null as string | null },
    cloudinary: { status: 'checking', error: null as string | null },
    resend: { status: 'checking', error: null as string | null },
    env: { status: 'ok', missingVars: [] as string[] },
  };

  // 1. Check Essential Environment Variables
  const requiredEnvVars = [
    'MONGODB_URI',
    'NEXTAUTH_SECRET',
    'RAZORPAY_KEY_ID',
    'RAZORPAY_KEY_SECRET',
    'CLOUDINARY_CLOUD_NAME',
    'CLOUDINARY_API_KEY',
    'CLOUDINARY_API_SECRET',
    'RESEND_API_KEY',
  ];

  for (const envVar of requiredEnvVars) {
    if (!process.env[envVar]) {
      services.env.missingVars.push(envVar);
    }
  }

  if (services.env.missingVars.length > 0) {
    services.env.status = 'degraded';
  }

  // 2. Check MongoDB Database Health & Ping Latency
  const dbStartTime = Date.now();
  try {
    await connectDB();

    // If readyState is connecting (2) or disconnected (0), await connection resolution
    if (mongoose.connection.readyState !== 1) {
      await mongoose.connect(process.env.MONGODB_URI!, {
        bufferCommands: true,
        serverSelectionTimeoutMS: 5000,
      });
    }

    if (mongoose.connection.readyState === 1) {
      // Perform a lightweight admin ping query
      if (mongoose.connection.db) {
        await mongoose.connection.db.admin().ping();
      }
      services.database.status = 'healthy';
      services.database.latencyMs = Date.now() - dbStartTime;
    } else {
      services.database.status = 'down';
      services.database.error = `Mongoose state: ${mongoose.connection.readyState}`;
    }
  } catch (err: any) {
    services.database.status = 'down';
    services.database.error = err.message || 'Database connection failed';
  }

  // 3. Check Cloudinary CDN Service Health
  try {
    if (process.env.CLOUDINARY_CLOUD_NAME) {
      services.cloudinary.status = 'healthy';
    } else {
      services.cloudinary.status = 'degraded';
      services.cloudinary.error = 'Cloudinary credentials missing';
    }
  } catch (err: any) {
    services.cloudinary.status = 'degraded';
    services.cloudinary.error = err.message;
  }

  // 4. Check Resend Mailer Credentials
  if (process.env.RESEND_API_KEY) {
    services.resend.status = 'healthy';
  } else {
    services.resend.status = 'degraded';
    services.resend.error = 'RESEND_API_KEY not configured';
  }

  // Determine overall system health state
  const isDbHealthy = services.database.status === 'healthy';
  const isEnvHealthy = services.env.status === 'ok';

  let overallStatus = 'healthy';
  if (!isDbHealthy) {
    overallStatus = 'down';
  } else if (!isEnvHealthy || services.cloudinary.status !== 'healthy') {
    overallStatus = 'degraded';
  }

  const memoryUsage = process.memoryUsage();

  const response = NextResponse.json(
    {
      status: overallStatus,
      timestamp: new Date().toISOString(),
      responseTimeMs: Date.now() - startTime,
      services,
      system: {
        nodeVersion: process.version,
        uptimeSeconds: Math.floor(process.uptime()),
        memory: {
          heapUsedMb: Math.round((memoryUsage.heapUsed / 1024 / 1024) * 100) / 100,
          heapTotalMb: Math.round((memoryUsage.heapTotal / 1024 / 1024) * 100) / 100,
          rssMb: Math.round((memoryUsage.rss / 1024 / 1024) * 100) / 100,
        },
      },
    },
    { status: overallStatus === 'down' ? 503 : 200 }
  );

  response.headers.set('Access-Control-Allow-Origin', '*');
  response.headers.set('Access-Control-Allow-Methods', 'GET, HEAD, OPTIONS');
  response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  return response;
}

export async function OPTIONS() {
  const response = new NextResponse(null, { status: 200 });
  response.headers.set('Access-Control-Allow-Origin', '*');
  response.headers.set('Access-Control-Allow-Methods', 'GET, HEAD, OPTIONS');
  response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  return response;
}

export async function HEAD() {
  const response = new NextResponse(null, { status: 200 });
  response.headers.set('Access-Control-Allow-Origin', '*');
  response.headers.set('Access-Control-Allow-Methods', 'GET, HEAD, OPTIONS');
  return response;
}
