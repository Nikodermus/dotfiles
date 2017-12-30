import { Tracer } from 'opentracing';
import { MessageLogOptions } from './connection';
import { RemoteLanguageClient } from './lang-handler';
import { Logger, StdioLogger } from './logging';
import { TypeScriptService } from './typescript-service';
/** Options to `serve()` */
export interface ServeOptions extends MessageLogOptions {
    /** Amount of workers to spawn */
    clusterSize: number;
    /** Port to listen on for TCP LSP connections */
    lspPort: number;
    /** An OpenTracing-compatible Tracer */
    tracer?: Tracer;
}
/**
 * Creates a Logger prefixed with master or worker ID
 *
 * @param logger An optional logger to wrap, e.g. to write to a logfile. Defaults to STDIO
 */
export declare function createClusterLogger(logger?: StdioLogger): Logger;
/**
 * Starts up a cluster of worker processes that listen on the same TCP socket.
 * Crashing workers are restarted automatically.
 *
 * @param options
 * @param createLangHandler Factory function that is called for each new connection
 */
export declare function serve(options: ServeOptions, createLangHandler?: (remoteClient: RemoteLanguageClient) => TypeScriptService): void;
