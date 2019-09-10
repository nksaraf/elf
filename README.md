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

path:
  watch: npx nodemon --exec run
  edit: code
```

Command to run:
```shell
run deploy proj
run watch npm run dev
run dev
run edit README.md
```
