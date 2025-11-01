'use client';

import { PrivyProvider, usePrivy, useWallets } from '@privy-io/react-auth';
import { createClient } from '@supabase/supabase-js';
import { useEffect, useState } from 'react';
import { base } from 'viem/chains';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function Home() {
  return (
    <PrivyProvider
      appId={process.env.NEXT_PUBLIC_PRIVY_APP
