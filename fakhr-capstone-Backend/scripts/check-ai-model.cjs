'use strict';
// Metadata only: never creates a response, reads MongoDB, or prints provider errors.
async function checkModel(env = process.env, request = fetch) {
  if (env.FAKHR_AI_ENVIRONMENT !== 'authorized-nonproduction' ||
      env.FAKHR_AI_ENABLED !== 'false' || env.FAKHR_AI_ACCESS !== 'off' ||
      !env.FAKHR_AI_OPENAI_API_KEY) return 'BLOCKED_CONFIGURATION';
  try {
    const response = await request('https://api.openai.com/v1/models/gpt-6-luna', {
      method: 'GET', redirect: 'error', signal: AbortSignal.timeout(10000),
      headers: { Authorization: `Bearer ${env.FAKHR_AI_OPENAI_API_KEY}` },
    });
    if (!response.ok) return 'MODEL_ACCESS_UNVERIFIED';
    const data = await response.json();
    return data.id === 'gpt-6-luna' ? 'MODEL_METADATA_ACCESS_CONFIRMED' : 'MODEL_ACCESS_UNVERIFIED';
  } catch { return 'MODEL_ACCESS_UNVERIFIED'; }
}
module.exports = { checkModel };
if (require.main === module) checkModel().then(result => {
  console.log(result);
  process.exitCode = result === 'MODEL_METADATA_ACCESS_CONFIRMED' ? 0 : 1;
});
