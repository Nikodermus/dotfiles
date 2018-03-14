/// <reference types="node" />
import { LanguageClient } from './lang-handler';
export interface Logger {
    log(...values: any[]): void;
    info(...values: any[]): void;
    warn(...values: any[]): void;
    error(...values: any[]): void;
}
/**
 * A logger implementation that sends window/logMessage notifications to an LSP client
 */
export declare class LSPLogger implements Logger {
    private client;
    /**
     * @param client The client to send window/logMessage notifications to
     */
    constructor(client: LanguageClient);
    log(...values: any[]): void;
    info(...values: any[]): void;
    warn(...values: any[]): void;
    error(...values: any[]): void;
}
/**
 * Logging implementation that writes to an arbitrary NodeJS stream
 */
export declare class StreamLogger {
    private outStream;
    private errStream;
    constructor(outStream: NodeJS.WritableStream, errStream: NodeJS.WritableStream);
    log(...values: any[]): void;
    info(...values: any[]): void;
    warn(...values: any[]): void;
    error(...values: any[]): void;
}
/**
 * Logger implementation that logs to STDOUT and STDERR depending on level
 */
export declare class StdioLogger extends StreamLogger {
    constructor();
}
/**
 * Logger implementation that logs only to STDERR
 */
export declare class StderrLogger extends StreamLogger {
    constructor();
}
/**
 * Logger implementation that logs to a file
 */
export declare class FileLogger extends StreamLogger {
    /**
     * @param file Path to the logfile
     */
    constructor(file: string);
}
/**
 * Logger implementation that wraps another logger and prefixes every message with a given prefix
 */
export declare class PrefixedLogger {
    private logger;
    private prefix;
    constructor(logger: Logger, prefix: string);
    log(...values: any[]): void;
    info(...values: any[]): void;
    warn(...values: any[]): void;
    error(...values: any[]): void;
}
/**
 * Logger implementation that does nothing
 */
export declare class NoopLogger {
    log(...values: any[]): void;
    info(...values: any[]): void;
    warn(...values: any[]): void;
    error(...values: any[]): void;
}
