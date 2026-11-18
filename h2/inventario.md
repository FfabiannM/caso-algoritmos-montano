# Inventario de operacciones de tu caso

### 1. Qué datos guarda el proceso y cuántos maneja (hoy y en el peor caso).

El motor de emparejamiento que administra dos colecciones para cruzar la oferta y demanda de propiedades.

- Catálogo de propiedades: Guarda un identificador único, atributos de categoría (`ciudad, zona, tipo`), atributos numéricos (`precio_usd, superficie_m2, habitaciones`) y metadatos como la fecha de publicación.
- Busquedas guardadas: Guarda el identificador único, la categoría buscada (`ciudad, zona, tipo`) y preferencias del cliente (`precio_min, precio_max, habitaciones_min`).
- En un mes normal: el sistema sostiene alrededor de 5,000 propiedades activas y 10,000 búsquedas guardadas.
- En el peor mes: La escala puede alcanzar las 10,000 propiedades activas y 20,000 búsquedas guardadas.

### 2. Qué operaciones se realizan y con qué frecuencia

Operaciones de alta frecuencia

- 1. Buscar por clave exacta: En caso de que una propiedad sea nueva, localizarla al instante qué tipo de búsqueda guardada puede pertenecer esa combinación exacta. En un mal mes, si entran 10,000 propiedades o se reevalúan, esta búsqueda de coincidencia ocurre miles de veces en minutos.
- 2. Buscar por rango: Una vez ubicado a qué búsqueda puede pertenecer, este se debe filtrar qué clientes tienen un presupuesto donde `precio_min <= precio_usd <= precio_max` y `habitaciones >= habitaciones_min`. Esta es una de las operaciones más pesadas porque se está evaluando el precio y cantidad de habitaciones.

#### Otras operaciones que se realizan con menor frecuencia

- Insertar: Aunque en un día se pueden realizar varias inserciones, estas se realizan de manera incremental durante todo el día.
- Borrar: Aunque realmente se desactivan, este proceso no es realmente común ya que también se permite la edición.
- Recorrer en orden: Generalmente para realizar reportes.

###
