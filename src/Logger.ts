class Logger {
    constructor() {
        this.logOverride = null;
        this.warnOverride = null;
        this.errorOverride = null;
    }

    log(message: string) : void {
        if (!this.logOverride) {
            console.log(message);
        } else {
            this.logOverride(message);
        }
    }
    warn(message: string) : void {
        if (!this.warnOverride) {
            console.warn(message);
        } else {
            this.warnOverride(message);
        }
    }
    error(message: string) : void {
        if (!this.errorOverride) {
            console.error(message);
        } else {
            this.errorOverride(message);
        }
    }
    logOverride: ((message: string) => void)|null;
    warnOverride: ((message: string) => void)|null;
    errorOverride: ((message: string) => void)|null;
}

const logger : Logger = new Logger();

export default logger;