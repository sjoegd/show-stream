import { type MovieResult } from 'moviedb-promise';

export interface MetadataDocument {
	lastScanTime: Date;
}

export interface MediaDocument {
	id: number;
	type: MediaType;
}
export type MediaType = 'movie' | 'show';

export interface MovieDocument {
	id: number;
	path: string;
	metadata: MovieResult;
}

export interface ShowDocument {
	id: number;
	path: string;
}

export interface TranscodeDocument {
	id: number;
	status: TranscodeStatus;
	lastRequestDate?: Date;
}
export type TranscodeStatus = 'not ready' | 'in progress' | 'ready';
