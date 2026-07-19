import { apiHelper } from "../utils/apiHelper";
import { API_ENDPOINTS } from "../utils/constants";

export interface Appointment {
  _id: string;
  studentId: string;
  expertId: string;
  slotId: string;
  status: 'confirmed' | 'in_progress' | 'completed' | 'cancelled' | 'no_show' | 'rescheduled' | 'pending_payment' | 'booked';
  scheduledStartAt: string;
  scheduledEndAt: string;
  amount?: number;
  studentNote?: string;
  expertNote?: string;
  actualStartAt?: string;
  actualEndAt?: string;
}

export interface AppointmentWithStudent extends Appointment {
  studentName?: string;
  studentAvatar?: string;
}

export interface AppointmentsResponse {
  appointments: Appointment[];
}

export class AppointmentController {
  /**
   * Fetch appointments for the logged-in expert
   */
  static async getExpertAppointments(): Promise<Appointment[]> {
    try {
      const data = await apiHelper.get<AppointmentsResponse>(API_ENDPOINTS.APPOINTMENTS.EXPERT);
      return data.appointments || [];
    } catch (error) {
      console.error('getExpertAppointments error:', error);
      throw error;
    }
  }

  /**
   * Fetch appointments for the logged-in student
   */
  static async getStudentAppointments(): Promise<Appointment[]> {
    try {
      const data = await apiHelper.get<AppointmentsResponse>(API_ENDPOINTS.APPOINTMENTS.MINE);
      return data.appointments || [];
    } catch (error) {
      console.error('getStudentAppointments error:', error);
      throw error;
    }
  }

  /**
   * Cancel an appointment
   */
  static async cancelAppointment(appointmentId: string): Promise<void> {
    try {
      await apiHelper.post(API_ENDPOINTS.APPOINTMENTS.CANCEL(appointmentId));
    } catch (error) {
      console.error('cancelAppointment error:', error);
      throw error;
    }
  }

  /**
   * Start a session (update appointment status to in_progress)
   */
  static async startSession(appointmentId: string): Promise<void> {
    try {
      await apiHelper.post(API_ENDPOINTS.APPOINTMENTS.START(appointmentId));
    } catch (error) {
      console.error('startSession error:', error);
      throw error;
    }
  }

  /**
   * End a session (update appointment status to completed)
   */
  static async endSession(appointmentId: string, expertNote?: string): Promise<void> {
    try {
      await apiHelper.post(API_ENDPOINTS.APPOINTMENTS.END(appointmentId), { expertNote });
    } catch (error) {
      console.error('endSession error:', error);
      throw error;
    }
  }
}
