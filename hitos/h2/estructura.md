# Estructura elegida y el Costo O de cada operación

Para la estructura y para resolver ambas necesidades, la arquitectura elegida es una híbrida de dos niveles:

- Nivel 1 -- Tabla Hash: Usa como clave los datos `ciudad|zona|tipo` para separar el catálogo por ubicación y categoría al mismo tiempo.
- Nivel 2 -- BTS por precio_usd: Dentro de cada casillero del diccionario, el lugar de buscar una lista desordenada, se almacenarán las propiedades en un árbol jerárquico indexado por su precio.

### ¿Por qué?

El arbol como bien se mencionó, es una jerarquía que está organizada bajo la regla de: **menores a la izquierda, mayores a la derecha**. Esto transforma a la búsqueda en el juego de adivinar el número, en cada nodo que visitamos, comparamos el precio buscado contra la raíz y descartamos de inmediato la mitad del arbol que no nos sirve. Así en caso de tener 16 propiedades,
