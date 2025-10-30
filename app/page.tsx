'use client';

import { PrivyProvider, usePrivy, useWallets } from '@privy-io/react-auth';
import { createBrowserClient } from '@supabase/supabase-js';
import { useEffect, useState } from 'react';

const supabase = createBrowserClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function Home() {
  return (
    <PrivyProvider appId={process.env.NEXT_PUBLIC_PRIVY_APP_ID!}>
      <Bungalow />
    </PrivyProvider>
  );
}

function Bungalow() {
  const { login, authenticated, user } = usePrivy();
  const { wallets } = useWallets();
  const [winner, setWinner] = useState(null);
  const [subsCount, setSubsCount] = useState(0);

  useEffect(() => {
    const fetchSubs = async () => {
      const { count } = await supabase
        .from('subs')
        .select('*', { count: 'exact', head: true })
        .gt('last_ping', new Date(Date.now() - 60 * 24 * 3600 * 1000).toISOString());
      setSubsCount(count || 0);
    };
    fetchSubs();
    const int = setInterval(fetchSubs, 5000);
    return () => clearInterval(int);
  }, []);

  useEffect(() => {
    if (authenticated && user?.twitter && wallets.length > 0) {
      supabase.from('subs').upsert({
        twitter_id: user.twitter.id,
        twitter_username: user.twitter.username || '',
        wallet_base: wallets.find(w => w.chainId === '8453')?.address || '',
        wallet_sol: wallets.find(w => w.chainId === '99999999')?.address || '',
        last_ping: new Date().toISOString(),
      });
    }
  }, [authenticated, user, wallets]);

  const spin = async () => {
    const { data } = await supabase
      .from('subs')
      .select()
      .gt('last_ping', new Date(Date.now() - 60 * 24 * 3600 * 1000).toISOString());
    if (!data?.length) return alert('Login 2x first!');
    const rand = data[Math.floor(Math.random() * data.length)];
    setWinner(rand);
    alert(`🎉 **WINNER: @${rand.twitter_username || rand.twitter_id.slice(-8)}** 💰`);
  };

  if (!authenticated) {
    return (
      <div style={{padding: 100, textAlign: 'center'}}>
        <h1 style={{fontSize: 48}}>🏝️ The Bungalow</h1>
        <p>{subsCount} VIPs Live</p>
        <button onClick={login} style={{padding: 20, fontSize: 20, background: '#1d9bf0', color: 'white'}}>
          Login X → Auto-Enter
        </button>
      </div>
    );
  }

  return (
    <div style={{padding: 100, textAlign: 'center'}}>
      <h1 style={{fontSize: 48}}>🏝️ The Bungalow</h1>
      <p>{subsCount} Active VIPs</p>
      <button onClick={spin} style={{padding: 20, fontSize: 20, background: 'green', color: 'white'}}>
        🎰 SPIN WINNER!
      </button>
      {winner && <h2>WINNER: @{winner.twitter_username || winner.twitter_id.slice(-8)}</h2>}
    </div>
  );
}
