import cosmiconfig, { ExplorerOptions } from 'cosmiconfig';
import strip_json_comments from 'strip-json-comments';
import parse_json from 'parse-json';
import fs from 'fs';
import assert from 'assert';

import { RunFile } from './types';
import _ from 'lodash';

const FILE_NAME = 'run';
const RUN_SOURCES = ['yaml', 'yml', 'jsonc', 'json', 'js'].map(ext => `${FILE_NAME}.${ext}`);

const json_with_comments_loader = (filepath: string, content: string) =>
  parse_json(strip_json_comments(content, { whitespace: false }));

const isValidCommandObject = (val: object) => _.isObject(val) && !_.isArray(val);

const isValidCommandArray = (val: object) =>
  Array.isArray(val) && val.every(item => typeof item === 'string' || isValidCommandObject(item));

const fix_runfile = (runfile: cosmiconfig.Config): RunFile => {
  assert(runfile);
  const { env = {}, path = {}, ...tasks } = runfile;
  const { path: env_path = {}, ...vars } = env;

  assert(Object.values(vars).every((val: any) => val.toString()));

  assert(
    Object.values(tasks).every(
      (val: any) => typeof val === 'string' || isValidCommandObject(val) || isValidCommandArray(val)
    )
  );

  return {
    env: {
      path: Object.assign({}, path, env_path),
      vars
    },
    ...tasks
  };
};

export default (filepath: string = ''): RunFile => {
  let sources;
  if (filepath !== undefined && filepath.length > 0 && fs.existsSync(filepath)) {
    sources = [filepath, ...RUN_SOURCES];
  } else {
    if (filepath.length > 0) {
      console.log(`Invalid path=${filepath} provided. Falling back to looking for defaults...`);
    }
    sources = [...RUN_SOURCES];
  }

  const cosmic_options: ExplorerOptions = {
    searchPlaces: sources,
    loaders: {
      '.json': { sync: json_with_comments_loader },
      '.jsonc': { sync: json_with_comments_loader }
    }
  };

  const explorer = cosmiconfig('runner', cosmic_options);
  const runfile = explorer.searchSync();

  if (runfile === null || runfile.config === undefined) {
    throw new Error('No runfile found');
  }

  return fix_runfile(runfile.config);
};
