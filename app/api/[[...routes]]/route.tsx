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

app.frame('/', async (c) => {
  const userId = c.frameData?.fid?.toString()
  const counts = await getVoteCounts()
  const percentages = calculatePercentages(counts.yes, counts.no)
  
  // Check if user has voted
  let hasVoted = false
  if (userId) {
    const userVoteRef = db.collection('votes').doc(userId)
    const userVote = await userVoteRef.get()
    hasVoted = userVote.exists
  }
  
  return c.res({
    image: `https://bafybeibxsg4r6prc4k5v5klq4bx4oj7nay53ltnpmzumkxtxou3xlbumwq.ipfs.w3s.link/Group%2062%20(5).png?votes=yes:${counts.yes}%20no:${counts.no}`,
    imageAspectRatio: '1:1',
    intents: [
      <Button action="/vote" value="YES">Yes ({percentages.yes.toString()}%)</Button>,
      <Button action="/vote" value="NO">No ({percentages.no.toString()}%)</Button>,
      ...(hasVoted ? [<Button action="/stats">View Stats</Button>] : []),
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

  // Update or create vote
  const userVoteRef = db.collection('votes').doc(userId)
  await userVoteRef.set({
    userId,
    vote: buttonValue,
    timestamp: Date.now()
  }, { merge: true })

  if (buttonValue === 'YES') {
    return c.res({
      image: "https://bafybeihnjhwwrscp2ercv5f4xdfyyiblpteslordcseht6lqbljgnilvn4.ipfs.w3s.link/Farcaster%20(74).png",
      imageAspectRatio: '1:1',
      intents: [
        <Button action="/vote" value="YES">Yes</Button>,
        <Button action="/vote" value="NO">No</Button>,
        <Button action="/stats">View Stats</Button>,
      ],
    })
  }
  
  return c.res({
    image: "https://bafybeiaudldqpo24mdcwqfimkfiidclrwf4urgi6533eml5pxjimniqbou.ipfs.w3s.link/Farcaster%20(75).png",
    imageAspectRatio: '1:1',
    intents: [
      <Button action="/vote" value="YES">Yes</Button>,
      <Button action="/vote" value="NO">No</Button>,
      <Button action="/stats">View Stats</Button>,
    ],
  })
})

app.frame('/stats', async (c) => {
  const counts = await getVoteCounts()
  const percentages = calculatePercentages(counts.yes, counts.no)
  const total = counts.yes + counts.no
  
  return c.res({
    image: "https://bafybeiceogeecf44c3fyqob3retsdwfoqesnttov4ze55tat4qksa3p74m.ipfs.w3s.link/Farcaster%20(80).png",
    imageAspectRatio: '1:1',
    intents: [
      <Button>Total Votes: {total.toString()}</Button>,
      <Button>Yes: {counts.yes.toString()} ({percentages.yes.toString()}%)</Button>,
      <Button>No: {counts.no.toString()} ({percentages.no.toString()}%)</Button>,
      <Button action="/">Back to Poll</Button>
    ],
  })
})

devtools(app, { serveStatic })

export const GET = handle(app)
export const POST = handle(app)
//