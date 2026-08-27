import { authenticateServerlessRequest } from '../_auth';
import { updateStoredSiteConfig } from '../../serverStorage';

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, error: 'Method not allowed' });
  }

  const session = authenticateServerlessRequest(req);
  if (!session) {
    return res.status(401).json({ success: false, error: 'Unauthorized' });
  }

  const config = updateStoredSiteConfig(req.body || {});
  return res.status(200).json({ success: true, config });
}
