const http = require("http");
const PORT = process.env.PORT || 5000;
const app = require("./app");

const server = http.createServer(app);

server.listen(PORT, () => console.log(`Server started on port ${PORT}`));
