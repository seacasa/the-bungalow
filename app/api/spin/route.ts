import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { createWalletClient, http, parseUnits } from 'viem';
import { privateKeyToAccount } from 'viem/accounts';
import { base } from 'viem/chains';
import { erc20Abi, erc721Abi } from '../../../lib/abis';

const supabaseService = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST() {
  try {
    const cutoff = new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString();
    const { data: subs } = await supabaseService
      .from('subs')
      .select('*')
      .gt('last_ping', cutoff);
    if (!subs?.length) return NextResponse.json({ error: 'No active subs' }, { status: 400 });

    const { data: gives } = await supabaseService
      .from('giveaways')
      .select('*')
      .eq('claimed', false);
    if (!gives?.length) return NextResponse
