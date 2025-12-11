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
  const parsedUrl = new URL(req.url, `http://${req.headers.host}`);
  const url = parsedUrl.pathname;

  //  Page Routes
  if (req.method === "GET" && (url === "/" || url === "/home")) {
    return serveFile(res, "./views/home.html", "text/html");
  }

  if (req.method === "GET" && url === "/projects" && requestAcceptsHtml(req)) {
    return serveFile(res, "./views/projects.html", "text/html");
  }

  if (req.method === "GET" && url === "/projects/add") {
    return serveFile(res, "./views/projects-add.html", "text/html");
  }

  if (req.method === "GET" && url.startsWith("/projects/edit")) {
    return serveFile(res, "./views/projects-edit.html", "text/html");
  }

  if (req.method === "GET" && url === "/calendar") {
    return serveFile(res, "./views/calendar.html", "text/html");
  }

  if (req.method === "GET" && url === "/notes") {
    return serveFile(res, "./views/notes.html", "text/html");
  }

  if (req.method === "GET" && url === "/wikis") {
    return serveFile(res, "./views/wikis.html", "text/html");
  }

  if (req.method === "GET" && url === "/about-me") {
    return serveFile(res, "./views/about-me.html", "text/html");
  }

  if (req.method === "GET" && url === "/user-management") {
    return serveFile(res, "./views/user-management.html", "text/html");
  }

  if (req.method === "GET" && url === "/settings") {
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


  if (req.method === "GET" && url === "/projects") {
    return handleGetProjects(res, parsedUrl.searchParams);
  }

  if (req.method === "POST" && url === "/projects") {
    return handleCreateProject(req, res);
  }

  if (req.method === "PATCH" && url.startsWith("/projects/")) {
    return handleUpdateProject(req, res, url);
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


function requestAcceptsHtml(req) {
  const acceptHeader = req.headers["accept"] || "";
  return acceptHeader.includes("text/html");
}

function sendJson(res, statusCode, payload) {
  res.writeHead(statusCode, { "Content-Type": "application/json" });
  res.end(JSON.stringify(payload));
}

function validateIntegerString(value, fieldName, errors) {
  const parsed = Number.parseInt(value, 10);
  if (Number.isNaN(parsed)) {
    errors.push(`${fieldName} must be an integer`);
    return null;
  }
  return parsed;
}

function validateBooleanString(value, fieldName, errors) {
  if (value === "true") return true;
  if (value === "false") return false;
  errors.push(`${fieldName} must be a boolean`);
  return null;
}

function parseDateBoundary(value, fieldName, boundary, errors) {
  if (!/^\d{2}\/\d{2}\/\d{4}$/.test(value)) {
    errors.push(`${fieldName} must be in MM/DD/YYYY format`);
    return null;
  }

  const [month, day, year] = value.split("/").map(Number);
  const utcDate = boundary === "start"
    ? new Date(Date.UTC(year, month - 1, day, 0, 0, 0, 0))
    : new Date(Date.UTC(year, month - 1, day, 23, 59, 59, 999));

  if (Number.isNaN(utcDate.getTime())) {
    errors.push(`${fieldName} is not a valid date`);
    return null;
  }

  return utcDate;
}

async function parseJsonBody(req) {
  return new Promise((resolve, reject) => {
    let body = "";

    req.on("data", chunk => {
      body += chunk.toString();

      if (body.length > 1_000_000) {
        reject(new Error("Payload too large"));
      }
    });

    req.on("end", () => {
      if (!body) {
        return resolve({});
      }

      try {
        const parsed = JSON.parse(body);
        resolve(parsed);
      } catch (err) {
        reject(new Error("Invalid JSON payload"));
      }
    });

    req.on("error", reject);
  });
}

function validateProjectPayload(body, { requireAllFields = false, requireAnyField = false } = {}) {
  const errors = [];
  const values = {};

  const integerFields = ["project_type_id", "project_area_id", "priority", "status_id", "assignee_id", "order_index"];
  const stringFields = ["title", "description", "acceptance_criteria"];
  const booleanFields = ["is_active"];

  if (requireAllFields) {
    const requiredFields = ["project_type_id", "project_area_id", "title", "priority", "status_id", "is_active"];
    requiredFields.forEach(field => {
      if (body[field] === undefined) {
        errors.push(`${field} is required`);
      }
    });
  }

  integerFields.forEach(field => {
    if (body[field] !== undefined) {
      if (!Number.isInteger(body[field])) {
        errors.push(`${field} must be an integer`);
      } else {
        values[field] = body[field];
      }
    }
  });

  stringFields.forEach(field => {
    if (body[field] !== undefined) {
      if (typeof body[field] !== "string") {
        errors.push(`${field} must be a string`);
      } else if (field === "title" && body[field].length > 200) {
        errors.push("title must be 200 characters or fewer");
      } else {
        values[field] = body[field];
      }
    }
  });

  booleanFields.forEach(field => {
    if (body[field] !== undefined) {
      if (typeof body[field] !== "boolean") {
        errors.push(`${field} must be a boolean`);
      } else {
        values[field] = body[field];
      }
    }
  });

  if (requireAnyField && Object.keys(values).length === 0) {
    errors.push("At least one updatable field must be provided");
  }

  return { errors, values };
}

async function handleGetProjects(res, searchParams) {
  const filters = [];
  const values = [];
  const errors = [];

  const idParam = searchParams.get("id");
  if (idParam !== null) {
    const parsed = validateIntegerString(idParam, "id", errors);
    if (parsed !== null) {
      values.push(parsed);
      filters.push(`id = $${values.length}`);
    }
  }

  const createdStart = searchParams.get("created_start");
  const createdEnd = searchParams.get("created_end");

  if (createdStart || createdEnd) {
    if (!createdStart || !createdEnd) {
      errors.push("created_start and created_end are both required when filtering by created_at");
    } else {
      const startDate = parseDateBoundary(createdStart, "created_start", "start", errors);
      const endDate = parseDateBoundary(createdEnd, "created_end", "end", errors);

      if (startDate && endDate && startDate > endDate) {
        errors.push("created_start must be less than or equal to created_end");
      }

      if (startDate && endDate) {
        values.push(startDate.toISOString());
        values.push(endDate.toISOString());
        filters.push(`created_at BETWEEN $${values.length - 1} AND $${values.length}`);
      }
    }
  }

  const filterableIntegers = ["project_type_id", "project_area_id", "status_id"];
  filterableIntegers.forEach(field => {
    const value = searchParams.get(field);
    if (value !== null) {
      const parsed = validateIntegerString(value, field, errors);
      if (parsed !== null) {
        values.push(parsed);
        filters.push(`${field} = $${values.length}`);
      }
    }
  });

  const isActive = searchParams.get("is_active");
  if (isActive !== null) {
    const parsed = validateBooleanString(isActive, "is_active", errors);
    if (parsed !== null) {
      values.push(parsed);
      filters.push(`is_active = $${values.length}`);
    }
  }

  if (errors.length > 0) {
    return sendJson(res, 400, { errors });
  }

  let query = `SELECT * FROM projects`;

  if (filters.length > 0) {
    query += ` WHERE ${filters.join(" AND ")}`;
  }

  query += " ORDER BY created_at DESC";

  return client.query(query, values, (err, result) => {
    if (err) {
      return sendJson(res, 500, { error: `Database query error: ${err.message}` });
    }

    return sendJson(res, 200, result.rows);
  });
}

async function handleCreateProject(req, res) {
  let body;

  try {
    body = await parseJsonBody(req);
  } catch (err) {
    return sendJson(res, 400, { error: err.message });
  }

  const { errors, values } = validateProjectPayload(body, { requireAllFields: true });

  if (errors.length > 0) {
    return sendJson(res, 400, { errors });
  }

  const columns = Object.keys(values);
  const placeholders = columns.map((_, index) => `$${index + 1}`);
  const queryValues = columns.map(column => values[column]);

  const query = `INSERT INTO projects (${columns.join(", ")}) VALUES (${placeholders.join(", ")}) RETURNING *`;

  return client.query(query, queryValues, (err, result) => {
    if (err) {
      return sendJson(res, 500, { error: `Database query error: ${err.message}` });
    }

    return sendJson(res, 201, result.rows[0]);
  });
}

async function handleUpdateProject(req, res, url) {
  const idPart = url.split("/")[2];
  const projectId = Number.parseInt(idPart, 10);

  if (Number.isNaN(projectId)) {
    return sendJson(res, 400, { errors: ["id must be a valid integer"] });
  }

  let body;

  try {
    body = await parseJsonBody(req);
  } catch (err) {
    return sendJson(res, 400, { error: err.message });
  }

  const { errors, values } = validateProjectPayload(body, { requireAnyField: true });

  if (errors.length > 0) {
    return sendJson(res, 400, { errors });
  }

  const setClauses = Object.keys(values).map((column, index) => `${column} = $${index + 1}`);
  const queryValues = Object.keys(values).map(column => values[column]);
  queryValues.push(projectId);

  const query = `UPDATE projects SET ${setClauses.join(", ")} WHERE id = $${queryValues.length} RETURNING *`;

  return client.query(query, queryValues, (err, result) => {
    if (err) {
      return sendJson(res, 500, { error: `Database query error: ${err.message}` });
    }

    if (result.rows.length === 0) {
      return sendJson(res, 404, { error: "Project not found" });
    }

    return sendJson(res, 200, result.rows[0]);
  });
}


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