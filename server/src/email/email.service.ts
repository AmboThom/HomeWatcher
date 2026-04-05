import { Resend } from 'resend';
import { config } from '../config';

const resend = new Resend(config.email.resendApiKey);

interface SendEmailOptions {
  to: string;
  subject: string;
  html: string;
}

async function sendEmail(options: SendEmailOptions): Promise<void> {
  if (!config.email.resendApiKey) {
    console.warn('RESEND_API_KEY not set — skipping email');
    return;
  }

  const { error } = await resend.emails.send({
    from: config.email.from,
    to: options.to,
    subject: options.subject,
    html: options.html,
  });

  if (error) {
    console.error('Failed to send email:', error);
  }
}

export function sendMaintenanceRequestNotification(params: {
  landlordEmail: string;
  landlordName: string;
  tenantName: string;
  propertyName: string;
  title: string;
  priority: string;
}): void {
  sendEmail({
    to: params.landlordEmail,
    subject: `New maintenance request — ${params.propertyName}`,
    html: `
      <p>Hi ${params.landlordName},</p>
      <p>A new maintenance request has been submitted for <strong>${params.propertyName}</strong>.</p>
      <p><strong>Title:</strong> ${params.title}<br/>
      <strong>Priority:</strong> ${params.priority}</p>
      <p>Submitted by ${params.tenantName}.</p>
      <p>Log in to HomeWatcher to view and manage the request.</p>
    `,
  });
}

export function sendStatusUpdateNotification(params: {
  tenantEmail: string;
  tenantName: string;
  propertyName: string;
  title: string;
  status: string;
}): void {
  const statusLabel: Record<string, string> = {
    open: 'Open',
    in_progress: 'In Progress',
    resolved: 'Resolved',
  };

  sendEmail({
    to: params.tenantEmail,
    subject: `Maintenance request updated — ${params.propertyName}`,
    html: `
      <p>Hi ${params.tenantName},</p>
      <p>Your maintenance request for <strong>${params.propertyName}</strong> has been updated.</p>
      <p><strong>Request:</strong> ${params.title}<br/>
      <strong>New status:</strong> ${statusLabel[params.status] ?? params.status}</p>
      <p>Log in to HomeWatcher to view the details.</p>
    `,
  });
}
