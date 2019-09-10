# elf
YAML syntax-based task runner

Runfile format
```yaml
deploy <project>:
  - print Deploying ${project}
  - npm: run build
  - npm: link

hello:
  print: '${name}'
  
dev: watch deploy elf

env:
  name: elf
  nodemon: node_modules/.bin/nodemon

path:
  watch: ${nodemon} --exec run
```

Command to run:
```shell
run deploy proj
run watch npm run dev
run dev
```
