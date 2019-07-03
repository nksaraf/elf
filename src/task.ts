// interface TaskItem {
//   command: string;
//   args: string[];
// }

// interface Task {
//   name: string;
//   items: (TaskItem | Task)[];
//   options: any;
// }

// export default async (task: any, options: any) => {
//   let cp = null;
//   const { stdin, stdout, stderr } = options;
//   const stdinKind = detectStreamKind(stdin, process.stdin)
//   const stdoutKind = detectStreamKind(stdout, process.stdout)
//   const stderrKind = detectStreamKind(stderr, process.stderr)
//   const spawnOptions = { stdio: [stdinKind, stdoutKind, stderrKind] }

//    if (options.printName && stdout != null) {
//     stdout.write(task.name);
//   //   stdout.write(createHeader(task, options.packageInfo, options.stdout.isTTY));
//   }

//   cp = spawn(task.path, [], spawnOptions);
//   if (stdinKind === 'pipe') {
//     stdin.pipe(cp.stdin);
//   }
//   if (stdoutKind === 'pipe') {
//     cp.stdout.pipe(
//       stdout,
//       { end: false }
//     );
//   }
//   if (stderrKind === 'pipe') {
//     cp.stderr.pipe(
//       stderr,
//       { end: false }
//     );
//   }

//   cp.on('error', err => {
//     cp = null;
//     reject(err);
//   });
//   cp.on('close', (code, signal) => {
//     cp = null;
//     resolve({ task, code, signal });
//   });
// });

//   promise.abort = function abort() {
//     if (cp != null) {
//       cp.kill();
//       cp = null;
//     }
//   };

//   return promise;
// };
