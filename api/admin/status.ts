import { authenticateServerlessRequest, getAdminUsername, getAdminPassword, serverlessSessions } from '../_auth';

export default async function handler(req: any, res: any) {
  if (req.method !== 'GET') {
    return res.status(405).json({ success: false, error: 'Method not allowed' });
  }

  const session = authenticateServerlessRequest(req);
  if (!session) {
    return res.status(401).json({ success: false, error: 'Unauthorized' });
  }

  return res.status(200).json({
    success: true,
    username: getAdminUsername(),
    hasEnvPasswordConfigured: Boolean(getAdminPassword()),
    activeSessionsCount: serverlessSessions.size
  });
}
