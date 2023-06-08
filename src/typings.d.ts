/* SystemJS module definition */
declare const nodeModule: NodeModule;
interface NodeModule {
  id: string;
}

interface ElectronApi {
  getHomeDir: () => Promise<string>;
  goToDir: (path: string) => Promise<Payload | null>;
  searchDir: (directory: string ,searchTerm: string) => Promise<Payload | null>;
}

interface Window {
  electronApi: ElectronApi;
}