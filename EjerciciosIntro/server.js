const http = require('http');

const cursos = {
    infoCursos: {
        programacion: ["JavaScript", "Python", "Java"],
        matematicas: ["Álgebra", "Cálculo", "Geometría"]
    }
};

const servidor = http.createServer((req, res) => {
    switch (req.method) {
        case 'GET':
            return manejarSolicitudesGET(req, res);
        case 'POST':
            return manejarSolicitudesPOST(req, res);
        case 'PUT':
            return manejarSolicitudesPUT(req, res);
        case 'DELETE':
            return manejarSolicitudesDELETE(req, res);
        default:
            res.statusCode = 405;
            res.end('Método no permitido');
    }
});

function manejarSolicitudesGET(req, res) {
    const path = req.url;
    res.setHeader('Content-Type', 'application/json');
    
    if (path === '/') {
        res.end(JSON.stringify({ mensaje: 'Bienvenido a la API de cursos' }));
    } else if (path === '/cursos') {
        res.end(JSON.stringify(cursos.infoCursos));
    } else if (path === '/cursos/programacion') {
        res.end(JSON.stringify(cursos.infoCursos.programacion));
    } else if (path === '/cursos/matematicas') {
        res.end(JSON.stringify(cursos.infoCursos.matematicas));
    } else {
        res.statusCode = 404;
        res.end(JSON.stringify({ mensaje: 'Ruta no encontrada' }));
    }
}

function manejarSolicitudesPOST(req, res) {
    if (req.url === '/cursos/programacion' || req.url === '/cursos/matematicas') {
        let cuerpo = '';
        req.on('data', chunk => {
            cuerpo += chunk.toString();
        });
        req.on('end', () => {
            try {
                const nuevoCurso = JSON.parse(cuerpo);
                const categoria = req.url.split('/')[2];
                cursos.infoCursos[categoria].push(nuevoCurso.nombre);
                res.statusCode = 201;
                res.end(JSON.stringify({ mensaje: `Curso agregado a ${categoria}`, curso: nuevoCurso }));
            } catch (error) {
                res.statusCode = 400;
                res.end(JSON.stringify({ mensaje: 'Error en los datos enviados' }));
            }
        });
    } else {
        res.statusCode = 404;
        res.end(JSON.stringify({ mensaje: 'Ruta no encontrada para POST' }));
    }
}

function manejarSolicitudesPUT(req, res) {
    if (req.url.startsWith('/cursos/programacion') || req.url.startsWith('/cursos/matematicas')) {
        let cuerpo = '';
        req.on('data', chunk => {
            cuerpo += chunk.toString();
        });
        req.on('end', () => {
            try {
                const datosActualizados = JSON.parse(cuerpo);
                const categoria = req.url.split('/')[2];
                const indice = cursos.infoCursos[categoria].indexOf(datosActualizados.anterior);
                
                if (indice !== -1) {
                    cursos.infoCursos[categoria][indice] = datosActualizados.nuevo;
                    res.statusCode = 200;
                    res.end(JSON.stringify({ mensaje: `Curso actualizado en ${categoria}`, curso: datosActualizados }));
                } else {
                    res.statusCode = 404;
                    res.end(JSON.stringify({ mensaje: 'Curso no encontrado' }));
                }
            } catch (error) {
                res.statusCode = 400;
                res.end(JSON.stringify({ mensaje: 'Error en los datos enviados' }));
            }
        });
    } else {
        res.statusCode = 404;
        res.end(JSON.stringify({ mensaje: 'Ruta no encontrada para PUT' }));
    }
}

function manejarSolicitudesDELETE(req, res) {
    res.statusCode = 501;
    res.end(JSON.stringify({ mensaje: 'Método DELETE no implementado' }));
}

const port = 3000;
servidor.listen(port, () => {
    console.log(`Servidor ejecutándose en el puerto ${port}`);
});