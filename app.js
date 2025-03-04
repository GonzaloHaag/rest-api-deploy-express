/** REST es una arquitectura de software
 * Escabilidad - Simplicidad - Portabilidad - Visibilidad
 * Cada recurso se identifica con una URL
 */
const express = require('express'); // require --> CommonJS

const app = express();

app.use(express.json()); // --> Clave para leer datos del body(middleware)

app.disable('x-powered-by'); // Deshabilitar el header de express

// Solucion cors para permitir solo algunos origines que se conecten a nuestra api

const ACCEPTED_ORIGINS = [
    'http://localhost:8080',
    'http://localhost:1234',
    'http://movies.com',
    'http://midu.dev',
]
const movies = require('./movies.json');
const { validateMovie, validatePartialMovie } = require('./schemas/movies_schema');


app.get('/',(req,res) => {
    res.json({message:'Hola mundo'})
});

/** Obtener todas las peliculas en la ruta /movies o 
 * tambien quiero obtener las peliculas por un genero mediante 
 * un query params 
 * /movies?genre=terror --> Importante que es una query
 */
app.get('/movies',(req,res) => {
    // SOLUCION ERROR DE CORS --> Solo falta la cabecera
    const origin = req.header('origin');
    if(ACCEPTED_ORIGINS.includes(origin) || !origin) {
        // Si no llega el origin es porque estamos en el mismo dominio en el front y en el back
        res.header('Access-Control-Allow-Origin',origin); // Permitir solo esa url, para permitir cualquiera poner *
    }
    const { genre } = req.query; // obtengo el genre de la query
    if(genre) {
        // Si viene el genre, porque es opcional, tener en cuenta que el genre es un array
        // const filteredMovies = movies.filter((movie) => movie.genre.includes(genre));
        const filteredMovies = movies.filter(
            // Para que funcione mejor hago el filtro en minusculas
            movie => movie.genre.some(g => g.toLowerCase() === genre.toLowerCase())
        )
        return res.json(filteredMovies);
    }

    // Si no hay genre devuelvo todas
    res.json(movies);
})
/** Obtener pelicula por id */
app.get('/movies/:id',(req,res) => {
    const movieId = req.params.id; // obtenemos el id de los parametros
    const movieFind = movies.find((movie) => movie.id === movieId);
    if(!movieFind) {
        res.status(404).json({message:'Movie not found'});
        return;
    }
    res.json(movieFind);
});

/** Crear una pelicula POST en la ruta /movies */
app.post('/movies',(req,res) => {
    // Validaciones con zod
    const result = validateMovie(req.body); // Se lo mandamos para que valide
    if(result.error) {
        return res.status(400).json({error: JSON.parse(result.error.message)})
    }
    const newMovie = {
        // Creamos el id nosotors
        id: crypto.randomUUID(),
        // En data ya estan todos los datos validados
        ...result.data // Aca devuelve la movie si todo fue correcto
    }
    movies.push(newMovie);
    res.status(201).json({message:'Movie created!',newMovie})
});


/* Actualizar una movie 
--> patch porque solo vamos a actualizar algunas 
propiedades, no todo. Necesitamos el id para actualizar **/
app.patch('/movies/:id',(req,res) => {
    const result = validatePartialMovie(req.body); // Mando lo que me llega en el body para validar
    if(result.error) {
        return res.status(400).json({error:JSON.parse(result.error.message)})
    }
    const { id } = req.params;
    const movieIndex = movies.findIndex((movie) => movie.id === id);
    if(movieIndex < 0 ) {
        return res.status(400).json({message:'Movie not found'});
    }
    // Actualizar propiedades de la movie 

    const updateMovie = {
        ...movies[movieIndex],
        ...result.data // Todo lo que tengamos validado
    }
    // Lo guardamos
    movies[movieIndex] = updateMovie;
    return res.json(updateMovie);

});


// Metodo delete, ojo con el CORS

app.delete('/movies/:id',(req,res) => {
    const { id } = req.params;
    const movieIndex = movies.findIndex((movie) => movie.id === id);

    if(movieIndex === -1) {
        return res.status(404).json({message:'Movie not found'});
    }
    movies.splice(movieIndex,1)

    return res.json({message:'Movie deleted'})
});

// Para el CORS debemos indiciarle esto tambien 
app.options('/movies/:id',(req,res) => {
    const origin = req.header('origin');
    if(ACCEPTED_ORIGINS.includes(origin) || !origin) {
        // Si no llega el origin es porque estamos en el mismo dominio en el front y en el back
        res.header('Access-Control-Allow-Origin',origin); // Permitir solo esa url, para permitir cualquiera poner *
        // Metodos que permitira 
        res.header('Access-Control-Allow-Methods','GET,POST,PATCH,DELETE')
    }
})

const PORT = process.env.PORT ?? 1234;


app.listen(PORT,() => {
    console.log(`Server running on port http://localhost:${PORT}`)
})