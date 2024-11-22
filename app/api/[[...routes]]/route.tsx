/** @jsxImportSource frog/jsx */
import { Button, Frog } from 'frog'
import { handle } from 'frog/next'
import { neynar } from 'frog/middlewares'
import { NeynarVariables } from 'frog/middlewares'
import { db } from '@/lib/firebase'

// API Constants
const AIRSTACK_API_KEY = process.env.AIRSTACK_API_KEY as string;
const AIRSTACK_API_KEY_SECONDARY = process.env.AIRSTACK_API_KEY_SECONDARY as string;
const NEYNAR_API_KEY = process.env.NEYNAR_API_KEY as string;

// Bypass helper
function canBypassVoteCheck(fid: string): boolean {
  return fid === '7472'; // Your FID for testing
}

const app = new Frog<{ Variables: NeynarVariables }>({
  basePath: '/api',
  imageOptions: {
    width: 1080,
    height: 1080,
  },
  imageAspectRatio: '1:1',
  title: 'Tic-Tac-Maxi Game',
  hub: {
    apiUrl: "https://hubs.airstack.xyz",
    fetchOptions: {
      headers: {
        "x-airstack-hubs": AIRSTACK_API_KEY,
        "x-airstack-hubs-secondary": AIRSTACK_API_KEY_SECONDARY
      }
    }
  }
}).use(
  neynar({
    apiKey: NEYNAR_API_KEY, 
    features: ['interactor', 'cast'],
  })
);

// Export Next.js route handlers
export const GET = handle(app);
export const POST = handle(app);
//