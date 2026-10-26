const serverless = require('serverless-http');
const { createApp } = require('../../server');
let handlerPromise;
exports.handler = async (event, context) => {
  context.callbackWaitsForEmptyEventLoop = false;
  // Reuse the app and MongoDB client between warm function invocations.
  if (!handlerPromise) {
    handlerPromise = createApp().then(app => serverless(app)).catch(error => {
      handlerPromise = undefined;
      throw error;
    });
  }
  try {
    const handler = await handlerPromise;
    return await handler(event, context);
  } catch (error) {
    console.error('API unavailable:', error.name);
    return { statusCode: 503, headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' }, body: JSON.stringify({ error: 'Database is unavailable. Please retry shortly.' }) };
  }
};
