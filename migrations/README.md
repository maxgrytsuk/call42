#Used tools

NodeJS migration tool:
https://www.npmjs.com/package/migrate-database


Module that emulates the official mongodb API:
https://github.com/mafintosh/mongojs


#Examples

create migration:
grunt migrate:create --name migrations_name

migrate up:
NODE_ENV=<env:development, production> grunt migrate:up

migrate down :
NODE_ENV=<env:development, production> grunt migrate:down
