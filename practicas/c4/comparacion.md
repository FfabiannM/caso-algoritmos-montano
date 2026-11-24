## Comparación entre búsqueda Binaria y Lineal

La mejor opción es la Busqueda binaria (O(log n)) por permitir encontrar el indice exacto donde empiezan y terminan los precios según la problemática. Conviene ordenar el arreglo y buscar, ya que hacer una búsqueda lineal tardaría más.

Esto también se refleja en la problemática ya que una búsqueda más exacta aún con orden es más rápido. Cuando se realiza un match entre una propiedad y una búsqueda de un cliente, una búsqueda lineal sería demasiado lento. El incremento de propiedades y busquedas irá cada vez más a favor de la busqueda binaria.

Tabla Comparativa: 1.000 búsquedas en arreglo ordenado de 1.000.000 enteros

| (index) | Algoritmo          | Tiempo Promedio (ms) | Cociente | Factor de Mejora      |
| ------- | ------------------ | -------------------- | -------- | --------------------- |
| 0       | 'Búsqueda Lineal'  | '366.5634'           | '0.0028' | '1.00x (base)'        |
| 1       | 'Búsqueda Binaria' | '0.1687'             | '7.3284' | '2172.44x más rápida' |
