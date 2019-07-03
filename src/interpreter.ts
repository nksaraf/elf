import yargs from 'yargs';

export default (machine: any) => {
  return (tokens: string[]) =>
    yargs
      .boolean('repl')
      .command(['task <task>', 'run', '$0'], 'Run specified task', {}, (argv: any) => {
        machine.run({
          command: argv.task,
          args: process.argv.slice(process.argv.findIndex(item => item === argv.task) + 1)
        });
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
