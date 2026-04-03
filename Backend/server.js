const DBConnect = require('./Config/db');
const config = require('./Config/config');

class Server {
	constructor() {
		this.PORT = config.PORT;
	}
	async initialize() {
		try {
			await DBConnect.connect();
			console.log("Server initialized successfully");
		} catch (error) {
			console.error("Initialization failed:", error);
			process.exit(1);
		}

	}
}

const server = new Server();
server.initialize();