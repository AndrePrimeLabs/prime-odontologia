 import pino from "pino"
import { config } from "../config.js"

export const logger = pino({
	level: config.LOG_LEVEL,
	redact: {
		paths: [
			"req.headers.authorization",
			"req.headers['x-primeos-key']",
			"token",
			"apiKey",
		],
		censor: "[redacted]",
	},
	transport:
		process.env.NODE_ENV === "production"
			? undefined
			: { target: "pino-pretty", options: { colorize: true } },
})