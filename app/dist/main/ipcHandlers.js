"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.addIpcHandlers = void 0;
const electron_1 = require("electron");
const path = require("path");
const fs = require("fs");
const os = require("os");
const rxjs_1 = require("rxjs");
const readDir = (0, rxjs_1.bindNodeCallback)(fs.readdir);
const formatSize = (size) => {
    let i = Math.floor(Math.log(size) / Math.log(1024));
    const sizeSuffix = ['B', 'KB', 'MB', 'GB', 'TB'];
    const formattedSize = (size / Math.pow(1024, i)).toFixed(2);
    return `${formattedSize} ${sizeSuffix[i]}`;
};
const getFilesAndFoldersInDir = (currentPath) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const filesAndFolders = readDir(currentPath, {
            withFileTypes: true,
        }).pipe((0, rxjs_1.concatAll)(), (0, rxjs_1.map)((fileOrFolder) => {
            const filePath = path.join(currentPath, fileOrFolder.name);
            const stats = fs.statSync(filePath);
            return {
                name: fileOrFolder.name,
                isDirectory: stats.isDirectory(),
                size: stats.isFile() ? formatSize(stats.size) : null,
                lastModified: stats.mtime,
                path: filePath,
            };
        }), (0, rxjs_1.concatMap)((fileOrFolder) => {
            if (!fileOrFolder.isDirectory)
                return (0, rxjs_1.of)({ fileOrFolder, ok: true });
            return readDir(fileOrFolder.path, { withFileTypes: true }).pipe((0, rxjs_1.map)(() => ({ fileOrFolder, ok: true })), (0, rxjs_1.catchError)(() => {
                return (0, rxjs_1.of)({ fileOrFolder, ok: false });
            }));
        }), (0, rxjs_1.filter)((items) => items.ok), (0, rxjs_1.map)((item) => item.fileOrFolder), (0, rxjs_1.toArray)(), (0, rxjs_1.map)((filesAndFolders) => {
            return filesAndFolders.sort((a, b) => {
                return a.isDirectory === b.isDirectory ||
                    !a.isDirectory === !b.isDirectory
                    ? a.name.localeCompare(b.name)
                    : a.isDirectory
                        ? -1
                        : 1;
            });
        }));
        return {
            currentPath,
            filesAndFolders: yield (0, rxjs_1.lastValueFrom)(filesAndFolders),
        };
    }
    catch (err) {
        console.error('Outer', err);
        return null;
    }
});
function addIpcHandlers() {
    electron_1.ipcMain.handle('desktop', () => os.homedir());
    electron_1.ipcMain.handle('dir', (event, directory) => __awaiter(this, void 0, void 0, function* () { return getFilesAndFoldersInDir(directory); }));
    electron_1.ipcMain.handle('searchDir', (event, directory, searchTerm) => __awaiter(this, void 0, void 0, function* () {
        if (!searchTerm)
            return null;
        const recursiveSearch = (dir, search) => __awaiter(this, void 0, void 0, function* () {
            var _a;
            let filesAndFolders = ((_a = (yield getFilesAndFoldersInDir(dir))) === null || _a === void 0 ? void 0 : _a.filesAndFolders) || [];
            let folders = filesAndFolders.filter((f) => f.isDirectory && f.name.includes(search));
            const innerFilesAndFolders = (0, rxjs_1.from)(folders).pipe((0, rxjs_1.mergeMap)((folder) => {
                return (0, rxjs_1.from)(recursiveSearch(folder.path, search));
            }, folders.length || 1), (0, rxjs_1.mergeAll)(), (0, rxjs_1.toArray)());
            const innerFolders = (yield (0, rxjs_1.lastValueFrom)(innerFilesAndFolders)) || [];
            innerFolders.sort((a, b) => {
                return a.isDirectory === b.isDirectory ||
                    !a.isDirectory === !b.isDirectory
                    ? a.path.localeCompare(b.path)
                    : a.isDirectory
                        ? -1
                        : 1;
            });
            return [...folders, ...innerFolders];
        });
        return {
            currentPath: directory,
            filesAndFolders: yield recursiveSearch(directory, searchTerm),
        };
    }));
}
exports.addIpcHandlers = addIpcHandlers;
//# sourceMappingURL=ipcHandlers.js.map