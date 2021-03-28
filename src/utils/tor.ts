const net = require('net');
const os = require('os');
const _fs = require('fs');
const _path = require('path');
const SocksProxyAgent = require('socks-proxy-agent');




import axios, { AxiosInstance } from "axios";
const { exec, spawn } = require("child_process");





export class Tor {
    process: any

    constructor(){
        
        
    }
    start(): Promise<AxiosInstance> {
        return new Promise((resolve, reject) => {
        this.process = spawn("tor");

        this.process.stdout.on("data", data => {
            console.log(data.toString("utf8"))
            if (data.includes("100%")) {
                //is connected to tor

                console.log("tor is running...")
               let axiosInstance = torSetup({
                ip: 'localhost',
                port: "9050",
            })
                resolve(axiosInstance)
            }
        });

        this.process.on('error', (error) => {
            reject(error)
        });
        

        this.process.on("close", code => {
            console.log(`child process exited with code ${code}`);
        });
        this.process.stderr.on("data", data => {
            console.log(`stderr: ${data}`);
        });

        })


    }

    kill(){
        this.process.stdin.pause();
         this.process.kill()
    }
}



let torConfig = {
    ip: '127.0.0.1',
    port: '9050',
    path: '',
    controlPort: '9051',
    controlPassword: 'giraffe',
}

const httpAgent = function() {
    return new SocksProxyAgent(`socks5h://${torConfig.ip}:${torConfig.port}`);
}

const httpsAgent = function() {
    return new SocksProxyAgent(`socks5h://${torConfig.ip}:${torConfig.port}`);
}

export function torSetup({ ip = 'localhost', port = '9050', path = '', controlPort = '9051', controlPassword = 'giraffe' }): any {

    torConfig.ip = ip === 'localhost' ? '127.0.0.1' : ip;
    torConfig.port = port;
    torConfig.path = path;
    torConfig.controlPort = controlPort;
    torConfig.controlPassword = controlPassword;

    return {
        torNewSession,
        ...axios.create({
            'httpAgent': httpAgent(),
            'httpsAgent': httpsAgent(),
        }),
        httpAgent,
        httpsAgent,
    };
}

export function torIPC(commands) {
    return new Promise(function (resolve, reject) {
        let socket = net.connect({
            host: torConfig.ip || '127.0.0.1',
            port: torConfig.controlPort || 9051,
        }, function() { 
            let commandString = commands.join( '\n' ) + '\n';
            socket.write(commandString);
            //resolve(commandString);
        });

        socket.on('error', function ( err ) {
            reject(err);
        });
      
        let data = '';
        socket.on( 'data', function ( chunk ) {
            data += chunk.toString();
        });
      
        socket.on( 'end', function () {
            resolve(data);
        });
    });
}

function torNewSession(): Promise<string>{
    let commands = [
        'authenticate "' + torConfig.controlPassword + '"', // authenticate the connection
        'signal newnym', // send the signal (renew Tor session)
        'quit' // close the connection
    ];
    
    return new Promise(function (resolve, reject) {
        torIPC(commands).then(function(data: string) {
            let lines = data.split( os.EOL ).slice( 0, -1 );
            let success = lines.every( function ( val, ind, arr ) {
                // each response from the ControlPort should start with 250 (OK STATUS)
                return val.length <= 0 || val.indexOf( '250' ) >= 0
            });

            if ( !success ) {
                let err = new Error( 'Error communicating with Tor ControlPort\n' + data )
                reject(err);
            }

            resolve('Tor session successfully renewed!!');
            //resolve(data);
        }).catch(function (err) {
            reject(err);
        });
    });
}

export default Tor