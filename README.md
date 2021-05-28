# Front Collectronics CRM Plugin

## What is this?
This project is a simple companion app for Front that surfaces Collectronics records related to a selected conversation.

![Image of the plugin](/screenshot-single-match.png)

## Pre-requisite
- Create a custom plugin [here](https://app.frontapp.com/settings/tools/plugins) and a Front API token [here](https://app.frontapp.com/settings/tools/api).


## Quick start
- Clone this repository.
- From within the repository, run `yarn install`.
- Make a copy of the `.env.sample` file and rename it `.env`.
- Find your Collectronics API credentials and update the `COLLECTRONICS_USERNAME`, `COLLECTRONICS_PW`, and `COLLECTRONICS_API_URL` values in the `.env` file.
- Run `yarn dev` to run the app in development mode.
- Open a browser and visit [https://localhost:3000](https://localhost:3000) to accept the unsafe HTTPS connection.
- Open Front in the same browser as the above step, and add https://localhost:3000 as a plugin in your Front account, in dev mode.

Note: because plugins must be served over HTTPS, when developing locally it's easier to do everything in the web app. Once your plugin is ready for production, it will work in the exact same way in the desktop app as it does in the web app.

The plugin will reload if you make edits.<br />
You will also see any lint errors in the console.

## Dev commands
The project is split into two pieces: a client serving the plugin files, and a minimalist server fetching data from external system(s).
- `yarn start` will run the client code only.
- `yarn server` will run the server code only.
- `yarn dev` is a combination of both.

## How to use this project
This plugin creates a bridge between a conversation displayed in Front and a contact record kept in the Collectronics CRM.

- Select a conversation in Front
- The plugin client will issue a GET request to the server which will contact the Collectronics search API to look up records by any reference numbers found in the conversation subject and/or body, falling back to the customer's email address if needed
- If a single matching record is found, its account details will be displayed in the right sidebar. If multiple or no matching records are found, the sidebar will indicate as such and display a link to open Collectronics directly in another tab. Unfortunately, as of 5/28/21 the Collectronics API does not cleanly distinguish between multiple vs no matching records found.
- Reference numbers are formatted as capital letters, followed by a dash, then a number, then optionally another dash and state designation (e.g., XYX-101, CAMC-181-GA, etc).
- If you expected to see a single match for a given conversation but instead see "No or multiple accounts", it's possible the conversation contains multiple tokens that look like a reference number, and those reference numbers match multiple records in Collectronics.

## Building and deploying

### `yarn build`
Once you're ready to deploy your plugin, use `yarn build` to build the client code for production. Production files will appear in the `build` folder and copied to the `server/build`.<br />
It correctly bundles React in production mode and optimizes the build for the best performance.

The client build is minified and the filenames include the hashes.<br />
The server is set to serve files from the `server/build` folder.

**To secure communication between Front and your plugin, do not forget to add your plugin's authentication secret as the `AUTH_SECRET` environment variable.**
