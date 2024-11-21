/** @jsxImportSource frog/jsx */
import { Button, Frog } from 'frog'
import { devtools } from 'frog/dev'
import { handle } from 'frog/next'
import { serveStatic } from 'frog/serve-static'

// Create a simple in-memory store for votes
// Note: This will reset when the server restarts
let votes = {
  yes: 0,
  no: 0
}

const app = new Frog({
  assetsPath: '/',
  basePath: '/api',
  title: 'Poll',
})

// Helper function to calculate percentages
function calculatePercentages() {
  const total = votes.yes + votes.no
  if (total === 0) return { yes: 0, no: 0 }
  
  return {
    yes: Math.round((votes.yes / total) * 100),
    no: Math.round((votes.no / total) * 100)
  }
}

app.frame('/', (c) => {
  const percentages = calculatePercentages()
  
  return c.res({
    image: "https://bafybeibxsg4r6prc4k5v5klq4bx4oj7nay53ltnpmzumkxtxou3xlbumwq.ipfs.w3s.link/Group%2062%20(5).png",
    imageAspectRatio: '1:1',
    intents: [
      <Button action="/vote" value="YES">Yes ({percentages.yes.toString()}%)</Button>,
      <Button action="/vote" value="NO">No ({percentages.no.toString()}%)</Button>,
      <Button action="/stats">View Stats</Button>,
    ],
  })
})

app.frame('/vote', (c) => {
  const { buttonValue } = c
  
  if (buttonValue === 'YES') {
    votes.yes++
    return c.res({
      image: "https://bafybeiga2qjlywwqwquzd72gtxfyrltjupesucvpffr7hblw4fodv5r7fe.ipfs.w3s.link/Group%2062%20(3).png",
      imageAspectRatio: '1:1',
      intents: [
        <Button action="/vote" value="YES">Yes</Button>,
        <Button action="/vote" value="NO">No</Button>,
        <Button action="/stats">View Stats</Button>,
      ],
    })
  } else if (buttonValue === 'NO') {
    votes.no++
    return c.res({
      image: "https://bafybeiaudldqpo24mdcwqfimkfiidclrwf4urgi6533eml5pxjimniqbou.ipfs.w3s.link/Farcaster%20(75).png",
      imageAspectRatio: '1:1',
      intents: [
        <Button action="/vote" value="YES">Yes</Button>,
        <Button action="/vote" value="NO">No</Button>,
        <Button action="/stats">View Stats</Button>,
      ],
    })
  }
  
  // Default return if no button was pressed
  return c.res({
    image: "https://bafybeiga2qjlywwqwquzd72gtxfyrltjupesucvpffr7hblw4fodv5r7fe.ipfs.w3s.link/Group%2062%20(3).png",
    imageAspectRatio: '1:1',
    intents: [
      <Button action="/vote" value="YES">Yes</Button>,
      <Button action="/vote" value="NO">No</Button>,
      <Button action="/stats">View Stats</Button>,
    ],
  })
})

app.frame('/stats', (c) => {
  const percentages = calculatePercentages()
  const total = votes.yes + votes.no
  
  return c.res({
    image: "https://bafybeiga2qjlywwqwquzd72gtxfyrltjupesucvpffr7hblw4fodv5r7fe.ipfs.w3s.link/Group%2062%20(3).png",
    imageAspectRatio: '1:1',
    intents: [
      <Button>Total Votes: {total.toString()}</Button>,
      <Button>Yes: {votes.yes.toString()} ({percentages.yes.toString()}%)</Button>,
      <Button>No: {votes.no.toString()} ({percentages.no.toString()}%)</Button>,
      <Button action="/">Back to Poll</Button>
    ],
  })
})

devtools(app, { serveStatic })

export const GET = handle(app)
export const POST = handle(app)
//