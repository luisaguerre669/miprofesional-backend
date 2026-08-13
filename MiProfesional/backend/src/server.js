require("dotenv").config();

const express = require("express");
const cors = require("cors");
const connectDB = require("./config/db");

const authRoutes = require("./routes/auth");
const bookingsRoutes = require("./routes/bookings");
const professionalsRoutes = require("./routes/professionals");
const categoriesRoutes = require("./routes/categories");
const chatRoutes = require("./routes/chat");
const usersRoutes = require("./routes/users");
const uploadRoutes = require("./routes/upload");
const adminRoutes = require("./routes/admin");
const analyticsRoutes = require("./routes/analytics");
const reviewsRoutes = require("./routes/reviews");
const ratingsRoutes = require("./routes/ratings");
const identityRoutes = require("./routes/identity");
const subscriptionRoutes = require("./routes/subscription");
const paymentsRoutes = require("./routes/payments");
const mercadopagoRoutes = require("./routes/mercadopago.routes");
const healthRoutes = require("./routes/health");
const geocodeRoutes = require("./routes/geocode");
const cvRoutes = require("./routes/cv");
const auditRoutes = require("./routes/audit");
const notificationsRoutes = require("./routes/notifications");

class Server {
  constructor() {
    this.app = express();
    this.port = process.env.PORT || 10000;
    this.middlewares();
    this.routes();
  }

  middlewares() {
    this.app.use(cors());
    this.app.use(express.json());
  }

  routes() {
    const mount = (path, router) => { if (router) this.app.use(path, router); };

    mount("/api/auth", authRoutes);
    mount("/api/bookings", bookingsRoutes);
    mount("/api/professionals", professionalsRoutes);
    mount("/api/categories", categoriesRoutes);
    mount("/api/chat", chatRoutes);
    mount("/api/users", usersRoutes);
    mount("/api/upload", uploadRoutes);
    mount("/api/admin", adminRoutes);
    mount("/api/analytics", analyticsRoutes);
    mount("/api/reviews", reviewsRoutes);
    mount("/api/ratings", ratingsRoutes);
    mount("/api/identity", identityRoutes);
    mount("/api/subscription", subscriptionRoutes);
    mount("/api/payments", paymentsRoutes);
    mount("/api/mercadopago", mercadopagoRoutes);
    mount("/api/health", healthRoutes);
    mount("/api/geocode", geocodeRoutes);
    mount("/api/cv", cvRoutes);
    mount("/api/audit", auditRoutes);
    mount("/api/notifications", notificationsRoutes);

    this.app.get("/health", (req, res) => {
      res.json({
        ok: true,
        message: "Servidor saludable",
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        environment: process.env.NODE_ENV || "development"
      });
    });

    this.app.get("/", (req, res) => {
      res.json({
        ok: true,
        message: "API MiProfesional funcionando correctamente",
        version: "1.0.0",
        timestamp: new Date().toISOString()
      });
    });
  }

  async start() {
    try {
      await connectDB();
    } catch (error) {
      console.error("Error conectando a la base de datos:", error.message);
      process.exit(1);
    }
    this.app.listen(this.port, () => {
      console.log("Servidor corriendo en puerto", this.port);
    });
  }
}

const server = new Server();
server.start();
