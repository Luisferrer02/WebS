const express = require("express");

const { programacion } = require("../datos/cursos.js").infoCursos;

const routerProgramacion = express.Router();

// Middleware to parse JSON
routerProgramacion.use(express.json());

routerProgramacion.get("/", (req, res) => {
  res.json(programacion);
});

// GET route for specific language
routerProgramacion.get("/:lenguaje", (req, res) => {
  const lenguaje = req.params.lenguaje;
  const data = programacion.filter((curso) => curso.lenguaje === lenguaje);

  if (data.length === 0) {
    return res.status(404).send("No se encontraron cursos de " + lenguaje);
  }

  res.json(data);
});

// GET route for specific language and level
routerProgramacion.get("/:lenguaje/:nivel", (req, res) => {
  const lenguaje = req.params.lenguaje;
  const nivel = req.params.nivel;
  const data = programacion.filter(
    (curso) => curso.lenguaje === lenguaje && curso.nivel === nivel
  );

  if (data.length === 0) {
    return res
      .status(404)
      .send("No se encontraron cursos de " + lenguaje + " con nivel " + nivel);
  }

  if (req.query.ordenar == "vistas") {
    console.log("Ordenando");
    res.send(JSON.stringify(data.sort((a, b) => b.vistas - a.vistas)));
  } else {
    res.send(JSON.stringify(data));
  }
});

routerProgramacion.post("/", (req, res) => {
  const nuevoCurso = req.body;
  programacion.push(nuevoCurso);
  res.send(JSON.stringify(nuevoCurso));
  //res.status(201).json({ mensaje: 'Curso agregado', curso: nuevoCurso });
});

routerProgramacion.put("/:id", (req, res) => {
  const cursoActualizado = req.body;
  const id = req.params.id;
  const indice = programacion.findIndex((curso) => curso.id == id);
  // Si no lo encuentra, devuelve -1
  if (indice >= 0) {
    programacion[indice] = cursoActualizado;
  }
  res.send(JSON.stringify(programacion));
});

routerProgramacion.delete("/:id", (req, res) => {
  const id = req.params.id;
  const indice = programacion.findIndex((curso) => curso.id == id);
  if (indice >= 0) {
    //Elementos a eliminar desde el índice
    programacion.splice(indice, 1);
  }
  res.send(JSON.stringify(programacion));
});

module.exports = routerProgramacion;
