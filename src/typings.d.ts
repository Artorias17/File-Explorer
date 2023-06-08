/* SystemJS module definition */
declare const nodeModule: NodeModule;
interface NodeModule {
  id: string;
}

interface ElectronApi {
  getDrives: () => Promise<OSDrive[] | null>
  getHomeDir: () => Promise<string>;
  goToDir: (path: string) => Promise<Payload | null>;
  searchDir: (directory: string ,searchTerm: string) => Promise<Payload | null>;
}

interface Window {
  electronApi: ElectronApi;
}

interface OSLocation extends OSDrive {
  icon: string,
  path: string,
}