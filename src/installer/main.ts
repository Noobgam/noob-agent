import { Service } from "node-windows"
import path from "path";

// Create a new service object
const svc = new Service({
    name: 'Noob agent',
    description: 'Noob agent.',
    script: path.join(process.cwd(), 'dist', 'bundle.cjs'),
    //, workingDirectory: '...'
    //, allowServiceLogon: true
});

// Listen for the "install" event, which indicates the
// process is available as a service.
svc.on('install',function(){
    svc.start();
});

svc.on('alreadyinstalled ',function(){
    svc.uninstall();
});

svc.uninstall();
