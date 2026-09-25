import { createPrimeosClientFromRequest } from './primeosClient.ts';

Deno.serve(async (req) => {
  try {
    const primeos = createClientFromRequest(req);
    const user = await primeos.auth.me();
    
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { appointment, action } = await req.json();

    if (!appointment || !action) {
      return Response.json({ error: 'Missing appointment or action' }, { status: 400 });
    }

    // Get sync settings
    const settings = await primeos.entities.CRMSyncSettings.filter({ user_email: user.email });
    const userSettings = settings[0] || {
      google_calendar_enabled: true,
      sync_appointment_types: ['follow_up', 'meeting', 'call', 'demo', 'presentation', 'negotiation', 'closing'],
      calendar_id: 'primary',
      auto_sync_on_create: true,
      auto_sync_on_update: true
    };

    // Check if sync is enabled
    if (!userSettings.google_calendar_enabled) {
      return Response.json({ success: false, message: 'Google Calendar sync is disabled' });
    }

    // Check if this appointment type should be synced
    if (!userSettings.sync_appointment_types.includes(appointment.type)) {
      return Response.json({ success: false, message: 'Appointment type not configured for sync' });
    }

    // Check auto-sync settings
    if (action === 'create' && !userSettings.auto_sync_on_create) {
      return Response.json({ success: false, message: 'Auto-sync on create is disabled' });
    }
    if (action === 'update' && !userSettings.auto_sync_on_update) {
      return Response.json({ success: false, message: 'Auto-sync on update is disabled' });
    }

    // Get Google Calendar access token
    const accessToken = await primeos.asServiceRole.connectors.getAccessToken('googlecalendar');

    const startDateTime = `${appointment.date}T${appointment.time}:00`;
    const endTime = new Date(new Date(startDateTime).getTime() + (appointment.duration_minutes || 30) * 60000);
    const endDateTime = endTime.toISOString().slice(0, 16);

    const event = {
      summary: appointment.title,
      description: `Cliente: ${appointment.customer_name}\nTipo: ${appointment.type}\n${appointment.description || ''}`,
      start: {
        dateTime: startDateTime,
        timeZone: 'America/Sao_Paulo'
      },
      end: {
        dateTime: endDateTime,
        timeZone: 'America/Sao_Paulo'
      },
      location: appointment.location || '',
      reminders: {
        useDefault: false,
        overrides: [
          { method: 'email', minutes: appointment.reminder_time_minutes || 60 },
          { method: 'popup', minutes: appointment.reminder_time_minutes || 60 }
        ]
      },
      attendees: appointment.customer_email ? [{ email: appointment.customer_email }] : []
    };

    let response;
    
    if (action === 'create') {
      // Create new event
      response = await fetch(
        `https://www.googleapis.com/calendar/v3/calendars/${userSettings.calendar_id}/events`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(event)
        }
      );
    } else if (action === 'update' && appointment.google_calendar_event_id) {
      // Update existing event
      response = await fetch(
        `https://www.googleapis.com/calendar/v3/calendars/${userSettings.calendar_id}/events/${appointment.google_calendar_event_id}`,
        {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(event)
        }
      );
    } else if (action === 'delete' && appointment.google_calendar_event_id) {
      // Delete event
      response = await fetch(
        `https://www.googleapis.com/calendar/v3/calendars/${userSettings.calendar_id}/events/${appointment.google_calendar_event_id}`,
        {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${accessToken}`
          }
        }
      );

      if (response.status === 204 || response.status === 200) {
        return Response.json({ 
          success: true, 
          message: 'Event deleted from Google Calendar'
        });
      }
    }

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Google Calendar API error: ${error}`);
    }

    const result = action === 'delete' ? {} : await response.json();

    // Update appointment with Google Calendar event ID
    if (action === 'create' && result.id) {
      await primeos.asServiceRole.entities.CRMAppointment.update(appointment.id, {
        ...appointment,
        google_calendar_event_id: result.id
      });
    }

    return Response.json({ 
      success: true, 
      eventId: result.id,
      htmlLink: result.htmlLink,
      message: `Event ${action}d successfully`
    });

  } catch (error) {
    console.error('Error syncing to Google Calendar:', error);
    return Response.json({ 
      error: error.message,
      success: false
    }, { status: 500 });
  }
});
