import * as ts from 'typescript';
import { SymbolInformation, SymbolKind } from 'vscode-languageserver-types';
import { SymbolDescriptor } from './request-type';
/**
 * Returns a SymbolDescriptor for a ts.DefinitionInfo
 */
export declare function definitionInfoToSymbolDescriptor(info: ts.DefinitionInfo, rootPath: string): SymbolDescriptor;
/**
 * Transforms definition's file name to URI. If definition belongs to the in-memory TypeScript library,
 * returns git://github.com/Microsoft/TypeScript URL, otherwise returns file:// one
 */
export declare function locationUri(filePath: string): string;
/**
 * Returns an LSP SymbolInformation for a TypeScript NavigateToItem
 *
 * @param rootPath The workspace rootPath to remove from symbol names and containerNames
 */
export declare function navigateToItemToSymbolInformation(item: ts.NavigateToItem, program: ts.Program, rootPath: string): SymbolInformation;
/**
 * Returns an LSP SymbolKind for a TypeScript ScriptElementKind
 */
export declare function stringtoSymbolKind(kind: string): SymbolKind;
/**
 * Returns an LSP SymbolInformation for a TypeScript NavigationTree node
 */
export declare function navigationTreeToSymbolInformation(tree: ts.NavigationTree, parent: ts.NavigationTree | undefined, sourceFile: ts.SourceFile, rootPath: string): SymbolInformation;
/**
 * Returns a SymbolDescriptor for a TypeScript NavigationTree node
 */
export declare function navigationTreeToSymbolDescriptor(tree: ts.NavigationTree, parent: ts.NavigationTree | undefined, filePath: string, rootPath: string): SymbolDescriptor;
/**
 * Walks a NaviationTree and emits items with a node and its parent node (if exists)
 */
export declare function walkNavigationTree(tree: ts.NavigationTree, parent?: ts.NavigationTree): IterableIterator<{
    tree: ts.NavigationTree;
    parent?: ts.NavigationTree;
}>;
/**
 * Returns true if the NavigationTree node describes a proper symbol and not a e.g. a category like `<global>`
 */
export declare function navigationTreeIsSymbol(tree: ts.NavigationTree): boolean;
