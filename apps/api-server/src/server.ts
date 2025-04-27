import express, { type Express } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { createLogger, createLoggerMiddleware } from './log';
import { type Logger }	from 'winston'; 

export const createServer = (): { app: Express, logger: Logger } => {
	const app = express();
	const logger = createLogger();

	app
		.use(
			cors({
				origin: ['http://localhost:3000'], // next-client, TODO: Env variable
				credentials: true,
			}),
		)
		.use(createLoggerMiddleware(logger))
		.use(helmet())
		.use(express.json())
		.use(express.urlencoded({ extended: true }))

	return { app, logger };
};

