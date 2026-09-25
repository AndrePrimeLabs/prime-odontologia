// src/api/router.ts
import fs from 'fs';
import path from 'path';
import mongoose, { Schema, model, models } from 'mongoose';

// Connect to MongoDB using an environment variable or fallback string
const MONGO_URI = process.env.MONGO_URI || "mongodb://localhost:27017/primeos_odontologia";
if (mongoose.connection.readyState === 0) {
  mongoose.connect(MONGO_URI).catch(err => console.error("MongoDB connection error:", err));
}

// Reuse or compile your model schema structures
const AppointmentSchema = new Schema({
  patient_name: { type: String, required: true },
  service_type: { type: String, required: true },
  date: { type: String, required: true },
  status: { type: String, default: "active" }
}, { timestamps: true });

const Appointment = models.Appointment || model('Appointment', AppointmentSchema);

// Helper to read your primeos.json configuration safely
function getPrimeOSConfig() {
  try {
    const configPath = path.resolve(process.cwd(), 'primeos.json');
    if (fs.existsSync(configPath)) {
      return JSON.parse(fs.readFileSync(configPath, 'utf-8'));
    }
  } catch (error) {
    console.error("Failed to read primeos.json:", error);
  }
  return { apiKey: process.env.VITE_PRIMEOS_API_KEY || "fallback_key" };
}

function createJsonResponse(data: unknown, status = 200): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 
      "Content-Type": "application/json; charset=utf-8",
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, POST, PATCH, PUT, DELETE, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, api_key"
    },
  });
}

export async function handlePrimeOSApi(request: Request): Promise<Response | null> {
  const url = new URL(request.url);
  
  // CORS Preflight Handling
  if (request.method === "OPTIONS") {
    return new Response(null, {
      status: 204,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET, POST, PATCH, PUT, DELETE, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type, api_key"
      }
    });
  }

  // Enforce isolation to your OpenAPI spec endpoints
  if (!url.pathname.startsWith("/api/entities/")) {
    return null; 
  }

  // Authenticate using the system configurations
  const config = getPrimeOSConfig();
  const apiKey = request.headers.get("api_key");
  if (!apiKey || apiKey !== config.apiKey) {
    return createJsonResponse({ error: "Unauthorized: Invalid or missing api_key" }, 401);
  }

  const method = request.method;
  const pathName = url.pathname;

  try {
    // Endpoint: /api/entities/Appointment
    if (pathName === "/api/entities/Appointment") {
      
      if (method === "GET") {
        const qParam = url.searchParams.get("q") || "{}";
        const queryFilter = JSON.parse(qParam); 
        const limit = parseInt(url.searchParams.get("limit") || "100");
        const skip = parseInt(url.searchParams.get("skip") || "0");
        const sortBy = url.searchParams.get("sort_by") || "-createdAt";

        // Querying data with custom pagination limits and filter sets
        const records = await Appointment.find(queryFilter)
          .sort(sortBy)
          .skip(skip)
          .limit(limit);

        return createJsonResponse(records);
      }

      if (method === "POST") {
        const body = await request.json();
        
        // Strict attribute verification before saving
        if (!body.patient_name || !body.service_type || !body.date) {
          return createJsonResponse({ error: "Missing required fields" }, 400);
        }
        
        const newRecord = new Appointment(body);
        await newRecord.save();
        return createJsonResponse(newRecord);
      }

      if (method === "DELETE") {
        const queryFilter = await request.json();
        
        if (Object.keys(queryFilter).length === 0) {
          console.warn("CRITICAL: Wipeout triggered. Deleting all appointment records.");
        }
        
        const result = await Appointment.deleteMany(queryFilter);
        return createJsonResponse({ success: true, deleted: result.deletedCount });
      }
    }

    // Endpoint: /api/entities/Appointment/bulk
    if (pathName === "/api/entities/Appointment/bulk") {
      if (method === "POST") {
        const recordsArray = await request.json(); 
        const records = await Appointment.insertMany(recordsArray);
        return createJsonResponse(records);
      }
      
      if (method === "PUT") {
        const updatesArray = await request.json(); 
        
        // Build optimized bulkWrite payload updates for Mongo
        const bulkOps = updatesArray.map((item: any) => {
          const { id, _id, ...updateFields } = item;
          const targetId = id || _id;
          return {
            updateOne: {
              filter: { _id: new mongoose.Types.ObjectId(targetId) },
              update: { $set: updateFields }
            }
          };
        });

        const result = await Appointment.bulkWrite(bulkOps);
        return createJsonResponse({ success: true, updated: result.modifiedCount });
      }
    }

    // Endpoint: /api/entities/Appointment/update-many
    if (pathName === "/api/entities/Appointment/update-many" && method === "PATCH") {
      const { query, data } = await request.json();
      
      // Processes runtime update modifiers ($set, $inc, etc.) safely
      const result = await Appointment.updateMany(query, data);
      return createJsonResponse({ 
        success: true, 
        matchedCount: result.matchedCount, 
        modifiedCount: result.modifiedCount 
      });
    }

    return createJsonResponse({ error: "Endpoint not found" }, 404);
  } catch (error: any) {
    return createJsonResponse({ error: error.message }, 400);
  }
}
