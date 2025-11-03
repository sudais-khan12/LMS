import nodemailer from 'nodemailer';

interface EmailOptions {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

/**
 * Send email using nodemailer with SMTP configuration
 * Falls back to console logging if SMTP is not configured
 */
export async function sendEmail({ to, subject, html, text }: EmailOptions): Promise<{ success: boolean; error?: string }> {
  const smtpHost = process.env.SMTP_HOST;
  const smtpPort = process.env.SMTP_PORT ? parseInt(process.env.SMTP_PORT) : undefined;
  const smtpUser = process.env.SMTP_USER;
  const smtpPass = process.env.SMTP_PASS;
  const fromEmail = process.env.FROM_EMAIL || smtpUser || 'noreply@lms.com';

  // If SMTP is not configured, log to console
  if (!smtpHost || !smtpPort || !smtpUser || !smtpPass) {
    console.log('📧 Email (SMTP not configured - logging instead):');
    console.log('To:', to);
    console.log('Subject:', subject);
    console.log('Text:', text || html.replace(/<[^>]*>/g, ''));
    console.log('HTML:', html);
    return { success: true };
  }

  try {
    // Create transporter
    const transporter = nodemailer.createTransport({
      host: smtpHost,
      port: smtpPort,
      secure: smtpPort === 465, // true for 465, false for other ports
      auth: {
        user: smtpUser,
        pass: smtpPass,
      },
    });

    // Send mail
    const info = await transporter.sendMail({
      from: `"LMS Platform" <${fromEmail}>`,
      to,
      subject,
      text: text || html.replace(/<[^>]*>/g, ''),
      html,
    });

    console.log('📧 Email sent successfully:', info.messageId);
    return { success: true };
  } catch (error: any) {
    console.error('❌ Email sending failed:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Helper function to create leave request notification email
 */
export function createLeaveRequestEmail(requesterName: string, leaveType: string, fromDate: string, toDate: string, reason: string): string {
  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background-color: #3b82f6; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
          .content { background-color: #f9fafb; padding: 20px; border-radius: 0 0 8px 8px; }
          .details { background-color: white; padding: 15px; margin: 15px 0; border-radius: 4px; border-left: 4px solid #3b82f6; }
          .footer { text-align: center; margin-top: 20px; color: #6b7280; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h2>Leave Request Submitted</h2>
          </div>
          <div class="content">
            <p>Hello,</p>
            <p><strong>${requesterName}</strong> has submitted a leave request.</p>
            <div class="details">
              <p><strong>Type:</strong> ${leaveType}</p>
              <p><strong>From:</strong> ${new Date(fromDate).toLocaleDateString()}</p>
              <p><strong>To:</strong> ${new Date(toDate).toLocaleDateString()}</p>
              <p><strong>Reason:</strong> ${reason}</p>
            </div>
            <p>Please review and respond to this request.</p>
          </div>
          <div class="footer">
            <p>LMS Platform - Automated Notification</p>
          </div>
        </div>
      </body>
    </html>
  `;
}

/**
 * Helper function to create leave approval/rejection email
 */
export function createLeaveStatusEmail(requesterName: string, leaveType: string, status: 'APPROVED' | 'REJECTED', fromDate: string, toDate: string, remarks?: string): string {
  const statusColor = status === 'APPROVED' ? '#10b981' : '#ef4444';
  const statusText = status === 'APPROVED' ? 'Approved' : 'Rejected';

  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background-color: ${statusColor}; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
          .content { background-color: #f9fafb; padding: 20px; border-radius: 0 0 8px 8px; }
          .details { background-color: white; padding: 15px; margin: 15px 0; border-radius: 4px; border-left: 4px solid ${statusColor}; }
          .footer { text-align: center; margin-top: 20px; color: #6b7280; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h2>Leave Request ${statusText}</h2>
          </div>
          <div class="content">
            <p>Hello ${requesterName},</p>
            <p>Your leave request has been <strong>${statusText.toLowerCase()}</strong>.</p>
            <div class="details">
              <p><strong>Type:</strong> ${leaveType}</p>
              <p><strong>From:</strong> ${new Date(fromDate).toLocaleDateString()}</p>
              <p><strong>To:</strong> ${new Date(toDate).toLocaleDateString()}</p>
              ${remarks ? `<p><strong>Remarks:</strong> ${remarks}</p>` : ''}
            </div>
            ${status === 'APPROVED' ? '<p>Your leave request has been approved. Please plan accordingly.</p>' : '<p>If you have any concerns, please contact the administrator.</p>'}
          </div>
          <div class="footer">
            <p>LMS Platform - Automated Notification</p>
          </div>
        </div>
      </body>
    </html>
  `;
}
