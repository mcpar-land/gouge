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
			const [edit] = await respond(
				'You ordered ' + amount + ' ' + kind + ' bagels.'
			)
		})
)
```

## Todo

- [ ] Write comprehensive unit tests
- [ ] Automatic pruning of global commands that aren't handled any more.
