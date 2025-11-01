'use client';

import { PrivyProvider, usePrivy, useWallets } from '@privy-io/react-auth';
import { createClient } from '@supabase/supabase-js';
import { useEffect, useState } from 'react';

const supabase = createClient(
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

  useEffect(() => {
    if (authenticated && user?.twitter && wallets.length) {
      // @ts-ignore
      supabase.from('subs').upsert({
        twitter_id: user.twitter.id,
        wallet_base: wallets.find(w => w.chainId === 8453)?.address || '',
        wallet_sol: wallets.find(w => w.chainId === 99999999)?.address || '',
        last_ping: new Date().toISOString(),
      });
    }
  }, [authenticated
