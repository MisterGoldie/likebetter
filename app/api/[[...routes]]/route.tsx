/** @jsxImportSource frog/jsx */

import { Button, Frog, TextInput } from 'frog'
import { devtools } from 'frog/dev'
// import { neynar } from 'frog/hubs'
import { handle } from 'frog/next'
import { serveStatic } from 'frog/serve-static'

const app = new Frog({
  assetsPath: '/',
  basePath: '/api',
  title: 'likebetter',
  // Supply a Hub to enable frame verification.
  // hub: neynar({ apiKey: 'NEYNAR_FROG_FM' })
})

// Uncomment to use Edge Runtime
// export const runtime = 'edge'

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
      image: "https://amaranth-adequate-condor-278.mypinata.cloud/ipfs/QmVti6U1jYrWX8RwvJcNCHoKD6zXToDX9T6kfydH5iaxvY",
      imageAspectRatio: '1:1',
      intents: [
        <Button action="/">Back</Button>,
      ],
    })
  } else if (buttonValue === 'B') {
    return c.res({
      action: 'farther/b',
      image: "https://amaranth-adequate-condor-278.mypinata.cloud/ipfs/QmTXUnNBVCJEuT6GYdxK1xrjizL2aJWTMWvo9q9Kx6hYje",
      imageAspectRatio: '1:1',
      intents: [
        <Button action="/">Back</Button>,
      ],
    })
  }
})



devtools(app, { serveStatic })

export const GET = handle(app)
export const POST = handle(app)
