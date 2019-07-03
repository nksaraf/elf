import yargs from 'yargs';
import repl, { select_task } from './repl';

export default (machine: any) => {
  return (tokens: string[]) =>
    yargs
      .command(['repl', 'r'], 'Run repl', {}, (argv: any) => {
        repl(machine);
      })
      .command(['task [task]', 'run', '$0'], 'Run specified task', {}, (argv: any) => {
        if (argv.task) {
          machine.run({
            command: argv.task,
            args: process.argv
              .slice(process.argv.findIndex(item => item === argv.task) + 1)
              .join(' ')
          });
        } else {
          select_task(machine).then(task =>
            machine.run({
              command: task,
              args: ''
            })
          );
        }
      })
      .command('list', 'Show list of tasks', {}, () => {
        console.log(machine.list().join('\n'));
      })
      .help()
      .demandCommand()
      .parse(tokens);
};

// const execute = (env, args) => {
//   yargs
// }

// export default (_env: Environment) => {
//   const env = { ..._env };
//   return (args) => {
//     yargs.
//   }
// };
