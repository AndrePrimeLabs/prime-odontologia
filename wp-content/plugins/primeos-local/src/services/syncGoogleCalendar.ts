import { createPrimeosClientFromRequest } from './primeosClient.ts';

Deno.serve(async (req) => {
  try {
    const supabase = createClientFromRequest(req);
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get access token from environment
    const accessToken = Deno.env.get('GOOGLE_CALENDAR_ACCESS_TOKEN');

    if (!accessToken) {
      return Response.json({ 
        error: 'Google Calendar não conectado. Configure a integração primeiro.',
        needsAuth: true
      }, { status: 400 });
    }

    // Get calendar events for the next 30 days
    const now = new Date();
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + 30);

    const calendarUrl = `https://www.googleapis.com/calendar/v3/calendars/primary/events?` + 
      `timeMin=${now.toISOString()}&` +
      `timeMax=${futureDate.toISOString()}&` +
      `singleEvents=true&` +
      `orderBy=startTime&` +
      `maxResults=100`;

    const response = await fetch(calendarUrl, {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      const error = await response.text();
      return Response.json({ 
        error: 'Erro ao buscar eventos do Google Calendar',
        details: error
      }, { status: response.status });
    }

    const data = await response.json();
    const events = data.items || [];

    // Sync events to Appointment entity
    let syncedCount = 0;
    const errors = [];

    for (const event of events) {
      try {
        // Skip all-day events without times
        if (!event.start?.dateTime) continue;

        const startDate = new Date(event.start.dateTime);
        
        // Check if appointment already exists (by google event id or matching date/time)
        const existingAppointments = await primeos.asServiceRole.entities.Appointment.filter({
          date: startDate.toISOString().split('T')[0],
          time: startDate.toTimeString().slice(0, 5)
        });

        if (existingAppointments.length === 0) {
          // Create new appointment
          await primeos.asServiceRole.entities.Appointment.create({
            patient_name: event.summary || 'Sem título',
            date: startDate.toISOString().split('T')[0],
            time: startDate.toTimeString().slice(0, 5),
            service_type: 'consultation',
            status: 'scheduled',
            notes: `Sincronizado do Google Calendar\nID: ${event.id}\n${event.description || ''}`,
            duration_minutes: event.end?.dateTime 
              ? Math.round((new Date(event.end.dateTime) - startDate) / 60000)
              : 60
          });
          syncedCount++;
        }
      } catch (err) {
        errors.push({ event: event.summary, error: err.message });
      }
    }

    return Response.json({
      success: true,
      message: `Sincronizados ${syncedCount} eventos do Google Calendar`,
      totalEvents: events.length,
      syncedCount,
      errors: errors.length > 0 ? errors : undefined
    });

  } catch (error) {
    console.error('Calendar sync error:', error);
    return Response.json({ 
      error: error.message || 'Erro ao sincronizar calendário'
    }, { status: 500 });
  }
});
