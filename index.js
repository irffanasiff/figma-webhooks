const express = require('express');
const bodyParser = require('body-parser');
const ngrok = require('ngrok');
const axios = require('axios');
const crypto = require('crypto');
const PORT = 8080;
const app = express();
const dotenv = require('dotenv');

dotenv.config();

const passcode = crypto.randomBytes(48).toString('hex');

app.use(bodyParser.json());

const FigmaFileID = `egV7TIPjNijN1XS9r84ENK`;

// Get the Figma file
app.post('/', (request, response) => {
  if (request.body.comment) {
    if (request.body.passcode === passcode) {
      const { file_name, timestamp, triggered_by, comment } = request.body;
      console.log(request.body);
      console.log(
        `${triggered_by.handle} comment on ${file_name} at ${timestamp} - ${comment[0].text}`
      );
      response.sendStatus(200);
    } else {
      response.sendStatus(403);
    }
  }
});

app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));

ngrok.connect(PORT).then((endpoint) => {
  axios
    .post(
      'https://api.figma.com/v2/webhooks',
      {
        event_type: 'FILE_COMMENT',
        team_id: '1094561222468616141',
        passcode,
        endpoint,
      },
      {
        headers: {
          'X-Figma-Token': process.env.FigmaAPIKey,
        },
      }
    )
    .then((response) => {
      console.log(`🎣 Webhook ${response.data.id} successfully created`);
    })
    .catch((err) => console.log('❌', err));
});
