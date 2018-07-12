const cluster = require('cluster');
const numCPUs = require('os').cpus().length;


if (cluster.isMaster) {
    let sendCount = 0;
    console.log(`Master ${process.pid} is running`);
    for (let i = 0; i < numCPUs; i++) {
        cluster.fork();
    }

    cluster.on('exit', (worker, code, signal) => {
        console.log(`worker ${worker.process.pid} died`);
    });



    for (const id in cluster.workers) {

        let data = {msg: ''};
        if (id <= 4) {
            cluster.workers[id].on('message', (msg) =>{
                console.log(msg);
                sendCount--;
                if (sendCount <= 0) {
                    console.log('all done');
                    cluster.disconnect();
                }
            });
            data.msg = 'doSomething';
            sendCount++;
        }

        if (id === '6')
            data.msg = 'kill';
        cluster.workers[id].send(data);

    }

} else  if (cluster.isWorker) {
    console.log(`Worker ${process.pid} started`);

    process.on('message',(data) =>{
        switch (data.msg) {
            case 'doSomething':
                console.log(`Worker ${process.pid} doing something`);
                process.send({msg:"done"});
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


