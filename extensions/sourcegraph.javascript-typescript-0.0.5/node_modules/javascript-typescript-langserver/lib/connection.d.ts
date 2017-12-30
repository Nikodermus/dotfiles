/// <reference types="node" />
import { EventEmitter } from 'events';
import { Tracer } from 'opentracing';
import { Message } from 'vscode-jsonrpc';
import { NotificationMessage, RequestMessage, ResponseMessage } from 'vscode-jsonrpc/lib/messages';
import { Logger } from './logging';
import { TypeScriptService } from './typescript-service';
/**
 * Interface for JSON RPC messages with tracing metadata
 */
export interface HasMeta {
    meta: {
        [key: string]: any;
    };
}
export interface MessageLogOptions {
    /** Logger to use */
    logger?: Logger;
    /** Whether to log all messages */
    logMessages?: boolean;
}
/**
 * Takes a NodeJS ReadableStream and emits parsed messages received on the stream.
 * In opposite to StreamMessageReader, supports multiple listeners and is compatible with Observables
 */
export declare class MessageEmitter extends EventEmitter {
    constructor(input: NodeJS.ReadableStream, options?: MessageLogOptions);
    /** Emitted when a new JSON RPC message was received on the input stream */
    on(event: 'message', listener: (message: Message) => void): this;
    /** Emitted when the underlying input stream emitted an error */
    on(event: 'error', listener: (error: Error) => void): this;
    /** Emitted when the underlying input stream was closed */
    on(event: 'close', listener: () => void): this;
    /** Emitted when a new JSON RPC message was received on the input stream */
    once(event: 'message', listener: (message: Message) => void): this;
    /** Emitted when the underlying input stream emitted an error */
    once(event: 'error', listener: (error: Error) => void): this;
    /** Emitted when the underlying input stream was closed */
    once(event: 'close', listener: () => void): this;
}
/**
 * Wraps vscode-jsonrpcs StreamMessageWriter to support logging messages,
 * decouple our code from the vscode-jsonrpc module and provide a more
 * consistent event API
 */
export declare class MessageWriter {
    private logger;
    private logMessages;
    private vscodeWriter;
    /**
     * @param output The output stream to write to (e.g. STDOUT or a socket)
     * @param options
     */
    constructor(output: NodeJS.WritableStream, options?: MessageLogOptions);
    /**
     * Writes a JSON RPC message to the output stream.
     * Logs it if configured
     *
     * @param message A complete JSON RPC message object
     */
    write(message: RequestMessage | NotificationMessage | ResponseMessage): void;
}
export interface RegisterLanguageHandlerOptions {
    logger?: Logger;
    /** An opentracing-compatible tracer */
    tracer?: Tracer;
}
/**
 * Registers all method implementations of a LanguageHandler on a connection
 *
 * @param messageEmitter MessageEmitter to listen on
 * @param messageWriter MessageWriter to write to
 * @param handler TypeScriptService object that contains methods for all methods to be handled
 */
export declare function registerLanguageHandler(messageEmitter: MessageEmitter, messageWriter: MessageWriter, handler: TypeScriptService, options?: RegisterLanguageHandlerOptions): void;
