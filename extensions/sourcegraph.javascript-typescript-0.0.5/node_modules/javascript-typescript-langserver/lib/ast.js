"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * Returns a Generator that walks most of the AST (the part that matters for gathering all references) and emits Nodes
 *
 * TODO is this function worth it?
 */
function* walkMostAST(node) {
    yield node;
    const children = node.getChildren();
    for (const child of children) {
        if (child) {
            yield* walkMostAST(child);
        }
    }
}
exports.walkMostAST = walkMostAST;
//# sourceMappingURL=ast.js.map