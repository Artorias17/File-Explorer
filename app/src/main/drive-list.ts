import { spawn } from 'child_process';
import { Observable, catchError, filter, lastValueFrom, map, of } from 'rxjs';

export async function getDriveList() {
  // Determine the operating system
  switch (process.platform) {
    case 'win32': {
      return await getWindowsDriveList();
    }
    case 'linux': {
      return await getLinuxDriveList();
    }
    default: {
      console.warn('Unsupported operating system:', process.platform);
      return [];
    }
  }
}

async function getWindowsDriveList() {
  return lastValueFrom(
    runCommand([
      'wmic',
      'logicaldisk',
      'get',
      'name,description,volumename',
      '/FORMAT:CSV',
    ]).pipe(
      filter((result): result is string[] => !!result),
      map(([headerLine, ...contentLines]) => {
        const headers = headerLine.split(',').map((s) => s.toLocaleLowerCase());
        const nameIndex = headers.indexOf('name');
        const descriptionIndex = headers.indexOf('description');
        const volumenameIndex = headers.indexOf('volumename');

        return contentLines.map((line) => {
          const parts = line.split(',');
          return {
            name: parts[nameIndex],
            description: parts[descriptionIndex],
            volumeName: parts[volumenameIndex],
          } as OSDrive;
        });
      }),
      catchError((error) => {
        console.error('Error processing Windows drive list:', error);
        return of([]);
      })
    )
  );
}

async function getLinuxDriveList() {
  return lastValueFrom(
    runCommand(['findmnt', '--real', '--output', 'TARGET,SOURCE,FSTYPE,LABEL', '--json']).pipe(
      filter((result): result is string[] => !!result),
      map((lines) => {
        const drives: OSDrive[] = []
        const processFileSystems = (filesystems: FileSystems[]) => {
          filesystems
            .filter((fs) => {
              const target = fs.target;
              return (target === '/' ||
                target.startsWith('/mnt/') ||
                target.startsWith('/media/'));
            })
            .map((fs) => {
              drives.push({
                name: fs.target,
                description: fs.source,
                volumeName: fs.fstype,
              });
              if(fs.children) {
                processFileSystems(fs.children);
              }
            });
        }
        try {
          const fsJson = JSON.parse(lines.join('')) as FindMountStructure;
          if (fsJson && fsJson.filesystems) {
            processFileSystems(fsJson.filesystems)
          }
          return drives;
        } catch (err) {
          console.error('Error parsing findmnt JSON output:', err);
          return [];
        }
      }),
      catchError((error) => {
        console.error('Error processing Linux mounts:', error);
        return of([]);
      })
    )
  );
}

function runCommand([command, ...args]: string[]) {
  const observable = new Observable<string[]>((subscriber) => {
    const cmd = spawn(command, args);
    let stdoutData = '';

    cmd.stdout.on('data', (chunk) => {
      stdoutData += String(chunk);
    });

    cmd.stderr.once('data', (data) => {
      subscriber.error(String(data));
      cmd.kill('SIGINT');
    });

    cmd.once('exit', (code, signal) => {
      console.log('Child Process: ', [command, ...args].join(' '));
      console.log('Exited with code', code);
      console.log('Received termination signal', signal);

      if (stdoutData) {
        const formattedData = stdoutData
          .trim()
          .split('\n')
          .map((line) => line.trim())
          .filter((line) => line.length > 0);

        subscriber.next(formattedData);
      } else {
        subscriber.next([]);
      }

      subscriber.complete();
    });

    process.once('SIGINT', () => cmd.kill('SIGINT'));
  }).pipe(
    catchError((err) => {
      console.error(`Error occurred while running ${command} with args`, args);
      console.error(err);
      return of(null);
    })
  );

  return observable;
}

// Define the OSDrive interface
interface OSDrive {
  name: string;
  description: string;
  volumeName: string;
}

interface FindMountStructure {
  filesystems: FileSystems[]
}

interface FileSystems {
  source: string;
  target: string;
  fstype: string;
  label: string | null;
  children: FileSystems[];
}