import cors from 'cors';
import helmet from 'helmet';
import express, { type Express } from 'express';
import { createLogger, createLoggerMiddleware } from './log';
import { type Logger } from 'winston';

export const createServer = (): { app: Express; logger: Logger } => {
	const app = express();
	const logger = createLogger();

	const NEXT_CLIENT_URL = process.env.NEXT_CLIENT_URL || '';

	app
		.use(
			cors({
				origin: [NEXT_CLIENT_URL],
				credentials: true,
			}),
		)
		.use(createLoggerMiddleware(logger))
		.use(helmet())
		.use(express.json())
		.use(express.urlencoded({ extended: true }));

	return { app, logger };
};
