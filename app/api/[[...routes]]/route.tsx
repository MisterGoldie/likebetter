/** @jsxImportSource frog/jsx */
import { Button, Frog } from 'frog'
import { devtools } from 'frog/dev'
import { handle } from 'frog/next'
import { serveStatic } from 'frog/serve-static'
import { db } from '@/lib/firebase'
import { neynar } from 'frog/middlewares'

// API Constants
const AIRSTACK_API_URL = 'https://api.airstack.xyz/gql';
const AIRSTACK_API_KEY = process.env.AIRSTACK_API_KEY as string;
const NEYNAR_API_KEY = process.env.NEYNAR_API_KEY as string;

// Get Farcaster username from FID
async function getUsername(fid: string): Promise<string> {
  const query = `
    query ($fid: String!) {
      Socials(input: {filter: {dappName: {_eq: farcaster}, userId: {_eq: $fid}}, blockchain: ethereum}) {
        Social {
          profileName
        }
      }
    }
  `;

  try {
    const response = await fetch(AIRSTACK_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': AIRSTACK_API_KEY,
      },
      body: JSON.stringify({ query, variables: { fid } }),
    });

    const data = await response.json();
    return data?.data?.Socials?.Social?.[0]?.profileName || 'Player';
  } catch (error) {
    console.error('Error fetching username:', error);
    return 'Player';
  }
}

// Get user's Farcaster addresses
async function getFarcasterAddressesFromFID(fid: string): Promise<string[]> {
  const query = `
    query MyQuery($identity: Identity!) {
      Socials(
        input: {
          filter: { dappName: { _eq: farcaster }, identity: { _eq: $identity } }
          blockchain: ethereum
        }
      ) {
        Social {
          userAddress
          userAssociatedAddresses
        }
      }
    }
  `;

  try {
    const response = await fetch(AIRSTACK_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': AIRSTACK_API_KEY,
      },
      body: JSON.stringify({ 
        query, 
        variables: { identity: `fc_fid:${fid}` } 
      }),
    });

    const data = await response.json();
    
    if (!data?.data?.Socials?.Social?.[0]) {
      return [];
    }

    const social = data.data.Socials.Social[0];
    const addresses = [social.userAddress, ...(social.userAssociatedAddresses || [])];
    return Array.from(new Set(addresses)); // Remove duplicates
  } catch (error) {
    console.error('Error fetching Farcaster addresses:', error);
    return [];
  }
}

// Initialize Frog app with Neynar middleware
export const app = new Frog({
  basePath: '/api',
  imageOptions: {
    width: 1080,
    height: 1080,
  },
  imageAspectRatio: '1:1',
  title: 'Farcaster Fan Token Tracker',
  hub: AIRSTACK_API_KEY ? {
    apiUrl: "https://hubs.airstack.xyz",
    fetchOptions: {
      headers: {
        "x-airstack-hubs": AIRSTACK_API_KEY,
      }
    }
  } : undefined
});

app.use(
  neynar({
    apiKey: NEYNAR_API_KEY,
    features: ['interactor', 'cast'],
  })
);

// Helper function to get vote counts
async function getVoteCounts() {
  const snapshot = await db.collection('votes').get()
  let yes = 0
  let no = 0
  
  snapshot.forEach(doc => {
    if (doc.data().vote === 'YES') yes++
    if (doc.data().vote === 'NO') no++
  })
  
  return { yes, no }
}

// Helper function to calculate percentages
function calculatePercentages(yes: number, no: number) {
  const total = yes + no
  if (total === 0) return { yes: 0, no: 0 }
  
  return {
    yes: Math.round((yes / total) * 100),
    no: Math.round((no / total) * 100)
  }
}

// Add this helper function at the top with other helpers
function constructShareUrl(userId: string, vote: string, counts: { yes: number, no: number }) {
  const shareText = `I voted ${vote} on whether Bitcoin will hit $100K this week! Current results - Yes: ${counts.yes}, No: ${counts.no}. Vote now! Frame by @goldie`;
  
  // Construct the share URL as a Farcaster frame
  const shareUrl = new URL('https://goldiesnftframes.xyz/api');
  shareUrl.searchParams.append('fid', userId);
  
  // Construct the Farcaster share URL
  return `https://warpcast.com/~/compose?text=${encodeURIComponent(shareText)}&embeds[]=${encodeURIComponent(shareUrl.toString())}`;
}

app.frame('/', async (c) => {
  return c.res({
    image: "https://bafybeibxsg4r6prc4k5v5klq4bx4oj7nay53ltnpmzumkxtxou3xlbumwq.ipfs.w3s.link/Group%2062%20(5).png",
    imageAspectRatio: '1:1',
    intents: [
      <Button action="/vote" value="YES">Yes</Button>,
      <Button action="/vote" value="NO">No</Button>
    ],
  })
})

