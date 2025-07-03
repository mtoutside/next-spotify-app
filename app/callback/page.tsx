'use client';
import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import styles from '../page.module.css';

export default function Callback() {
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const code = searchParams.get('code');
    if (code) {
      saveTokenData(code);
    } else {
      setError('No authorization code found');
    }
  }, []);


  const saveTokenData = async (code: string) => {
    const codeVerifier = sessionStorage.getItem('codeVerifier');
    try {
      const response = await fetch('/api/auth/token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code, code_verifier: codeVerifier }),
      });
      const data = await response.json();

      if (data.access_token && data.refresh_token && data.expires_in) {
        sessionStorage.setItem('access_token', data.access_token);
        sessionStorage.setItem('refresh_token', data.refresh_token);
        sessionStorage.setItem('expires_at', (Date.now() + data.expires_in * 1000).toString());
        router.push('/');
      } else {
        setError('Failed to obtain access token');
      }
    } catch (err) {
      setError(`An error occurred while exchanging token: ${err}`);
      console.error(err);
    }
  };

  return (
    <div className={styles.page}>
      <main className={styles.main}>
        <h1>Processing authentication...</h1>
        {error && <p className={styles.error}>{error}</p>}
      </main>
    </div>
  );
}
