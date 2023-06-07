import { ipcMain } from 'electron';
import * as path from 'path';
import * as fs from 'fs';
import * as os from 'os';
import {
  bindNodeCallback,
  concatAll,
  concatMap,
  filter,
  map,
  of,
  toArray,
  catchError,
  lastValueFrom,
} from 'rxjs';

const readDir = bindNodeCallback(fs.readdir);
const getStat = bindNodeCallback(fs.stat);

function formatSize(size: number) {
  let i = Math.floor(Math.log(size) / Math.log(1024));
  const sizeSuffix = ['B', 'KB', 'MB', 'GB', 'TB'];
  const formattedSize = (size / Math.pow(1024, i)).toFixed(2);
  return `${formattedSize} ${sizeSuffix[i]}`;
}

function getFilesAndFolders(overridePath: string | null = null) {
  return async (event: Electron.IpcMainInvokeEvent, ...args: any[]) => {
    const currentPath = overridePath || args[0];
    try {
      const filesAndFolders = readDir(currentPath, {
        withFileTypes: true,
      }).pipe(
        concatAll(),
        map((fileOrFolder) => {
          const filePath = path.join(currentPath, fileOrFolder.name);
          const stats = fs.statSync(filePath);
          return {
            name: fileOrFolder.name,
            isDirectory: stats.isDirectory(),
            size: stats.isFile() ? formatSize(stats.size) : null,
            lastModified: stats.mtime,
            path: filePath,
          } as FileOrFolder;
        }),
        concatMap((fileOrFolder) => {
          if (!fileOrFolder.isDirectory) return of({ fileOrFolder, ok: true });
          return readDir(fileOrFolder.path, { withFileTypes: true }).pipe(
            map(() => ({ fileOrFolder, ok: true })),
            catchError(() => {
              return of({ fileOrFolder, ok: false });
            })
          );
        }),
        filter((items) => items.ok),
        map((item) => item.fileOrFolder),
        toArray(),
        map((filesAndFolders) => {
          return filesAndFolders.sort((a, b) => {
            return a.isDirectory === b.isDirectory ||
              !a.isDirectory === !b.isDirectory
              ? a.name.localeCompare(b.name)
              : a.isDirectory
              ? -1
              : 1;
          });
        })
      );

      return {
        currentPath,
        filesAndFolders: await lastValueFrom(filesAndFolders),
      } as Payload;
    } catch (err) {
      console.error('Outer', err);
      return null;
    }
  };
}

export function addIpcHandlers() {
  ipcMain.handle('desktop', getFilesAndFolders(os.homedir()));
  ipcMain.handle('dir', getFilesAndFolders());
}
