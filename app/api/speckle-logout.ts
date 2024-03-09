// pages/api/logout.js

import { logout } from '@/lib';
import { redirect } from 'next/navigation';

export default async function handler(req, res) {
  if (req.method === 'POST') {
    await logout();
    // Use redirect for server-side redirection after logout
    return redirect('/');
  } else {
    res.setHeader('Allow', ['POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
