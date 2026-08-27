import { authenticateServerlessRequest } from '../_auth';
import {
  getAllLeads,
  createLeadRecord,
  updateLeadStatusRecord,
  updateLeadNotesRecord,
  deleteLeadRecord,
  LeadStatus
} from '../../serverStorage';

export default async function handler(req: any, res: any) {
  const session = authenticateServerlessRequest(req);
  if (!session) {
    return res.status(401).json({ success: false, error: 'Unauthorized: Valid admin session required.' });
  }

  const { method } = req;

  if (method === 'GET') {
    const leads = getAllLeads();
    return res.status(200).json({ success: true, leads });
  }

  if (method === 'POST') {
    const { action, id, status, notes, ...leadData } = req.body || {};

    if (action === 'update_status' && id) {
      const updated = updateLeadStatusRecord(id, status as LeadStatus);
      if (!updated) return res.status(404).json({ success: false, error: 'Case not found' });
      return res.status(200).json({ success: true, lead: updated });
    }

    if (action === 'update_notes' && id) {
      const updated = updateLeadNotesRecord(id, notes || '');
      if (!updated) return res.status(404).json({ success: false, error: 'Case not found' });
      return res.status(200).json({ success: true, lead: updated });
    }

    if (action === 'delete' && id) {
      const deleted = deleteLeadRecord(id);
      if (!deleted) return res.status(404).json({ success: false, error: 'Case not found' });
      return res.status(200).json({ success: true, message: 'Case deleted successfully' });
    }

    // Standard manual lead creation
    const lead = createLeadRecord(leadData);
    return res.status(201).json({ success: true, lead });
  }

  if (method === 'PATCH') {
    const { id, status, notes } = req.body || {};
    if (!id) {
      return res.status(400).json({ success: false, error: 'Case ID is required' });
    }

    if (status) {
      const updated = updateLeadStatusRecord(id, status as LeadStatus);
      if (!updated) return res.status(404).json({ success: false, error: 'Case not found' });
      return res.status(200).json({ success: true, lead: updated });
    }

    if (notes !== undefined) {
      const updated = updateLeadNotesRecord(id, notes);
      if (!updated) return res.status(404).json({ success: false, error: 'Case not found' });
      return res.status(200).json({ success: true, lead: updated });
    }
  }

  if (method === 'DELETE') {
    const id = req.query?.id || req.body?.id;
    if (!id) {
      return res.status(400).json({ success: false, error: 'Case ID is required' });
    }

    const deleted = deleteLeadRecord(String(id));
    if (!deleted) return res.status(404).json({ success: false, error: 'Case not found' });
    return res.status(200).json({ success: true, message: 'Case deleted successfully' });
  }

  return res.status(405).json({ success: false, error: 'Method not allowed' });
}
