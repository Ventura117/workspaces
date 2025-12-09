const http = require('http');
const { Client } = require('pg');
const fs = require('fs');
const path = require('path');

// --- Configure PostgreSQL connection ---
const client = new Client({
  user: 'postgres',
  host: 'localhost',
  database: 'workspaces',
  password: '7654',
  port: 5432, // default PostgreSQL port
});

// Connect to the database
client.connect()
  .then(() => console.log('Connected to PostgreSQL'))
  .catch(err => console.error('Database connection error:', err));

const server = http.createServer((req, res) => {
  const url = req.url;

  //  Page Routes
  if (url === "/" || url === "/home") {
    return serveFile(res, "./views/home.html", "text/html");
  }

  if (url === "/projects") {
    return serveFile(res, "./views/projects.html", "text/html");
  }

  if (url === "/projects/add") {
    return serveFile(res, "./views/projects-add.html", "text/html");
  }

  if (url.startsWith("/projects/edit")) {
    return serveFile(res, "./views/projects-edit.html", "text/html");
  }

  if (url === "/calendar") {
    return serveFile(res, "./views/calendar.html", "text/html");
  }

  if (url === "/notes") {
    return serveFile(res, "./views/notes.html", "text/html");
  }

  if (url === "/wikis") {
    return serveFile(res, "./views/wikis.html", "text/html");
  }

  if (url === "/about-me") {
    return serveFile(res, "./views/about-me.html", "text/html");
  }

  if (url === "/user-management") {
    return serveFile(res, "./views/user-management.html", "text/html");
  }

  if (url === "/settings") {
    return serveFile(res, "./views/settings.html", "text/html");
  }

  //  CSS Routes
  if (url === "/styles/layout.css") {
    return serveFile(res, "./styles/layout.css", "text/css");
  }

  if (url === "/styles/home.css") {
    return serveFile(res, "./styles/home.css", "text/css");
  }

  if (url === "/styles/projects.css") {
    return serveFile(res, "./styles/projects.css", "text/css");
  }

  if (url === "/styles/projects-add.css") {
    return serveFile(res, "./styles/projects-add.css", "text/css");
  }

  if (url === "/styles/projects-edit.css") {
    return serveFile(res, "./styles/projects-edit.css", "text/css");
  }

  if (url === "/styles/calendar.css") {
    return serveFile(res, "./styles/calendar.css", "text/css");
  }

  if (url === "/styles/notes.css") {
    return serveFile(res, "./styles/notes.css", "text/css");
  }

  if (url === "/styles/wikis.css") {
    return serveFile(res, "./styles/wikis.css", "text/css");
  }

  if (url === "/styles/about-me.css") {
    return serveFile(res, "./styles/about-me.css", "text/css");
  }

  if (url === "/styles/user-management.css") {
    return serveFile(res, "./styles/user-management.css", "text/css");
  }

  if (url === "/styles/settings.css") {
    return serveFile(res, "./styles/settings.css", "text/css");
  }


  //  JS Routes
  if (url === "/scripts/layout.js") {
    return serveFile(res, "./scripts/layout.js", "text/javascript");
  }

  if (url === "/scripts/home.js") {
    return serveFile(res, "./scripts/home.js", "text/javascript");
  }

  if (url === "/scripts/projects.js") {
    return serveFile(res, "./scripts/projects.js", "text/javascript");
  }

  if (url === "/scripts/projects-add.js") {
    return serveFile(res, "./scripts/projects-add.js", "text/javascript");
  }

  if (url === "/scripts/projects-edit.js") {
    return serveFile(res, "./scripts/projects-edit.js", "text/javascript");
  }

  if (url === "/scripts/calendar.js") {
    return serveFile(res, "./scripts/calendar.js", "text/javascript");
  }

  if (url === "/scripts/notes.js") {
    return serveFile(res, "./scripts/notes.js", "text/javascript");
  }

  if (url === "/scripts/wikis.js") {
    return serveFile(res, "./scripts/wikis.js", "text/javascript");
  }

  if (url === "/scripts/about-me.js") {
    return serveFile(res, "./scripts/about-me.js", "text/javascript");
  }

  if (url === "/scripts/user-management.js") {
    return serveFile(res, "./scripts/user-management.js", "text/javascript");
  }

  if (url === "/scripts/settings.js") {
    return serveFile(res, "./scripts/settings.js", "text/javascript");
  }


  //  API: Sidebar items
if (url === "/api/sidebar_options") {
  const query = `
    SELECT id, label, url, icon, order_index, parent_id, is_active
    FROM sidebar_options
    WHERE is_active = TRUE
    ORDER BY parent_id NULLS FIRST, order_index
  `;

  return client.query(query, (err, result) => {
    if (err) {
      res.writeHead(500, { "Content-Type": "text/plain" });
      return res.end(`Database query error: ${err.message}`);
    }

    res.writeHead(200, { "Content-Type": "application/json" });
    res.end(JSON.stringify(result.rows));
  });
  }


  // 404 If no route found
  res.writeHead(404, { "Content-Type": "text/plain" });
  res.end(`Route not found: ${url}`);
});


// Smarter File Serving Helper
function serveFile(res, filePath, contentType) {
  const resolvedPath = path.join(__dirname, filePath);

  fs.readFile(resolvedPath, (err, data) => {
    if (err) {
      // Specific error handling
      const code = err.code === "ENOENT" ? 404 : 500;
      const message =
        code === 404
          ? `File not found: ${filePath}`
          : `Server error reading file: ${filePath} (${err.message})`;

      res.writeHead(code, { "Content-Type": "text/plain" });
      return res.end(message);
    }

    res.writeHead(200, { "Content-Type": contentType });
    res.end(data);
  });
}

server.listen(3000, () => {
  console.log("Server running on port 3000");
});