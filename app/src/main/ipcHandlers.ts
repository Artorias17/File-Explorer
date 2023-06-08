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
  from,
  mergeMap,
  mergeAll,
} from 'rxjs';
import { getDriveList } from './windowsDriveList';

const readDir = bindNodeCallback(fs.readdir);
const fsStat = bindNodeCallback(fs.stat);

const formatSize = (size: number) => {
  let i = Math.floor(Math.log(size) / Math.log(1024));
  const sizeSuffix = ['B', 'KB', 'MB', 'GB', 'TB'];
  const formattedSize = (size / Math.pow(1024, i)).toFixed(2);
  return `${formattedSize} ${sizeSuffix[i]}`;
};

const getFilesAndFoldersInDir = async (currentPath: string) => {
  try {
    const filesAndFolders = readDir(currentPath, {
      withFileTypes: true,
    }).pipe(
      concatAll(),
      concatMap((fileOrFolder) => {
        const filePath = path.join(currentPath, fileOrFolder.name);
        return fsStat(filePath, { bigint: false }).pipe(
          map((stat) => {
            return {
              name: fileOrFolder.name,
              isDirectory: stat.isDirectory(),
              size: stat.isFile() ? formatSize(stat.size as number) : null,
              lastModified: stat.mtime,
              path: filePath,
            } as FileOrFolder;
          }),
          catchError(() => of({} as FileOrFolder)),
          filter((fileOrFolder) => !!fileOrFolder.name),
          concatMap((fileOrFolder) => {
            if (!fileOrFolder.isDirectory) {
              return of({ fileOrFolder, ok: true });
            }
            return readDir(fileOrFolder.path, { withFileTypes: true }).pipe(
              map(() => ({ fileOrFolder, ok: true })),
              catchError(() => {
                return of({ fileOrFolder, ok: false });
              })
            );
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

    const result = {
      currentPath,
      filesAndFolders: await lastValueFrom(filesAndFolders),
    } as Payload;
    return result;
  } catch (err) {
    console.error(err);
    return null;
  }
};

export function addIpcHandlers() {
  ipcMain.handle('drives', async () => await getDriveList());
  ipcMain.handle('desktop', () => os.homedir());
  ipcMain.handle('dir', async (event, directory) =>
    getFilesAndFoldersInDir(directory)
  );
  ipcMain.handle('searchDir', async (event, directory, searchTerm) => {
    if (!searchTerm) return null;
    const recursiveSearch = async (dir: string, search: string) => {
      let filesAndFolders =
        (await getFilesAndFoldersInDir(dir))?.filesAndFolders || [];
      let folders = filesAndFolders.filter(
        (f) => f.isDirectory && f.name.includes(search)
      );

      const innerFilesAndFolders = from(folders).pipe(
        mergeMap((folder) => {
          return from(recursiveSearch(folder.path, search));
        }, folders.length || 1),
        mergeAll(),
        toArray()
      );

      const innerFolders: FileOrFolder[] =
        (await lastValueFrom(innerFilesAndFolders)) || [];

      innerFolders.sort((a, b) => {
        return a.isDirectory === b.isDirectory ||
          !a.isDirectory === !b.isDirectory
          ? a.path.localeCompare(b.path)
          : a.isDirectory
          ? -1
          : 1;
      });
      return [...folders, ...innerFolders] as FileOrFolder[];
    };

    return {
      currentPath: directory,
      filesAndFolders: await recursiveSearch(directory, searchTerm),
    } as Payload;
  });
}
