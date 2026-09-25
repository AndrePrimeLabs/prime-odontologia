import { Schema, model } from 'mongoose';

export interface IAppointment {
  patient_name: string;
  service_type: string;
  date: string;
  status?: string;
}

const AppointmentSchema = new Schema<IAppointment>({
  patient_name: { type: String, required: true },
  service_type: { type: String, required: true },
  date: { type: String, required: true },
  status: { type: String, default: 'active' }
}, { timestamps: true });

export const Appointment = model<IAppointment>('Appointment', AppointmentSchema);
