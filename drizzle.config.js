
import { defineConfig } from 'drizzle-kit';

export default defineConfig({
  out: './drizzle',
  schema: './utils/schema.js',
  dialect: 'postgresql',
  dbCredentials: {
    url: "postgresql://abhishekreddywadi123:Z2bmlcVR7ukr@ep-flat-hill-a58u8rx8.us-east-2.aws.neon.tech/test?sslmode=require",
  },
});
