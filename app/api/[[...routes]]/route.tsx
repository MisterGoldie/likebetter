/** @jsxImportSource frog/jsx */
import { Button, Frog } from 'frog'
import { devtools } from 'frog/dev'
import { handle } from 'frog/next'
import { serveStatic } from 'frog/serve-static'
import { db } from '@/lib/firebase'

const app = new Frog({
  assetsPath: '/',
  basePath: '/api',
  title: 'Poll',
})

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
  const shareText = `I voted ${vote} on whether Bitcoin will hit $100K today! Current results - Yes: ${counts.yes}, No: ${counts.no}. Vote now! Frame by @goldie`;
  
  // Construct the share URL as a Farcaster frame
  const shareUrl = new URL('https://goldiesnftframes.xyz/api');
  shareUrl.searchParams.append('fid', userId);
  
  // Construct the Farcaster share URL
  return `https://warpcast.com/~/compose?text=${encodeURIComponent(shareText)}&embeds[]=${encodeURIComponent(shareUrl.toString())}`;
}

// Add this helper function
function canBypassVoteCheck(fid: string): boolean {
  return fid === '7472'; // Your FID for testing
}

app.frame('/', async (c) => {
  return c.res({
    image: "https://bafybeia5u2gao7y65ny3qp73m3ctmvqofvzspz3vi3veclwddxkhsy5lcu.ipfs.w3s.link/Frame%2067.png",
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

  // Check if user has already voted (skip check for FID 7472)
  const userVoteRef = db.collection('votes').doc(userId)
  const userVote = await userVoteRef.get()
  
  if (userVote.exists && !canBypassVoteCheck(userId)) {
    return c.res({
      image: "https://bafybeia6oa7cvd7bj6ttwkunq3xghbw3vcmzqhzsa6gdiunhlznga5b7uq.ipfs.w3s.link/Frame%2067%20(1).png",
      imageAspectRatio: '1:1',
      intents: [
        <Button action="/results">View Results</Button>,
        <Button action="/">Back to Poll</Button>
      ],
    })
  }

  // If FID 7472, create a unique document ID to allow multiple votes
  const docId = canBypassVoteCheck(userId) 
    ? `${userId}_${Date.now()}` // Unique ID for each vote
    : userId;

  // Record new vote
  await db.collection('votes').doc(docId).set({
    userId,
    vote: buttonValue,
    timestamp: Date.now()
  })

  if (buttonValue === 'YES') {
    return c.res({
      image: "https://bafybeifzynkkdfgdttdmux65s6buty22zhxm5zhipuitgzrrb4ty3yrsha.ipfs.w3s.link/Frame%2067%20(3).png",
      imageAspectRatio: '1:1',
      intents: [
        <Button action="/results">View Results</Button>,
        <Button action="/">Back to Poll</Button>
      ],
    })
  }
  
  return c.res({
    image: "https://bafybeihsbgvreneltxlehbbvwm63r5ufweqmgnu6thuiatwazytf2vh47a.ipfs.w3s.link/Frame%2067%20(5).png",
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
    image: "https://bafybeicdmvkkmagmluzi435faddfx4qxoeiwbmgbgg43kkuis3wewpfg6e.ipfs.w3s.link/Frame%2067%20(2).png",
    imageAspectRatio: '1:1',
    intents: [
      <Button>Yes: {counts.yes.toString()}</Button>,
      <Button>No: {counts.no.toString()}</Button>,
      <Button action="/">Back to Poll</Button>,
      <Button.Link href={`https://warpcast.com/~/compose?text=${encodeURIComponent('Vote on whether /bitcoin will hit $100K today! Frame by @goldie')}&embeds[]=${encodeURIComponent('https://goldiesnftframes.xyz/api')}`}>Share Frame</Button.Link>
    ],
  })
})

app.frame('/share', async (c) => {
  const userId = c.frameData?.fid?.toString()
  
  if (!userId) {
    return c.res({
      image: "https://bafybeia5u2gao7y65ny3qp73m3ctmvqofvzspz3vi3veclwddxkhsy5lcu.ipfs.w3s.link/Frame%2067.png",
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
      image: "https://bafybeia6oa7cvd7bj6ttwkunq3xghbw3vcmzqhzsa6gdiunhlznga5b7uq.ipfs.w3s.link/Frame%2067%20(1).png",
      imageAspectRatio: '1:1',
      intents: [
        <Button>Vote first to share!</Button>,
        <Button action="/">Back to Poll</Button>
      ],
    })
  }

  const shareUrl = constructShareUrl(userId, userVote.data()?.vote, counts)

  return c.res({
    image: "https://bafybeicdmvkkmagmluzi435faddfx4qxoeiwbmgbgg43kkuis3wewpfg6e.ipfs.w3s.link/Frame%2067%20(2).png",
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