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
    image: "https://bafybeiga2qjlywwqwquzd72gtxfyrltjupesucvpffr7hblw4fodv5r7fe.ipfs.w3s.link/Group%2062%20(3).png",
    intents: [
      <Button value="YES">Yes</Button>,
      <Button value="NO">No</Button>,
    ],
  })
})

app.frame('/picker', (c) => {
  console.log('c', c)
  const { buttonValue } = c
  const punycode = require('punycode');

  if (buttonValue === 'YES') {
    return c.res({
      action: 'yes/a',
      image: "https://amaranth-adequate-condor-278.mypinata.cloud/ipfs/QmVti6U1jYrWX8RwvJcNCHoKD6zXToDX9T6kfydH5iaxvY", 
      imageAspectRatio: '1:1', 
      intents: [
        <Button action="/">Back</Button>,
      ],
    })
  } else if (buttonValue === 'NO') {
    return c.res({
      action: 'no/b',
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