const express = require('express');

const collectronicsDriver = require(`./drivers/collectronics`);

const app = express();
const port = process.env.PORT || 9070;

const AUTH_SECRET = process.env.AUTH_SECRET;

// Utility function so that a Promise returns an Array of [err, result]
const to = promise => promise.then(data => {
  return [null, data];
}).catch(err => [err]);

// Static routes
app.use(express.static(`${__dirname}/build/`));

// This is the endpoint that Front will call on load of the plugin
app.get('/api/search', async (req, res) => {
  // Deny requests that do not come from Front
  if (AUTH_SECRET && req.query.auth_secret !== AUTH_SECRET)
    return res.sendStatus(401);

  if (!req.query.ref)
	return res.status(400).send({err: 'Missing ref query parameter'});

  const [err, accountData] = await to(collectronicsDriver.getAccountData(req.query.ref));
  if (err) {
    console.error(err);

    if (err.statusCode && err.message)
      return res.status(err.statusCode).send(err.message);

    return res.status(500).send(err);
  }

  res.send({data: accountData});
});

app.listen(port, () => console.log(`Server listening on port ${port}`));
