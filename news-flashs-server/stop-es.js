const { exec } = require("child_process");

const containerName = "es01";

console.log(`docker: Stopping Docker container: ${containerName}...`);

exec(`docker stop ${containerName}`, (error, stdout, stderr) => {
  if (error) {
    console.error(`docker: Error stopping container: ${error.message}`);
    return;
  }
  if (stderr && !stderr.trim().includes(containerName)) {
    console.error(`docker: Stderr: ${stderr}`);
    return;
  }
  console.log(`docker: Container '${containerName}' stopped successfully.`);
  if (stdout) {
    console.log(`docker: Stdout: ${stdout}`);
  }
});
