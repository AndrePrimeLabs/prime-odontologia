import { Request, Response } from 'express';
import { Appointment } from '../models/Appointment';

export const appointmentController = {
  // GET /api/entities/Appointment
  list: async (req: Request, res: Response) => {
    try {
      const q = req.query.q ? JSON.parse(req.query.q as string) : {};
      const limit = parseInt(req.query.limit as string) || 100;
      const skip = parseInt(req.query.skip as string) || 0;
      const sortBy = (req.query.sort_by as string) || '-createdAt';

      const records = await Appointment.find(q)
        .sort(sortBy)
        .skip(skip)
        .limit(limit);
      
      res.json(records);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  },

  // POST /api/entities/Appointment
  create: async (req: Request, res: Response) => {
    try {
      const record = new Appointment(req.body);
      await record.save();
      res.json(record);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  },

  // POST /api/entities/Appointment/bulk
  bulkCreate: async (req: Request, res: Response) => {
    try {
      const records = await Appointment.insertMany(req.body);
      res.json(records);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  },

  // PATCH /api/entities/Appointment/update-many
  updateMany: async (req: Request, res: Response) => {
    try {
      const { query, data } = req.body;
      // Natively supports MongoDB operators ($set, $inc, etc.) sent from the request
      const result = await Appointment.updateMany(query, data);
      res.json({ success: true, matchedCount: result.matchedCount, modifiedCount: result.modifiedCount });
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }
};
