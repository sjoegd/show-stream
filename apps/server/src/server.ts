import express, { type Express } from 'express';
import cors from 'cors';

export const createServer = (): Express => {
	const app = express();
	app
		.use(
			cors({
				origin: ['http://localhost:3000', 'http://localhost:5001'],
				credentials: true,
			}),
		)
		.use(express.json())
		.use(express.urlencoded({ extended: true }))

	return app;
};
