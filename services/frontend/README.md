# CRM - NG APP

## Setup

To bootstrap the application you will need to install `npm` and `bower` dependencies. Run `npm install && bower install` on the terminal on your first run and everytime you deploy to a new location.

We use `GruntJS` as our main task runner, as with `bower` we will need to install it globally first. Run `npm install -g grunt grunt-cli` if you don't have it already installed.

In order to compile and server our application we use many *grunt* tasks, for further details check the `grunt` folder.

## Running the app

To run the app locally we use: 
```grunt dev```
This runs a *connect* server with *livereload* and a *watch* task to rebuild the site when any of the assets on the `src` folder changes.

To build the app and compress the assets we run:
```grunt build```

 