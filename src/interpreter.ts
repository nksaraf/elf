import yargs from 'yargs';
import repl, { select_task } from './repl';
import { Terminal, Interpreter } from './types';

export default (terminal: Terminal): Interpreter => {
  return (tokens: string[]) =>
    yargs
      .reset()
      .command(['repl', 'r'], 'Run repl', {}, (argv: any) => {
        repl(terminal);
      })
      .command(['task [task]', 'run', '$0'], 'Run specified task', {}, (argv: any) => {
        if (argv.task) {
          terminal.run({
            command: argv.task,
            args: process.argv
              .slice(process.argv.findIndex(item => item === argv.task) + 1)
              .join(' ')
          });
        } else {
          select_task(terminal).then(task =>
            terminal.run({
              command: task,
              args: ''
            })
          );
        }
      })
      .command(['list', 'ls'], 'Show list of tasks', {}, () => {
        console.log(
          terminal
            .list()
            .map(({ name }) => name)
            .join('\n')
        );
      })
      .help()
      .demandCommand()
      .parse(tokens);
};
