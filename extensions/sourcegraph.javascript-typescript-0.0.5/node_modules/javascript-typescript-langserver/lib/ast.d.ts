import * as ts from 'typescript';
/**
 * Returns a Generator that walks most of the AST (the part that matters for gathering all references) and emits Nodes
 *
 * TODO is this function worth it?
 */
export declare function walkMostAST(node: ts.Node): IterableIterator<ts.Node>;
