class ConsentioLogger {
	constructor(logger, debug) {
		this.logger = logger;
		this.debug = debug;
	}

	log(text, level) {
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
