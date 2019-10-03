@{%
import lexer from './lexer';
function ast(token: any) {
  return { value: token.value, token };
}
%}

@preprocessor typescript

@lexer lexer

main -> task:* {% function(data) { return data[0][0]; } %}

task -> task_header
# statement -> %word br{% id %}

task_header -> identifier parameter_list indentation {% function(data) {return { name: ast(data[0]), params: data[1].map(p => ast(p)) };} %}
indentation -> _? %colon br %indent %word br %dedent
parameter_list -> parameter:+
parameter -> _:+ %bracket_open %word %bracket_close {% function(data) { return data[data.length-2]; } %}
identifier -> %word {% id %}


br -> %nl
_? -> %ws:? {% id %}
_ -> %ws {% id %}