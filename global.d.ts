interface FileOrFolder {
  name: string;
  isDirectory: boolean;
  size: string | null;
  lastModified: Date;
  path: string;
}

interface Payload {
  currentPath: string;
  filesAndFolders: FileOrFolder[];
}