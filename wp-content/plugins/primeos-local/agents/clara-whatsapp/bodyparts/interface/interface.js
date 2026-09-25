// WhatsApp interface using Twilio webhooks
// Expects env vars: WHATSAPP_PORT (default 3001), TWILIO_AUTH_TOKEN (optional for request validation)

const express = require('express');
const bodyParser = require('body-parser');

module.exports = async function(params){
  const app = express();
  app.use(bodyParser.urlencoded({ extended: false }));

  const port = process.env.WHATSAPP_PORT || 3001;
  const authToken = process.env.TWILIO_AUTH_TOKEN || null;
  let validateRequest = null;
  try {
    const twilio = require('twilio');
    validateRequest = twilio.validateRequest;
  } catch (e) {
    console.warn('twilio SDK not available for request validation');
  }

  app.post('/webhook', async (req, res) => {
    try {
      // optional signature validation
      if (authToken && validateRequest) {
        const signature = req.headers['x-twilio-signature'];
        const url = `${req.protocol}://${req.get('host')}${req.originalUrl}`;
        const params = req.body;
        const valid = validateRequest(authToken, signature, url, params);
        if (!valid) {
          console.warn('Invalid Twilio signature');
          return res.status(403).send('invalid signature');
        }
      }

      const from = req.body.From || req.body.from;
      const body = req.body.Body || req.body.Body || '';
      console.log('WhatsApp webhook received from', from, 'body:', body);

      // call reasoning module to generate reply
      let reply = 'Sorry, I could not process your message.';
      try {
        const reasoning = require('../reasoning/reasoning.js');
        const r = await reasoning({ text: body, from });
        if (r && r.reply) reply = r.reply;
      } catch (err) {
        console.error('Reasoning module error', err);
      }

      // respond using TwiML
      const twilio = require('twilio');
      const MessagingResponse = twilio.twiml.MessagingResponse;
      const twiml = new MessagingResponse();
      twiml.message(reply);
      res.type('text/xml').send(twiml.toString());
    } catch (err) {
      console.error('webhook handler error', err);
      res.status(500).send('error');
    }
  });

  app.get('/health', (req, res) => res.json({ status: 'ok', part: 'interface', port }));

  app.listen(port, () => console.log(`WhatsApp webhook listening on port ${port}`));

  return { ok: true };
};
