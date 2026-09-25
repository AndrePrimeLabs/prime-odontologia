// Import the entities you created in your primeosclient.js
import { Activity, PatientRecord } from './src/api/primeosclient';

async function runExample() {
  try {
    console.log("🚀 Starting PrimeOs SDK Example...");

    // 1. List all activities
    console.log("Fetching activities...");
    const activities = await Activity.list();
    console.log(`Found ${activities.length} activities.`);

    // 2. Create a new activity (Like a new POP or Task)
    console.log("Creating a new task...");
    const newTask = await Activity.create({
      title: "Review PrimeOs Migration",
      description: "Ensure all primeos mentions are removed",
      status: "in_progress",
      priority: "high",
      category: "development"
    });
    console.log("Task created successfully:", newTask.id);

    // 3. Update an existing Patient Record
    // (Replace 'some-id' with a real ID from your Supabase dashboard)
    const patientId = "your-patient-uuid-here"; 
    console.log(`Updating record for patient: ${patientId}`);
    
    await PatientRecord.update(patientId, {
      last_visit: new Date().toISOString(),
      notes: "Migrated to local PrimeOs system."
    });

    // 4. Delete a temporary item
    // await Activity.delete(newTask.id);
    // console.log("Cleaned up example task.");

  } catch (err) {
    console.error("❌ SDK Error:", err.message);
  }
}

// Run the example
runExample();
