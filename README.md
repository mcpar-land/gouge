<h1 align="center">Gouge</h1>
<p align="center">
<a href="https://mcpar-land.github.io/gouge/">Docs</a> - <a href="/test">Examples</a>
</p>

Super-ergonomic discord bot framework, using the new Slash Commands API.

- 100% Webhook-driven
- Entirely type-safe handler functions

```js
import { GougeClient, command } from 'gouge'

const client = new GougeClient({
  id: process.env.CLIENT_ID,
  key: process.env.PUBLIC_KEY,
  secret: process.env.CLIENT_SECRET,
  token: process.env.BOT_TOKEN,
})

client.add(
  command('bagel', 'Order a number of bagels')
    .string('kind', 'The kind of bagel to order', true, [
      'Plain',
      'Blueberry',
      'Poppy',
      'Cinnamon',
    ])
    .integer('amount', 'The amount of bagels to order', true)
    .handler(async (client, respond, [kind, amount]) => {
      await respond('You ordered ' + amount + ' ' + kind + ' bagels.')
    })
)
```

Check out the small [Example Bot](/test/test-client.ts)

## Scope

The scope of this library is:

- A slim, ergonomic developer-facing API
- Handling the registration, updating, and deletion of global and guild slash commands automatically, keeping them in line with the bot's code. The developer should never have to worry about 'registering' and 'deleting' global commands beyond adding and removing them from the server.
- A high-quality documentation that is easily learned from.
- Simple, relevant example code.

This library isn't intended to be a replacement for comprehensive, listener-based libraries (yet?!). It's essentially a slim express webserver that responds to Discord's [outgoing webhooks](https://discord.com/developers/docs/interactions/slash-commands#receiving-an-interaction). If you want to write a bot that listens for events of any sort besides slash commands, opt for [Discord.js](https://discord.js.org/#/) instead.

(Perhaps one day it will be fully featured, but that is unlikely. There are already a number of powerful libraries for making fully-fledged discord bots that will always be a better option)

## Todo

There's still a lot to be done before this framework is 'production ready.'
For now, it can respond to inputs.

- [ ] Finish documenting all systems
- [ ] Write comprehensive unit tests
- [x] Automatic pruning of global commands that aren't handled any more.
- [ ] Some strategy for managing guild commands between bot reboots.
