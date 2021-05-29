pastebin-ts
===

[![NPM](https://nodei.co/npm/pastebin-ts.svg?downloads=true&stars=true)](https://nodei.co/npm/pastebin-ts/)
[![Build Status](https://travis-ci.org/j3lte/pastebin-ts.svg?branch=master)](https://travis-ci.org/j3lte/pastebin-ts)
[![DAVID](https://david-dm.org/j3lte/pastebin-ts.svg)](https://david-dm.org/j3lte/pastebin-ts)
[![npm version](https://badge.fury.io/js/pastebin-ts.svg)](http://badge.fury.io/js/pastebin-ts)
[![Development Dependency Status](https://david-dm.org/j3lte/pastebin-ts/dev-status.svg?theme=shields.io)](https://david-dm.org/j3lte/pastebin-ts#info=devDependencies)
[![Code Climate](https://codeclimate.com/github/j3lte/pastebin-ts/badges/gpa.svg)](https://codeclimate.com/github/j3lte/pastebin-ts)

Typescript version of the Pastebin API client

## Features

* getPaste : get a raw paste
* createAPIuserKey : get a userkey for the authenticated user
* listUserPastes : get a list of the pastes from the authenticated user
* getUserInfo : get a list of info from the authenticated user
* listTrendingPastes : get a list of the trending pastes on Pastebin
* createPaste : create a paste
* createPasteFromFile : read a file (UTF8) and paste it
* deletePaste : delete a paste created by the user


## Starting

```js
import { login } from "@gxldxm/mega-api"

async function main(){
    let user = await login({
        email: "EMAIL@TEST.COM",
        password: "SECRET_PASSWORD",
        useTor: true //if you has installed tor in command line can use this
    })
}

main()
```

## Update a file

```js

let nodeId = "ID_FOR_HANDLE_FILE"

let properties = {
    amazing: true,
    important: true,
    stars: 4,
    description: "some desc"
}

try {
 await user.files.update({ nodeId, properties })

}
catch {
 console.log("something when wrong, please try again")
}
```


## Export a file

```js

let nodeId = "ID_FOR_HANDLE_FILE"

try {
 let link = await user.files.export({ nodeId })

}
catch {
 console.log("something when wrong, please try again")
}
```


## Upload a url

```js
 let link = await user.files.upload({ url: "someurl", target })
```
