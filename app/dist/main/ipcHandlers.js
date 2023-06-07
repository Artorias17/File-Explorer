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
const getStat = (0, rxjs_1.bindNodeCallback)(fs.stat);
function formatSize(size) {
    let i = Math.floor(Math.log(size) / Math.log(1024));
    const sizeSuffix = ['B', 'KB', 'MB', 'GB', 'TB'];
    const formattedSize = (size / Math.pow(1024, i)).toFixed(2);
    return `${formattedSize} ${sizeSuffix[i]}`;
}
function getFilesAndFolders(overridePath = null) {
    return (event, ...args) => __awaiter(this, void 0, void 0, function* () {
        const currentPath = overridePath || args[0];
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
}
function addIpcHandlers() {
    electron_1.ipcMain.handle('desktop', getFilesAndFolders(os.homedir()));
    electron_1.ipcMain.handle('dir', getFilesAndFolders());
}
exports.addIpcHandlers = addIpcHandlers;
//# sourceMappingURL=ipcHandlers.js.map