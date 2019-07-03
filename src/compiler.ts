// import parser from 'yargs-parser';
import _ from 'lodash';
import { RunFile, Command, Environment, PositionalArgs } from './types';

const RUN_PATH = ['run'];

const isInRunPath = (command: string) => Boolean(RUN_PATH.find(run_path => run_path === command));

export default (runfile: RunFile): Environment => {
  const { env, ...tasks } = runfile;
  for (const task_name in tasks) {
    const { name, args_pattern } = compile_task_name(task_name);
    env.path[name] = {
      name,
      positional_args: compile_args_pattern(args_pattern),
      commands: compile_task_body(tasks[task_name])
    };
  }
  return env;
};

const compile_task_name = (name: string): { name: string; args_pattern: string } => {
  const parts = name.split(' ');
  return { name: parts[0], args_pattern: parts.slice(1).join(' ') };
};

const compile_task_body = (item: string | object | (string | object)[]): Command[] => {
  if (_.isString(item)) {
    return compile_string(item);
  } else if (_.isArrayLike(item)) {
    return compile_list(item);
  } else if (_.isObject(item)) {
    return compile_object(item);
  }
  return [];
};

const compile_command = (command: string, args: string[]): Command => {
  if (isInRunPath(command)) {
    const [task, ...task_args] = args;
    return { command: task, args: task_args.join(' ') };
  }
  return { command, args: args.join(' ') };
};

const compile_string = (item: string) => {
  const [command, ...args] = item.split(' ');
  return [compile_command(command, args)];
};

const compile_list = (items: (string | object)[]) =>
  items.flatMap((item: string | object) =>
    typeof item === 'string' ? compile_string(item) : compile_object(item)
  );

const compile_object = (items: object) =>
  Object.entries(items).flatMap(([name, value]): Command[] => {
    if (typeof value === 'string') {
      return [compile_command(name, value.split(' '))];
    } else if (Array.isArray(value)) {
      return [];
    } else if (_.isObject(value)) {
      return compile_object(value);
    }
    return [{ command: name, args: '' }];
  });

const compile_args_pattern = (args_pattern: string): PositionalArgs => {
  const positional_args = [];
  let parts = args_pattern.split(' ');
  for (let arg of parts) {
    if (is_optional(arg)) {
      positional_args.push({
        optional: arg.split('|').map(s => s.replace('[', '').replace(']', ''))
      });
    } else if (is_required(arg)) {
      positional_args.push({
        required: arg.split('|').map(s => s.replace('<', '').replace('>', ''))
      });
    } else if (arg !== '') {
      throw new Error(`Invalid config in the ${arg} position.`);
    }
  }
  return positional_args;
};

function is_optional(arg: string) {
  return arg.match(/^\[(\w+|\*)((?:\|(\w+))*?)]/);
}

function is_required(arg: string) {
  return arg.match(/^<(\w+|\*)((?:\|(\w+))*?)>/);
}
