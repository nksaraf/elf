const { Input, AutoComplete } = require('enquirer');
import interpreter from './interpreter';
import { Terminal } from './types';

export const select_task = async (terminal: Terminal) => {
  const tasks = terminal.list().map(({ name }) => name);
  const prompt = new AutoComplete({
    name: 'task',
    message: 'Select task to run',
    choices: tasks
  });
  return await prompt.run();
};

export default async (terminal: any) => {
  const interpret = interpreter(terminal);
  try {
    while (true) {
      const prompt = new REPLPrompt({
        name: 'command',
        message: '> '
      });

      const command = await prompt.run();
      interpret(command.trim().split(' '));
    }
  } catch (error) {
    error.message && console.log(error.message);
  }
};

class REPLPrompt extends Input {
  constructor(options: any) {
    super(options);
  }
  prefix = () => '>';
  separator = () => '';
  message = () => '';
}
