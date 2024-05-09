// Here we export some useful types and functions for interacting with the Anchor program.
import {  PublicKey } from '@solana/web3.js';
// import  { Farming } from './types/farming';
// import { IDL as FarmingIDL } from './types/farming';

// Re-export the generated IDL and type
// export { Farming, FarmingIDL };

// After updating your program ID (e.g. after running `anchor keys sync`) update the value below.
export const FARMING_PROGRAM_ID = new PublicKey(
  'AFWVC6Apsx8QTiobptqzM8F1vNL9y9ie6mpdcGa4viqb'
);

// This is a helper function to get the program ID for the Farming program depending on the cluster.
export function getFarmingProgramId(cluster) {
  switch (cluster) {
    case 'devnet':
    case 'testnet':
    case 'mainnet-beta':
    default:
      return FARMING_PROGRAM_ID;
  }
}
