/** @jsxImportSource frog/jsx */
import { Button, Frog } from 'frog'
import { devtools } from 'frog/dev'
import { handle } from 'frog/next'
import { serveStatic } from 'frog/serve-static'

const app = new Frog({
  assetsPath: '/',
  basePath: '/api',
  title: 'likebetter',
  // hub: neynar({ apiKey: 'NEYNAR_FROG_FM' }) // Uncomment and configure if needed
})

app.frame('/', (c) => {
  return c.res({
    action: '/picker',
    image: "https://amaranth-adequate-condor-278.mypinata.cloud/ipfs/QmcYBuqkV7MRavbb9yg4ZKihP4ZmfPSZNZhBitMuwCNXfa",
    intents: [
      <Button value="A">A</Button>,
      <Button value="B">B</Button>,
    ],
  })
})

app.frame('/picker', (c) => {
  console.log('c', c)
  const { buttonValue } = c

  if (buttonValue === 'A') {
    return c.res({
      action: 'degen/a',
      image: "https://amaranth-adequate-condor-278.mypinata.cloud/ipfs/QmVti6U1jYrWX8RwvJcNCHoKD6zXToDX9T6kfydH5iaxvY", // Required image property
      imageAspectRatio: '1:1', // Optional, but useful
      intents: [
        <Button action="/">Back</Button>,
      ],
    })
  } else if (buttonValue === 'B') {
    return c.res({
      action: 'farther/b',
      image: "https://amaranth-adequate-condor-278.mypinata.cloud/ipfs/QmTXUnNBVCJEuT6GYdxK1xrjizL2aJWTMWvo9q9Kx6hYje", // Required image property
      imageAspectRatio: '1:1', // Optional, but useful
      intents: [
        <Button action="/">Back</Button>,
      ],
    })
  } else {
    // Default response if buttonValue is not A or B
    return c.res({
      action: '/',
      image: "https://amaranth-adequate-condor-278.mypinata.cloud/ipfs/QmcYBuqkV7MRavbb9yg4ZKihP4ZmfPSZNZhBitMuwCNXfa", // Required image property
      intents: [
        <Button action="/">Back</Button>,
      ],
    })
  }
})

devtools(app, { serveStatic })

export const GET = handle(app)
export const POST = handle(app)
