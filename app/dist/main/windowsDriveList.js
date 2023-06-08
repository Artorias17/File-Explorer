"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getDriveList = void 0;
const child_process_1 = require("child_process");
const rxjs_1 = require("rxjs");
function getDriveList() {
    return __awaiter(this, void 0, void 0, function* () {
        const driveList = yield (0, rxjs_1.lastValueFrom)(runWMIC('logicaldisk get name'.split(/\s+/g)).pipe((0, rxjs_1.filter)((result) => !!result), (0, rxjs_1.concatAll)(), (0, rxjs_1.map)((driveName) => {
            return {
                name: driveName,
                description: runWMIC(`logicaldisk where name='${driveName}' get description`.split(/\s+/g)).pipe((0, rxjs_1.filter)((result) => !!result), (0, rxjs_1.concatAll)(), (0, rxjs_1.takeLast)(1)),
                volumeName: runWMIC(`logicaldisk where name='${driveName}' get volumename`.split(/\s+/g)).pipe((0, rxjs_1.filter)((result) => !!result), (0, rxjs_1.concatAll)(), (0, rxjs_1.takeLast)(1)),
            };
        }), (0, rxjs_1.toArray)()));
        return yield Promise.all(driveList.map((drive) => __awaiter(this, void 0, void 0, function* () {
            return {
                name: `${drive.name}\\`,
                description: yield (0, rxjs_1.lastValueFrom)(drive.description),
                volumeName: yield (0, rxjs_1.lastValueFrom)(drive.volumeName),
            };
        })));
    });
}
exports.getDriveList = getDriveList;
function runWMIC(args) {
    const observable = new rxjs_1.Observable((subscriber) => {
        const cmd = (0, child_process_1.spawn)('wmic', args);
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
            cmd.kill();
        });
        cmd.stderr.once('data', errorCallback(subscriber));
        cmd.once('exit', exitCallback(subscriber, ['wmic', ...args].join(' ')));
    }).pipe((0, rxjs_1.catchError)((err) => {
        console.error('Error occurred while running wmic with args', args);
        console.error(err);
        return (0, rxjs_1.of)(null);
    }));
    return observable;
}
function exitCallback(subscriber, command) {
    return (code, signal) => {
        console.log('Child Process: ', command);
        console.log('Exited with code', code);
        console.log('Received termination signal', signal);
        subscriber.complete();
    };
}
function errorCallback(subscriber) {
    return (data) => subscriber.error(String(data));
}
//# sourceMappingURL=windowsDriveList.js.map