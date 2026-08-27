import { getStoredSiteConfig } from '../serverStorage';

export default async function handler(req: any, res: any) {
  if (req.method !== 'GET') {
    return res.status(405).json({ success: false, error: 'Method not allowed' });
  }

  const config = getStoredSiteConfig();
  return res.status(200).json({ success: true, config });
}
