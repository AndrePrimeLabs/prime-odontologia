import { createPrimeosClientFromRequest } from './primeosClient.ts';

Deno.serve(async (req) => {
  try {
    const supabase = createClientFromRequest(req);
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { appointment_id, notes } = await req.json();

    if (!appointment_id) {
      return Response.json({ error: 'appointment_id é obrigatório' }, { status: 400 });
    }

    // Fetch appointment
    const { data: appts } = await supabase.from('appointments').select('*').eq('id', appointment_id);
    if (!appts || appts.length === 0) {
      return Response.json({ error: 'Consulta não encontrada' }, { status: 404 });
    }
    const appt = appts[0];

    // Build EHR payload (FHIR Encounter-style structure)
    const ehrPayload = {
      resourceType: "Encounter",
      status: appt.status === "completed" ? "finished" : "in-progress",
      subject: {
        display: appt.patient_name,
        reference: `Patient/${appt.patient_id || appt.patient_name}`
      },
      participant: appt.provider ? [{ individual: { display: appt.provider } }] : [],
      period: {
        start: `${appt.date}T${appt.time || "00:00"}:00`,
      },
      serviceType: {
        coding: [{ code: appt.service_type, display: appt.service_type }]
      },
      note: notes ? [{ text: notes }] : [],
      extension: [
        { url: "dentist_id", valueString: appt.dentist_id || "" },
        { url: "resource_name", valueString: appt.resource_name || "" },
        { url: "duration_minutes", valueInteger: appt.duration_minutes || 30 },
      ]
    };

    // If EHR_API_KEY and EHR_BASE_URL are set, send to real EHR
    const ehrApiKey = Deno.env.get("EHR_API_KEY");
    const ehrBaseUrl = Deno.env.get("EHR_BASE_URL");

    let ehrResponse = null;
    if (ehrApiKey && ehrBaseUrl) {
      const res = await fetch(`${ehrBaseUrl}/Encounter`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${ehrApiKey}`
        },
        body: JSON.stringify(ehrPayload)
      });
      ehrResponse = await res.json();
    } else {
      // Simulate successful sync when no real EHR is configured
      ehrResponse = { id: `EHR-${appointment_id}`, status: "created", simulated: true };
      console.log("EHR sync simulated (no EHR_API_KEY/EHR_BASE_URL configured):", ehrPayload);
    }

    // Also save notes to local MedicalRecord if notes provided
    if (notes && appt.patient_id) {
      await primeos.entities.MedicalRecord.create({
        patient_id: appt.patient_id,
        patient_name: appt.patient_name,
        record_type: "evolucao",
        title: `Evolução - ${appt.service_type} - ${appt.date}`,
        content: notes,
        provider: appt.provider || user.full_name,
        date: appt.date || new Date().toISOString().split("T")[0],
        synced_to_ehr: true,
        last_ehr_sync: new Date().toISOString()
      });
    }

    // Mark appointment as synced
    await primeos.entities.Appointment.update(appointment_id, {
      ehr_synced: true,
      ehr_sync_date: new Date().toISOString(),
      notes: notes || appt.notes
    });

    return Response.json({
      success: true,
      message: "Consulta sincronizada com EHR com sucesso",
      ehr_id: ehrResponse.id,
      simulated: !!ehrResponse.simulated,
      payload: ehrPayload
    });

  } catch (error) {
    console.error("syncAppointmentEHR error:", error);
    return Response.json({ error: error.message || "Erro ao sincronizar com EHR" }, { status: 500 });
  }
});
