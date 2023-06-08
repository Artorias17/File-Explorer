import { ipcRenderer, contextBridge } from "electron";

contextBridge.exposeInMainWorld("electronApi", {
    getDrives: async () => await ipcRenderer.invoke("drives") as Promise<OSDrive[] | null>,
    getHomeDir: async () => await ipcRenderer.invoke("desktop") as Promise<string>,
    goToDir: async (path: string) => await ipcRenderer.invoke("dir", path) as Promise<Payload | null>,
    searchDir:async (directory: string ,searchTerm: string) => await ipcRenderer.invoke("searchDir", directory, searchTerm) as Promise<Payload | null>,
})
