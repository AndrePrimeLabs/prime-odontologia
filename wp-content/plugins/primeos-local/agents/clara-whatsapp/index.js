// Clara WhatsApp Agent (scaffold)
const manifest = require('./manifest.json');
console.log('Starting', manifest.display_name);

(async function main(){
  // Example: load interface (WhatsApp adapter) and run a simple loop
  try{
    const iface = require('./bodyparts/interface/interface.js');
    const perception = require('./bodyparts/perception/perception.js');
    const reasoning = require('./bodyparts/reasoning/reasoning.js');
    // in real agent you would set up webhook server and handlers
    await iface({startup:true});
    await perception({startup:true});
    await reasoning({startup:true});
    console.log('Clara WhatsApp scaffold ready');
  }catch(e){
    console.error('Agent failed to start', e);
    process.exit(1);
  }
})();
