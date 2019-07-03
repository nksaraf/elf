// import parser from 'yargs-parser';
import _ from 'lodash';
import { RunFile, Command, Environment } from './types';

const RUN_PATH = ['run'];

const isInRunPath = (command: string) => Boolean(RUN_PATH.find(run_path => run_path === command));

export default (runfile: RunFile): Environment => {
  const { env, ...tasks } = runfile;
  for (const task_name in tasks) {
    env.path[task_name] = {
      name: task_name,
      commands: compile_task_body(tasks[task_name])
    };
  }
  return env;
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
