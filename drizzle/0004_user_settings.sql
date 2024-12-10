CREATE TABLE IF NOT EXISTS "user_settings" (
  "id" serial PRIMARY KEY,
  "user_email" text NOT NULL,
  "dark_mode" boolean DEFAULT false,
  "notifications" boolean DEFAULT true,
  "sound" boolean DEFAULT true,
  "voice_response" boolean DEFAULT false,
  "interview_duration" integer DEFAULT 15,
  "auto_save" boolean DEFAULT true,
  "privacy_mode" boolean DEFAULT false,
  "volume" integer DEFAULT 80,
  "created_at" timestamp DEFAULT now(),
  "updated_at" timestamp DEFAULT now()
);
