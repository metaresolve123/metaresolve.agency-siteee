import { createLeadRecord, PlatformType } from '../serverStorage';

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, error: 'Method not allowed' });
  }

  try {
    const {
      fullName,
      name,
      email,
      phone,
      service,
      details,
      platform,
      accountType,
      banReason,
      accountHandle,
      urgency,
      caseId
    } = req.body || {};

    const clientName = (name || fullName || '').trim();
    const clientEmail = (email || '').trim();
    const clientPhone = (phone || '').trim();
    const caseDetails = (details || '').trim();

    if (!clientName) {
      return res.status(400).json({ success: false, error: 'Client name is required.' });
    }

    if (!clientEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(clientEmail)) {
      return res.status(400).json({ success: false, error: 'A valid email address is required.' });
    }

    if (!clientPhone || clientPhone.length < 5) {
      return res.status(400).json({ success: false, error: 'A valid phone/WhatsApp number is required.' });
    }

    if (!caseDetails || caseDetails.length < 5) {
      return res.status(400).json({ success: false, error: 'Case description is required.' });
    }

    const newLead = createLeadRecord({
      name: clientName,
      email: clientEmail,
      phone: clientPhone,
      service: service ? String(service).trim() : undefined,
      platform: platform as PlatformType,
      accountType: accountType ? String(accountType).trim() : undefined,
      banReason: banReason ? String(banReason).trim() : undefined,
      accountHandle: accountHandle ? String(accountHandle).trim() : undefined,
      details: caseDetails,
      urgency: urgency === 'standard' ? 'standard' : 'critical',
      caseId: caseId ? String(caseId).trim() : undefined
    });

    return res.status(201).json({
      success: true,
      message: 'Case created and recorded successfully in Admin Case Pipeline.',
      caseId: newLead.id,
      lead: newLead
    });
  } catch (err: any) {
    console.error('Serverless leads handler error:', err);
    return res.status(500).json({ success: false, error: 'Internal server error' });
  }
}
