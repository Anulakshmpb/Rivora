const mongoose = require("mongoose");
const config = require("./config");

class DbConnection {
	constructor() {
		if (DbConnection.instance) {
			return DbConnection.instance;
		}
		this.isConnected = false;
		this.metrics = {
			reconnectAttempts: 0,
			failures: 0,
		}
		DbConnection.instance = this;
	}
	async connect() {
		try {
			if (this.isConnected) {
				console.log("already connected");
				return;
			}
			if (!config.MONGO_URL) {
				console.log("url missing");
			}
			const options = {
				useNewUrlParser: true,
				useUnifiedTopology: true,
				maxPoolSize: 10,
				minPoolSize: 2,
				serverSelectionTimeoutMS: 5000,
				socketTimeoutMS: 45000,
				family: 4
			}
			await mongoose.connect(config.MONGO_URL, options);
			this.isConnected = true;
			console.log("db connected");
			this.registerEvents();



		} catch (error) {
			console.log("error");
			process.exit(1);
		}
	}
	registerEvents() {
		mongoose.connection.on('connected', () => {
			console.log("conneced");
		})
		mongoose.connection.on('disconnect', () => {
			console.log("disconnected");
			this.isConnected = false;
		})
		mongoose.connection.on('reconnect', () => {
			console.log("reconnected");
			this.metrics.reconnectAttempts++;
			this.isConnected = true;
		})
		mongoose.connection.on('error', (err) => {
			console.log(err);
			this.isConnected = false;
			this.metrics.failures++;
		})
	}
	async disconnect() {
		try {
			await mongoose.connection.close();
			this.isConnected = false;
			console.log("disconnected");
		} catch (error) {
			console.log("error", error);
		}
	}
	async healthCheck() {
		try {
			await mongoose.connection.db.admin().ping();
			return {
				healthy: "healthy",
				connect: this.isConnected
			}
		} catch (error) {
			console.log("unHealthy");
		}
	}
	async getmetrics() {
		return this.metrics
	}
	connectionStatus() {
		return {
			isConnected: this.isConnected,
			readyState: mongoose.connection.readyState,
			host: mongoose.connection.host,
			port: mongoose.connection.port,
			name: mongoose.connection.name
		};
	}
}
const DBConnect = new DbConnection();

const gracefulShutdown = async () => {
	console.log("shutting down...");
	await DBConnect.disconnect();
	process.exit(0);
}

process.on("SIGINT", gracefulShutdown);

process.on("SIGTERM", gracefulShutdown);

process.on("unhandledRejection", (error) => {

	console.error("Unhandled rejection", error);

});

process.on("uncaughtException", (error) => {

	console.error("Uncaught exception", error);

	process.exit(1);

});

module.exports = DBConnect;