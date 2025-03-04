const z = require('zod'); // Validaciones con zod -> para POST
const movieSchema = z.object({
    title:z.string({
        invalid_type_error: 'Movie title must be a string',
        required_error: 'Movie title is required'
    }),
    year:z.number().int().positive(), // que sea entero y positivo
    director:z.string(),
    duration: z.number().int().positive(),
    rate: z.number().min(0).max(10).default(0), // Opcional
    poster:z.string().url(), // Validar que sea una url
    genre: z.array(
        // Aceptar solo estos generos en el array
        z.enum(['Action','Adventure','Comedy','Drama','Fanstasy','Horror','Thriller','Scri-Fi','Crime']),
        {
            required_error:'Movie genre is required'
        }
    )
});

function validateMovie(object) {
    // Validacion que pasa por el schema
    return movieSchema.safeParse(object);
}

/** Para actualizar una movie, no todas las 
 * propiedades seran requeridas, quizas solo quieren actaulizar 
 * el title o alguna otra propiedad
 */
function validatePartialMovie(object) {
    // El partial hara opcionales todas las propiedades
    return movieSchema.partial().safeParse(object);
}

module.exports = {
    validateMovie,
    validatePartialMovie
}