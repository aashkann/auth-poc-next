// pages/api/speckle-callback.ts

import { NextApiRequest, NextApiResponse } from 'next';
import { exchangeAccessCode } from '../../lib/auth'; // Adjust the import path as needed
import { cookies } from 'next/headers';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const requestCookies = cookies(req);
  const responseCookies = cookies(res);

  const { code } = req.query;
  if (!code || typeof code !== 'string') {
    return res.status(400).json({ error: 'Authorization code is required.' });
  }

  try {
    const { token, refreshToken } = await exchangeAccessCode(code);

    // Securely set tokens in HTTPOnly cookies
    responseCookies.set('token', token, { httpOnly: true, secure: true, path: '/', maxAge: 3600 });
    responseCookies.set('refreshToken', refreshToken, { httpOnly: true, secure: true, path: '/', maxAge: 86400 });

    // Redirect to home page or another destination without the access code in the URL
    res.redirect(302, '/');
  } catch (error) {
    console.error('Error exchanging access code:', error);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
}
