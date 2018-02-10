'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
class Project {
    constructor(projectPackage, dependencies, packagesDir) {
        this.projectPackage = projectPackage;
        this.dependencies = dependencies;
        this.packagesDir = packagesDir;
    }
    // This will need to add the current package as a parameter to resolve version dependencies
    findPackage(contractDependencyImport) {
        return this.dependencies.find((depPack) => depPack.isImportForThis(contractDependencyImport));
    }
}
exports.Project = Project;
//# sourceMappingURL=project.js.map