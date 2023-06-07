/* SystemJS module definition */
declare const nodeModule: NodeModule;
interface NodeModule {
  id: string;
}

interface ElectronApi {
  goToDesktop: () => Promise<Payload | null>;
  goToDir: (path: string) => Promise<Payload | null>;
}

interface Window {
  process: any;
  require: any;
  electronApi: ElectronApi;
}