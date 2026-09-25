// src/routes/appointments.tsx
import { createFileRoute } from '@tanstack/react-router';
import { queryOptions, useSuspenseQuery } from '@tanstack/react-query';

// 1. Create reusable Query Options using the SDK client from context
const appointmentsQueryOptions = (primeOS: any) => 
  queryOptions({
    queryKey: ['appointments', 'list'],
    queryFn: () => primeOS.listAppointments({ q: { status: 'active' }, sort_by: '-date' }),
  });

export const Route = createFileRoute('/appointments')({
  // 2. Preload data safely before the route components render
  loader: ({ context }) => {
    return context.queryClient.ensureQueryData(
      appointmentsQueryOptions(context.primeOS)
    );
  },
  component: AppointmentsComponent,
});

function AppointmentsComponent() {
  // 3. Extract the SDK client inside components using Route hooks if needed
  const { primeOS } = Route.useRouteContext();
  
  // 4. Consume data cleanly with TanStack Query
  const { data: appointments } = useSuspenseQuery(appointmentsQueryOptions(primeOS));

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-4">Prime Odontologia Appointment Records</h2>
      <ul>
        {appointments.map((app: any) => (
          <li key={app.id || app._id} className="border-b py-2">
            <strong>{app.patient_name}</strong> - {app.service_type} ({app.date})
          </li>
        ))}
      </ul>
    </div>
  );
}
