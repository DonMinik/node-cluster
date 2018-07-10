const cluster = require('cluster');
const numCPUs = require('os').cpus().length;

function doSomething() {

}

if (cluster.isMaster) {
    console.log(`Master ${process.pid} is running`);
    for (let i = 0; i < numCPUs; i++) {
        cluster.fork();
    }

    cluster.on('exit', (worker, code, signal) => {
        console.log(`worker ${worker.process.pid} died`);
    });


    for (const id in cluster.workers) {
        if (id < 4)
            cluster.workers[id].send('doSomething');
        if (id === '6')
            cluster.workers[id].send('kill');
    }

} else  if (cluster.isWorker) {
    console.log(`Worker ${process.pid} started`);

    process.on('message',(msg) =>{
        switch (msg) {
            case 'doSomething':
                console.log(`Worker ${process.pid} doing something`);
                break;
            case 'kill':
                console.log(`Worker ${process.pid} shutdown`);
                cluster.worker.kill();
                break;
            default:
                console.log(`Worker ${process.pid} doing nothing`);
        }
    });
}
