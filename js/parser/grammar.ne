@{%
import lexer from './lexer';
import { NodeData } from '../../pkg/spectre';

function createToken({
  type = "none",
  value = "",
  text = "",
  offset = 0,
  lineBreaks = 0,
  line = 0,
  col = 0,
}: moo.Token) {
  return new NodeData({ token_type: type, value, text, offset, lineBreaks, line, col });
};

function ast(token: any) {
  console.log(token);
  return createToken(token);
}
%}

@preprocessor typescript

@lexer lexer

main -> task:*

  task -> task_header _? %indent task_body %dedent {% 
    function(data) {
      return { 
        name: ast(data[0][0]).value, 
        params: data[0][1].map(v => v.render()), 
        body: ast(data[3]).render()
      };
    } %}
    # statement -> %word br{% id %}
    task_header -> identifier parameter_list %colon 
      parameter_list -> parameter:+ {% function(tokens) { return tokens[0].map(p => ast(p)); } %}
        parameter -> _:+ %bracket_open %word %bracket_close {% function(data) { return data[data.length-2]; } %}
    task_body -> %word br {% id %}

identifier -> %word {% id %}


br -> %nl
_? -> %ws:? {% id %}
_ -> %ws {% id %}