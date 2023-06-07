import { ipcRenderer, contextBridge } from "electron";

contextBridge.exposeInMainWorld("electronApi", {
    goToDesktop: async () => await ipcRenderer.invoke("desktop") as Promise<Payload | null>,
    goToDir: async (path: string) => await ipcRenderer.invoke("dir", path) as Promise<Payload | null>,
})
