import { findUserByEmail, createUserRecord, createSession, saveAllUsers, getAllUsers, sanitizeUser } from '../../serverStorage';

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, error: 'Method not allowed' });
  }

  try {
    const { credential } = req.body || {};
    if (!credential || typeof credential !== 'string') {
      return res.status(400).json({ success: false, error: 'Google credential token is required' });
    }

    const parts = credential.split('.');
    if (parts.length !== 3) {
      return res.status(400).json({ success: false, error: 'Malformed Google credential token' });
    }

    const payloadJson = Buffer.from(parts[1], 'base64url').toString('utf8');
    const payload = JSON.parse(payloadJson);

    if (!payload.email) {
      return res.status(400).json({ success: false, error: 'Invalid Google token: email missing' });
    }

    let user = findUserByEmail(payload.email);
    if (!user) {
      const created = createUserRecord({
        name: payload.name || payload.email.split('@')[0],
        email: payload.email,
        authProvider: 'google',
        googleId: payload.sub,
        avatarUrl: payload.picture,
      });
      user = created.user;
    } else {
      if (!user.googleId) user.googleId = payload.sub;
      if (payload.picture && !user.avatarUrl) user.avatarUrl = payload.picture;
      saveAllUsers(getAllUsers().map((u) => (u.id === user!.id ? user! : u)));
    }

    const session = createSession(user.id, true);
    return res.status(200).json({
      success: true,
      token: session.token,
      user: sanitizeUser(user),
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err?.message || 'Failed to verify Google token' });
  }
}
