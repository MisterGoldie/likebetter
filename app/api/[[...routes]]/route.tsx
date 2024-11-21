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
    image: "https://bafybeiga2qjlywwqwquzd72gtxfyrltjupesucvpffr7hblw4fodv5r7fe.ipfs.w3s.link/Group%2062%20(3).png",
    intents: [
      <Button value="YES">Yes ({percentages.yes.toString()}%)</Button>,
      <Button value="NO">No ({percentages.no.toString()}%)</Button>,
      <Button action="/stats">View Stats</Button>,
    ],
  })
})

app.frame('/vote', (c) => {
  const { buttonValue } = c
  
  // Record the vote
  if (buttonValue === 'YES') {
    votes.yes++
  } else if (buttonValue === 'NO') {
    votes.no++
  }
  
  const percentages = calculatePercentages()
  
  return c.res({
    image: "https://bafybeiga2qjlywwqwquzd72gtxfyrltjupesucvpffr7hblw4fodv5r7fe.ipfs.w3s.link/Group%2062%20(3).png",
    imageAspectRatio: '1:1',
    intents: [
      <Button value="YES">Yes ({percentages.yes.toString()}%)</Button>,
      <Button value="NO">No ({percentages.no.toString()}%)</Button>,
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