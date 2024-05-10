import { TextEncoder, TextDecoder } from 'node:util';

const storageMock = {
	getItem: jest.fn(),
	setItem: jest.fn(),
	removeItem: jest.fn(),
	clear: jest.fn(),
	length: 0,
	key: jest.fn((_index) => null),
};

globalThis.localStorage = { ...storageMock };
globalThis.sessionStorage = { ...storageMock };

Object.defineProperties(globalThis, {
	TextDecoder: { value: TextDecoder },
	TextEncoder: { value: TextEncoder },
});
