import type { InitOutput } from 'crypto_wasm/web';

let wasmModule: {
	default: (() => Promise<InitOutput>) | typeof import('../../crypto/pkg/node');
	derive_key: (password: string, salt: Uint8Array) => Uint8Array;
};
if (typeof window === 'undefined') {
	wasmModule = await import('../../crypto/pkg/node');
} else {
	wasmModule = await import('../../crypto/pkg/web');
}

const { default: init, derive_key } = wasmModule;

export { init, derive_key };
