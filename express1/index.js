const express = require ('express');
const app = express();

const { infoCursos } = require('./datos/cursos.js');

require('dotenv').config();

//const routerProgramacion = express.Router();
const routerProgramacion = require('./routers/programacion.js');
app.use('/api/cursos/programacion', routerProgramacion);

const routerMatematicas = require('./routers/matematicas.js'); 
app.use('/api/cursos/matematicas', routerMatematicas);

//Listen
const port = process.env.PORT || 3000;
app.listen(port, () =>{
    console.log(`Server running on port ${port}`);
});
