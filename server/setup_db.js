const mysql = require("mysql2/promise");

async function createDatabase() {
  const connection = await mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "",
    port: 3306, // tambahkan eksplisit
  });

  try {
    await connection.query("CREATE DATABASE IF NOT EXISTS npc");
    console.log("Database npc created or already exists");
  } catch (error) {
    console.error("Error creating database:", error.message);
    process.exit(1);
  } finally {
    await connection.end();
  }
}

createDatabase();
