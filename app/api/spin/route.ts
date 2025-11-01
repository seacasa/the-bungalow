import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { createWalletClient, http, parseUnits } from 'viem';
import { privateKeyToAccount } from 'viem/accounts';
import { base } from 'viem/chains';
import { erc20Abi, erc721Abi } from '../../../lib/abis';

const supabaseService = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process
