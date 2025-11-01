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
    if (!gives?.length) return NextResponse.json({ error: 'No giveaways' }, { status: 400 });

    const subIdx = Math.floor(Math.random() * subs.length);
    const giveIdx = Math.floor(Math.random() * gives.length);
    const winner = subs[subIdx];
    const giveaway = gives[giveIdx];

    if (!winner.wallet_base) throw new Error('No Base wallet');

    const account = privateKeyToAccount(`0x${process.env.PRIVATE_KEY!}` as `0x${string}`);
    const walletClient = createWalletClient({
      account,
      chain: base,
      transport: http(),
    });

    let hash: `0x${string}`;
    if (giveaway.type === 'erc20') {
      const amount = parseUnits(giveaway.amount!.toString(), Number(giveaway.decimals));
      hash = await walletClient.writeContract({
        address: giveaway.contract_address as `0x${string}`,
        abi: erc20Abi,
        functionName: 'transfer',
        args: [winner.wallet_base as `0x${string}`, amount],
      });
    } else {
      hash = await walletClient.writeContract({
        address: giveaway.contract_address as `0x${string}`,
        abi: erc721Abi,
        functionName: 'safeTransferFrom',
        args: [account.address, winner.wallet_base as `0x${string}`, BigInt(giveaway.token_id!)],
      });
    }

    await supabaseService.from('giveaways').update({ claimed: true }).eq('id', giveaway.id);

    return NextResponse.json({
      success: true,
      winner,
      tx: hash,
      giveaway: {
        name: giveaway.metadata?.name || 'Prize',
        emoji: giveaway.metadata?.emoji || '🎁',
        image: giveaway.metadata?.image,
      },
    });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
