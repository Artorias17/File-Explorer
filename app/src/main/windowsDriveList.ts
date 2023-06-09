import { spawn } from 'child_process';
import {
  Observable,
  catchError,
  concatAll,
  filter,
  lastValueFrom,
  map,
  of,
  takeLast,
  toArray,
} from 'rxjs';

export async function getDriveList() {
  const driveList = await lastValueFrom(
    runWMIC('logicaldisk get name'.split(/\s+/g)).pipe(
      filter((result): result is string[] => !!result),
      concatAll(),
      map((driveName) => {
        return {
          name: driveName,
          description: runWMIC(
            `logicaldisk where name='${driveName}' get description`.split(
              /\s+/g
            )
          ).pipe(
            filter((result): result is string[] => !!result),
            concatAll(),
            takeLast(1)
          ),
          volumeName: runWMIC(
            `logicaldisk where name='${driveName}' get volumename`.split(/\s+/g)
          ).pipe(
            filter((result): result is string[] => !!result),
            concatAll(),
            takeLast(1)
          ),
        };
      }),
      toArray()
    )
  );
  return await Promise.all(
    driveList.map(async (drive) => {
      return {
        name: `${drive.name}\\`,
        description: await lastValueFrom(drive.description),
        volumeName: await lastValueFrom(drive.volumeName),
      } as OSDrive;
    })
  );
}

function runWMIC(args: string[]) {
  const observable = new Observable<string[]>((subscriber) => {
    const cmd = spawn('wmic', args);

    cmd.stdout.once('data', (chunk) => {
      let data = String(chunk);
      let formattedData = data
        .trim()
        .split('\r\n')
        .slice(1)
        .map((line) => line.trim());

      if (formattedData.length === 0) {
        formattedData.push('');
      }
      subscriber.next(formattedData);
      cmd.kill('SIGINT');
    });

    cmd.stderr.once('data', (data) => {
      subscriber.error(String(data));
      cmd.kill('SIGINT');
    });

    cmd.once('exit',  (code, signal) => {
      console.log('Child Process: ', ['wmic', ...args].join(' '));
      console.log('Exited with code', code);
      console.log('Received termination signal', signal);
      subscriber.complete();
    });

    process.once('SIGINT', () => cmd.kill('SIGINT'));

  }).pipe(
    catchError((err) => {
      console.error('Error occurred while running wmic with args', args);
      console.error(err);
      return of(null);
    })
  );

  return observable;
}
