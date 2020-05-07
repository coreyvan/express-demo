const Joi = require("@hapi/joi");
const express = require("express");
const pino = require("pino");
const expressPino = require("express-pino-logger");

// Set up logging
const logger = pino({ level: process.env.LOG_LEVEL || "info" });
const expressLogger = expressPino({ logger });

// Set up application
const app = express();

// Set up global middleware
app.use(express.json());
app.use(expressLogger);

const courses = [
  { id: 1, name: "course1" },
  { id: 2, name: "course2" },
  { id: 3, name: "course3" },
];

// GET /
app.get("/", (req, res) => {
  const id = randomId.getRandomId();
  res.send(`Hello World [${id}]`);
});

// GET /api/courses
app.get("/api/courses", (req, res) => {
  res.send(courses);
});

// GET /api/courses/:id
app.get("/api/courses/:id", (req, res) => {
  const course = courses.find((c) => c.id === parseInt(req.params.id));
  if (!course) {
    logger.error(`Course with id ${req.params.id} does not exist`);
    res.status(404).send("Course not found");
    return;
  }
  res.send(course);
});

// POST /api/courses
app.post("/api/courses", (req, res) => {
  const result = validateCourse(req.body);

  if (result.error) {
    var err;
    for (const detail of result.error.details) {
      err = err + detail.message;
    }
    logger.error(err);
    res.status(400).send(err);
    return;
  }
  const course = {
    id: courses.length + 1,
    name: req.body.name,
  };

  courses.push(course);
  res.send(course);
});

// PUT /api/courses/:id
app.put("/api/courses/:id", (req, res) => {
  const course = courses.find((c) => c.id === parseInt(req.params.id));
  if (!course) {
    logger.error(`Course with id ${req.params.id} does not exist`);
    res.status(404).send(`Course with id ${req.params.id} does not exist`);
    return;
  }
  const result = validateCourse(req.body);

  if (result.error) {
    var err;
    for (const detail of result.error.details) {
      err = err + detail.message;
    }
    logger.error(err);
    res.status(400).send(err);
    return;
  }

  course.name = req.body.name;
  res.send(course);
});

// DELETE /api/courses/:id
app.delete("/api/courses/:id", (req, res) => {
  const course = courses.find((c) => c.id === parseInt(req.params.id));
  if (!course) {
    logger.error(`Course with id ${req.params.id} does not exist`);
    res.status(404).send(`Course with id ${req.params.id} does not exist`);
    return;
  }

  const index = courses.indexOf(course);
  courses.splice(index, 1);

  res.send(course);
});

// Helper functions
// ----------------

// validateCourse validates params
function validateCourse(course) {
  const schema = Joi.object({
    name: Joi.string().min(3).required(),
  });

  return schema.validate(course);
}

const port = process.env.NODE_PORT || 3000;
const server = app.listen(port, () =>
  logger.info(`Listening on port ${port}...`)
);

process.on("SIGINT", () => {
  server.close(() => {
    logger.info("Process terminated... Goodbye");
  });
});
