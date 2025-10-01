const { exec } = require("child_process");

const command =
  'docker run -d --name es01 -p 9200:9200 -p 9300:9300 -e "xpack.security.enabled=false" -e "discovery.type=single-node" docker.elastic.co/elasticsearch/elasticsearch:8.10.4';

console.log("docker: creating elasticsearch container...");

console.log('docker: Creating Elasticsearch Docker container...');
console.log(`docker: Executing: ${command}`);

exec(command, (error, stdout, stderr) => {
  if (error) {
    console.error(`docker: Error creating container: ${error.message}`);
    if (stderr) {
        console.error(`docker: Stderr: ${stderr}`);
    }
    return;
  }
  console.log('docker: Container created successfully.');
  console.log(`docker: Container ID: ${stdout}`);
});
