# Orionode
A minimal, single-user deployment of [Eclipse Orion](http://www.eclipse.org/orion/). Use for hacking files on your computer using Orion's editing environment.

## Features
* Basic Navigator operations (Create file/folder, delete file/folder, copy/move/rename a file)
* Basic Editor operations (Edit file, save file, ETags)
* Plugin operations
* Shell command for launching a node app (type ```help node``` in the Shell page to find out more)
* Shell command for supporting npm. You use it the same way as you do in Bash.
* Client caching for static content (cache time: 2 hours)
* Gzip
* Concatenation and minification of pages (requires a manual step, see **Concatenation + Minification**, below)

## Requirements
* node.js (plus npm).
* A modern web browser with Web Socket support (for example: Firefox 15, Chrome 22, Internet Explorer 10, Safari 6).

## Known Issues
* See the [list of open bugs](https://bugs.eclipse.org/bugs/buglist.cgi?list_id=4064489&classification=Eclipse&query_format=advanced&bug_status=UNCONFIRMED&bug_status=NEW&bug_status=ASSIGNED&bug_status=REOPENED&component=Node&product=Orion).
* In particular, the node.js development features are a work in progress. Current limitations are:
    * There's no way to provide standard input to a running node app.

## Usage
1. Clone the [orion client repository](http://git.eclipse.org/c/orion/org.eclipse.orion.client.git/) by using one of the following URLs:
	* [git://git.eclipse.org/gitroot/orion/org.eclipse.orion.client.git](git://git.eclipse.org/gitroot/orion/org.eclipse.orion.client.git)
	* [ssh://git.eclipse.org/gitroot/orion/org.eclipse.orion.client.git](ssh://git.eclipse.org/gitroot/orion/org.eclipse.orion.client.git)
	* [http://git.eclipse.org/gitroot/orion/org.eclipse.orion.client.git](http://git.eclipse.org/gitroot/orion/org.eclipse.orion.client.git)
2. Open a command shell and change directory to ```org.eclipse.orion.client/modules/orionode```.
3. Run this command to automatically download Orionode's dependencies:
    ```npm install```
(This will take a few minutes).
4. Verify the default path of npm-cli.js.
   In the same directory, open the server.conf file. The default value of npm_path is ../lib/node_modules/npm/bin/npm-cli.js.
   This is the npm module path to support npm command. Make sure if this default path is correct, relative to the node executable directory in your environment.
   If you installed a recent version of nodejs the NPM should be installed automatically. The default value of npm_path should work in most of the cases.
   How to confirm:
   For instance, if you are using Bash just type "which npm" and see where the command is. The command should eventually use the npm-cli.js file. Make sure your npm-cli.js matches the npm_path value.
   If not, then change the npm-path value to match your environment. It can be either an absolute path or a path relative to your node executable.
5. **Recommended:** create a one-line ```password.txt``` file containing a secret password. If you do not want a separate file for password, you can still define that in the server.conf or just leave the pwd value as empty.
6. Launch the Orion server by running one of the following commands from a shell.
	* If you installed by checking out the Git repo:
	```node server.js [-p port] [-w directory] [-password password.txt]```
	* If you're not passing any command-line arguments to the server, you can just do this:
	```npm start```
7. Go to **[http://localhost:8081](http://localhost:8081)** (or whatever port you chose) in your web browser to start using Orion.

##### Optional command line arguments:
* ```-p``` or ```-port```: the port that the Orion server will listen on. Defaults to **8081**.
* ```-pwd``` or ```-password```: path to a file containing a password. If provided, Orionode will enforce HTTP Basic Authentication 
with the password (the auth 'User' field is ignored -- Orionode only verifies the password). Use caution: if you don't provide a password
file, **no authentication** is used (so anyone request can read and write your files!).
* ```-w``` or ```-workspace```: the target directory for reading and writing files. Will be created if it doesn't exist. Defaults to a subdirectory 
named **.workspace** in the repository folder.
* ```-dev```: starts the server in development mode. In this mode, some client-side code is not cached by the browser, to ease development.
* ```-log```: logs each request served to standard output.


## Use Orionode to debug your node.js application
You can use Orionode to debug your node.js application. If you have exisiting node.js applications, make sure the code is under a subfolder in the -w option when you start Orionnode. This will give you easy access to your node.js apps from within Orionode.
You can also create a new node.js application in your workspace.

1. After Orionode starts, open the shell page and use help to see what commands are available.
2. 'cd' to the folder where your application lives.
3. Use 'node debug yourApp.js givenPort' to start your app in debug mode. You can start multiple apps in debug mode by repeating this step.
4. In the return value of the 'node debug' command, you will see a "debugURL" string.
5. Copy and paste the debug URL into a webkit browser (e.g., Chrome, Safari) and start debugging. The URL normally looks something like: ```http://yourOrionNodeServer:8900/debug?port=theGivenPort```.

## Security Concerns
No security is guaranteed or even implied. Always run Orionode with the ```-pwd``` flag to prevent unauthorized access to your files.

## Concatenation + Minification
By default the pages served up by Orionode are not concatenated or minified, so they will load rather slowly.
You can mitigate this by running the client-side build. To do this, just run ```build.js```, found in the ```build``` directory:

    orionode $ node ./build/build.js
    -------------------------------------------------------
    [lots of output]
    orionode $

Clear your browser cache. The next time you load Orionode, it should be much faster.

## Other ways of using Orionode
You can use Orionode as a file server, to access your local files from [Orionhub.org](http://www.orionhub.org/) (or any other Orion installation). All you need is 
Orionode and a publicly-accessible URL pointing to your local Orionode server.

1. Visit this page on your Orionode server (the hostname will differ from this example) and copy its URL:
[http://yourOrionNodeServer:8081/plugins/fileClientPlugin.html](http://yourOrionNodeServer:8081/plugins/fileClientPlugin.html)
2. Log in to Orionhub.
3. Click the user menu in the top right-hand corner of the page, then click **Settings**.
4. Select the **Plugins** category, click **Install**, paste in the URL, click **Submit**.
5. Return to the Navigator page. Your Orionode files should appear as a new filesystem in the left-hand sidebar.
