import {AnkiService} from "./main";

// Listen for the "install" event, which indicates the
// process is available as a service.
AnkiService.on('install',function(){
    AnkiService.start();
});
AnkiService.install()
