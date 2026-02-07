import { createApp } from './app';
import { OpenAIProvider } from './services';
import { loadConfig } from './config';

const config = loadConfig();
const aiProvider = new OpenAIProvider(config.openai.apiKey, config.openai.model);
const app = createApp(aiProvider);

app.listen(config.port, () => {
  console.log(`🍽️  Weekly Menu Planner server running on port ${config.port}`);
  console.log(`   Environment: ${config.nodeEnv}`);
  console.log(`   AI Model: ${config.openai.model}`);
});
