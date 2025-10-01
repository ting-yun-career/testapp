const { exec } = require("child_process");

const containerName = "es01";

console.log(`docker: Starting Docker container: ${containerName}...`);

exec(`docker start ${containerName}`, (error, stdout, stderr) => {
  if (error) {
    console.error(`docker: Error starting container: ${error.message}`);
    return;
  }
  if (stderr && !stderr.trim().includes(containerName)) {
    console.error(`docker: Stderr: ${stderr}`);
    return;
  }
  console.log(`docker: Container '${containerName}' started successfully.`);
  if (stdout) {
    console.log(`docker: Stdout: ${stdout}`);
  }
});