app.frame('/vote', async (c) => {
  const { buttonValue } = c
  const userId = c.frameData?.fid?.toString()
  
  if (!userId) {
    return c.res({
      image: "https://bafybeiga2qjlywwqwquzd72gtxfyrltjupesucvpffr7hblw4fodv5r7fe.ipfs.w3s.link/Group%2062%20(3).png",
      imageAspectRatio: '1:1',
      intents: [
        <Button>Please sign in to vote</Button>
      ],
    })
  }

  // Check if user has already voted
  const userVoteRef = db.collection('votes').doc(userId)
  const userVote = await userVoteRef.get()
  
  if (userVote.exists) {
    return c.res({
      image: "https://bafybeigmlsqkjwg4wvig7eedv7mynlbvwbuzzm4zhjjirmx3ekhkeipr7q.ipfs.w3s.link/Farcaster%20(81).png",
      imageAspectRatio: '1:1',
      intents: [
        <Button action="/results">View Results</Button>,
        <Button action="/">Back to Poll</Button>
      ],
    })
  }

  // Record new vote
  await userVoteRef.set({
    userId,
    vote: buttonValue,
    timestamp: Date.now()
  })

  if (buttonValue === 'YES') {
    return c.res({
      image: "https://bafybeihnjhwwrscp2ercv5f4xdfyyiblpteslordcseht6lqbljgnilvn4.ipfs.w3s.link/Farcaster%20(74).png",
      imageAspectRatio: '1:1',
      intents: [
        <Button action="/results">View Results</Button>,
        <Button action="/">Back to Poll</Button>
      ],
    })
  }
  
  return c.res({
    image: "https://bafybeiaudldqpo24mdcwqfimkfiidclrwf4urgi6533eml5pxjimniqbou.ipfs.w3s.link/Farcaster%20(75).png",
    imageAspectRatio: '1:1',
    intents: [
      <Button action="/results">View Results</Button>,
      <Button action="/">Back to Poll</Button>
    ],
  })
})

app.frame('/results', async (c) => {
  const counts = await getVoteCounts()
  
  return c.res({
    image: "https://bafybeiceogeecf44c3fyqob3retsdwfoqesnttov4ze55tat4qksa3p74m.ipfs.w3s.link/Farcaster%20(80).png",
    imageAspectRatio: '1:1',
    intents: [
      <Button>Yes: {counts.yes.toString()}</Button>,
      <Button>No: {counts.no.toString()}</Button>,
      <Button action="/">Back to Poll</Button>,
      <Button.Link href={`https://warpcast.com/~/compose?text=${encodeURIComponent('Vote on whether /bitcoin will hit $100K this week! Frame by @goldie')}&embeds[]=${encodeURIComponent('https://goldiesnftframes.xyz/api')}`}>Share Frame</Button.Link>
    ],
  })
})

app.frame('/share', async (c) => {
  const userId = c.frameData?.fid?.toString()
  
  if (!userId) {
    return c.res({
      image: "https://bafybeiga2qjlywwqwquzd72gtxfyrltjupesucvpffr7hblw4fodv5r7fe.ipfs.w3s.link/Group%2062%20(3).png",
      imageAspectRatio: '1:1',
      intents: [
        <Button>Please sign in to share</Button>
      ],
    })
  }

  // Get user's vote and current counts
  const userVoteRef = db.collection('votes').doc(userId)
  const userVote = await userVoteRef.get()
  const counts = await getVoteCounts()
  
  if (!userVote.exists) {
    return c.res({
      image: "https://bafybeiga2qjlywwqwquzd72gtxfyrltjupesucvpffr7hblw4fodv5r7fe.ipfs.w3s.link/Group%2062%20(3).png",
      imageAspectRatio: '1:1',
      intents: [
        <Button>Vote first to share!</Button>,
        <Button action="/">Back to Poll</Button>
      ],
    })
  }

  const shareUrl = constructShareUrl(userId, userVote.data()?.vote, counts)

  return c.res({
    image: "https://bafybeiceogeecf44c3fyqob3retsdwfoqesnttov4ze55tat4qksa3p74m.ipfs.w3s.link/Farcaster%20(80).png",
    imageAspectRatio: '1:1',
    intents: [
      <Button.Link href={shareUrl}>Share to Warpcast</Button.Link>,
      <Button action="/">Back to Poll</Button>
    ],
  })
})

devtools(app, { serveStatic })

export const GET = handle(app)
export const POST = handle(app)
//