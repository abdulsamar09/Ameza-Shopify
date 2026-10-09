/**
 * AMEZA Simulated Transactional Mailer — shared/js/api/mailer.api.js
 * Logs outgoing transactional emails to local storage for testing and dev console inspection.
 */

export const MailerAPI = {
  /**
   * Simulates sending an email and stores in outbox for inspection in /dev/mail-outbox.html.
   * @param {Object} mail
   * @param {string} mail.to
   * @param {string} mail.subject
   * @param {string} mail.body
   */
  async sendMail({ to, subject, body }) {
    try {
      const raw = localStorage.getItem('ameza_mail_outbox');
      const outbox = raw ? JSON.parse(raw) : [];

      const record = {
        id: 'msg_' + Date.now() + '_' + Math.random().toString(36).substr(2, 5),
        to,
        subject,
        body,
        bodySnippet: (body || '').replace(/<[^>]*>/g, '').substr(0, 100),
        timestamp: new Date().toLocaleTimeString('en-US', { hour12: true })
      };

      outbox.unshift(record);
      // Keep at most 50 recent simulated emails
      localStorage.setItem('ameza_mail_outbox', JSON.stringify(outbox.slice(0, 50)));
      return { success: true, messageId: record.id };
    } catch (e) {
      console.warn('[MailerAPI] Simulation write error:', e);
      return { success: false, error: e.message };
    }
  },

  async sendPasswordReset(email, code) {
    return this.sendMail({
      to: email,
      subject: 'Reset Your AMEZA Account Password',
      body: `<p>Your password reset code is <strong>${code}</strong>. Valid for 15 minutes.</p>`
    });
  },

  async sendTwoFactorCode(email, code) {
    return this.sendMail({
      to: email,
      subject: 'Your AMEZA Two-Factor Security Code',
      body: `<p>Your verification code is <strong>${code}</strong>.</p>`
    });
  },

  async sendOrderConfirmation(email, order) {
    return this.sendMail({
      to: email,
      subject: `Order Confirmation #${order.id} - AMEZA Marketplace`,
      body: `<p>Thank you for your order! Your total of $${((order.grandTotal || 0) / 100).toFixed(2)} has been processed.</p>`
    });
  }
};
