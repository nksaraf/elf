@{%
import lexer from './lexer';
function ast(token: any) {
  console.log(token);
  return { value: token.value, token };
}
%}

@preprocessor typescript

@lexer lexer

main -> task:*

task -> task_header _? %indent task_body %dedent {% function(data) {return { name: ast(data[0][0]), params: data[0][1].map(p => ast(p)), body: ast(data[2]) };} %}
# statement -> %word br{% id %}
task_header -> identifier parameter_list %colon
task_body -> %word br
parameter_list -> parameter:+
parameter -> _:+ %bracket_open %word %bracket_close {% function(data) { return data[data.length-2]; } %}
identifier -> %word {% id %}


br -> %nl
_? -> %ws:? {% id %}
_ -> %ws {% id %}