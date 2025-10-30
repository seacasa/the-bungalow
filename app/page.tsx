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

  use
