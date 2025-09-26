// Backend API endpoints for sending notifications
const API_BASE = 'http://localhost:5000';

export const notificationService = {
  // Send SMS alert
  sendSMS: async (phoneNumber, message) => {
    try {
      const response = await fetch(`${API_BASE}/send-sms`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phoneNumber, message })
      });
      return await response.json();
    } catch (error) {
      throw new Error('SMS sending failed');
    }
  },

  // Send Email alert
  sendEmail: async (email, subject, message) => {
    try {
      const response = await fetch(`${API_BASE}/send-email`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, subject, message })
      });
      return await response.json();
    } catch (error) {
      throw new Error('Email sending failed');
    }
  },

  // Get staff contacts from database
  getStaffContacts: async () => {
    try {
      const response = await fetch(`${API_BASE}/staff-contacts`);
      return await response.json();
    } catch (error) {
      throw new Error('Failed to fetch staff contacts');
    }
  }
};