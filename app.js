const http = require('http');
const port = process.env.PORT || 3000;
const server = http.createServer((req, res) => {
  res.end('Hello from Jenkins CI/CD! (Remote Deploy + Webhook)');
});
server.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});
