import type { LogLevel } from '../types.js';

class ConsentioLogger {
	declare logger: Console | null;
	declare debug: boolean;

	constructor(logger: Console | null, debug: boolean) {
		this.logger = logger;
		this.debug = debug;
	}

	log(text: string, level?: LogLevel): void {
		if (!this.debug || !this.logger) {
			return;
		}

		switch (level) {
			case 'error':
				this.logger?.error(text);
				break;
			case 'warn':
				this.logger.warn(text);
				break;
			case 'info':
				this.logger?.info(text);
				break;
			default:
				this.logger?.log(text);
				break;
		}

	}
}

export default ConsentioLogger;
