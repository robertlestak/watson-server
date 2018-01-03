# watson-server

A slim NodeJS and PostgreSQL server to sync your Watson CLI logs.

## Configure

````
cp .env-sample .env
````

## Deployment

````
docker-compose up -d
````

## Set Up Database

````
yarn run migrate
````

## Add Users

Simply add the desired token(s) in the PostgreSQL database and then configure your local watson client:

````
watson config backend.token [token]
````
