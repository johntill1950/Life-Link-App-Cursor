"use client";

import React, { useState, useEffect } from 'react';
import { sendSignInEmailLink, completeSignInWithEmailLink, logOut } from '../lib/firebase';
import { getAuth, isSignInWithEmailLink } from 'firebase/auth';

const AuthForm = () => {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [isSignedIn, setIsSignedIn] = useState(false);
  const [awaitingEmailForLink, setAwaitingEmailForLink] = useState(false);
  const [hasMounted, setHasMounted] = useState(false);
  const auth = getAuth();

  useEffect(() => {
    setHasMounted(true);
  }, []);

  useEffect(() => {
    if (!hasMounted) return;
    if (
      typeof window !== 'undefined' &&
      typeof window.location !== 'undefined' &&
      typeof window.location.href === 'string' &&
      window.location.href
    ) {
      const href = window.location.href;
      console.log('DEBUG: window.location.href =', href);
      if (typeof href === 'string' && href.length > 0) {
        try {
          if (isSignInWithEmailLink(auth, href)) {
            const storedEmail = window.localStorage.getItem('emailForSignIn');
            if (storedEmail) {
              completeSignInWithEmailLink().then((result) => {
                if (result) {
                  setIsSignedIn(true);
                  setMessage('Sign in successful!');
                }
              });
            } else {
              setAwaitingEmailForLink(true);
              setMessage('Please enter your email to complete sign-in.');
            }
          }
        } catch (e) {
          setMessage('Error processing sign-in link: ' + ((e as any)?.message || e));
          console.error('Error processing sign-in link:', e);
        }
      } else {
        setMessage('window.location.href is not a valid string.');
        console.error('window.location.href is not a valid string:', href);
      }
    } else {
      setMessage('window.location.href is undefined or not a string.');
      console.error('window.location.href is undefined or not a string:', typeof window !== 'undefined' ? window.location : undefined);
    }
  }, [hasMounted]);

  const handleSendLink = async () => {
    try {
      await sendSignInEmailLink(email);
      setMessage('Sign-in link sent! Check your email.');
    } catch (error: any) {
      setMessage('Error sending sign-in link: ' + error.message);
    }
  };

  const handleCompleteLinkSignIn = async () => {
    try {
      window.localStorage.setItem('emailForSignIn', email);
      const result = await completeSignInWithEmailLink();
      if (result) {
        setIsSignedIn(true);
        setMessage('Sign in successful!');
        setAwaitingEmailForLink(false);
      } else {
        setMessage('Could not complete sign-in.');
      }
    } catch (error: any) {
      setMessage('Error completing sign-in: ' + error.message);
    }
  };

  const handleSignOut = async () => {
    try {
      await logOut();
      setIsSignedIn(false);
      setMessage('Signed out successfully!');
    } catch (error: any) {
      setMessage('Sign out error: ' + error.message);
    }
  };

  return (
    <div style={{ maxWidth: 300, margin: '1rem auto', padding: 16, border: '1px solid #ccc', borderRadius: 8 }}>
      <h3>Passwordless Sign-In</h3>
      <input
        type="email"
        placeholder="Email"
        value={email}
        onChange={e => setEmail(e.target.value)}
        style={{ width: '100%', marginBottom: 8 }}
      />
      <div style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
        {!awaitingEmailForLink && <button onClick={handleSendLink}>Send Sign-In Link</button>}
        {awaitingEmailForLink && <button onClick={handleCompleteLinkSignIn}>Complete Sign-In</button>}
        <button onClick={handleSignOut}>Sign Out</button>
      </div>
      {message && <div style={{ color: message.includes('error') ? 'red' : 'blue' }}>{message}</div>}
    </div>
  );
};

export default AuthForm; 