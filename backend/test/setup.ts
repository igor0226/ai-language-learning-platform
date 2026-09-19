process.env.VIDEO_PROCESSING_CRON_ENABLED = "false";
process.env.SPEAKING_STALE_CALL_CRON_ENABLED = "false";
process.env.LOG_LEVEL = "silent";
process.env.LIVEKIT_URL ??= "ws://localhost:7880";
process.env.LIVEKIT_API_KEY ??= "devkey";
process.env.LIVEKIT_API_SECRET ??= "local_livekit_secret_do_not_use_prod";
process.env.GOOGLE_CLIENT_ID ??= "test-google-client-id";
process.env.GOOGLE_CLIENT_SECRET ??= "test-google-client-secret";
process.env.GOOGLE_REDIRECT_URI ??=
	"http://localhost:3001/api/auth/google/callback";
process.env.SESSION_SECRET ??= "test-session-secret-at-least-32-characters";
