require('http').createServer((req,res)=>{res.end(require('fs').readFileSync('./api/runner.py'))}).listen(8081, ()=>console.log('Server is running on 8081'));
