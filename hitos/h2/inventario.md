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

### Tipo de operación, qué estructura la resuelve más barato, cuál sufre y como se aplican conceptos de Tabla Hash

- A. Buscar por clave exacta ("`Cochabamba | Norte | Departamento`")
  - Estructura que lo resuelve barato: Tabla Hash
    - Diccionario (`O(1)`). Usando `Map` con JavaScript (Lo mismo que `Dicctionary` en C#). Funicona como un casillero con etiqueta, en lugar de estar revisando 10,000 búsquedas una por una, la etiqueta `Cochabamba | Norte | Departamento` pasa por una función que lleva directamente al casillero exacto donde están los interesados, sin importar si hay miles de registros.
  - Estructura que sufre: Un array desordenado O(n) o una lista enlazada, ya que obligan a leer etiqueda por etiqueda desde el inicio hasta el final.

- Buscar por rango
  - Estructura que sufre: Tabla Hash O(n). Aquí está la limitación fundamental del diccionario: la funcción hash tecnicamente destruye el orden para poder saltar directo al casillero. Si se pregunta a una tabla el hash de un rango "entre $60,000 y $90,000" el diccionario no tiene forma de saber qué casillero tiene esos precios, sifre porque tiene que abrir todos los casilleros y revisar uno por uno.
  - Estrutura que lo resuelve barato: Un arreglo ordenado + busqueda binaria
    - Para un rango: Con los precios ordenados dentro de cada casillero, la búsqueda binaria encuentra el inicio del rango en O(log n) con unos 16 pasos para unos 48,000 datos y el cual recorre solo los k inmuebles que entran en el presupuesto.
