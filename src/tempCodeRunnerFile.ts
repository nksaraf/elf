const parser = new nearley.Parser(nearley.Grammar.fromCompiled(grammar));
parser.feed(readFileSync('.run').toString());
console.log(parser.results);