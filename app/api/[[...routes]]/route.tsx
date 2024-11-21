/** @jsxImportSource frog/jsx */
import { Button, Frog } from 'frog'
import { devtools } from 'frog/dev'
import { handle } from 'frog/next'
import { serveStatic } from 'frog/serve-static'

const app = new Frog({
  assetsPath: '/',
  basePath: '/api',
  title: 'likebetter',
})

app.frame('/', (c) => {
  return c.res({
    action: '/picker',
    image: "https://amaranth-adequate-condor-278.mypinata.cloud/ipfs/QmcYBuqkV7MRavbb9yg4ZKihP4ZmfPSZNZhBitMuwCNXfa",
    intents: [
      <Button value="$DEGEN">$DEGEN</Button>,
      <Button value="$FARTHER">$FARTHER</Button>,
    ],
  })
})

app.frame('/picker', (c) => {
  console.log('c', c)
  const { buttonValue } = c
  const punycode = require('punycode');

  if (buttonValue === '$DEGEN') {
    return c.res({
      action: 'degen/a',
      image: "https://amaranth-adequate-condor-278.mypinata.cloud/ipfs/QmVti6U1jYrWX8RwvJcNCHoKD6zXToDX9T6kfydH5iaxvY", 
      imageAspectRatio: '1:1', 
      intents: [
        <Button action="/">Back</Button>,
      ],
    })
  } else if (buttonValue === '$FARTHER') {
    return c.res({
      action: 'farther/b',
      image: "https://amaranth-adequate-condor-278.mypinata.cloud/ipfs/QmXfxPRruMHcfkpquxqPfvBeeY8Mfcnw8x2LKcs7TY2Jk5", 
      imageAspectRatio: '1:1', 
      intents: [
        <Button action="/">Back</Button>,
      ],
    })
  } else {
    // Default response if buttonValue is not A or B
    return c.res({
      action: '/',
      image: "https://amaranth-adequate-condor-278.mypinata.cloud/ipfs/QmcYBuqkV7MRavbb9yg4ZKihP4ZmfPSZNZhBitMuwCNXfa", // OG frame image
      intents: [
        <Button action="/">Back</Button>,
      ],
    })
  }
})

devtools(app, { serveStatic })

export const GET = handle(app)
export const POST = handle(app)
//