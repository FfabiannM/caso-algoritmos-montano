# Estructura elegida y el Costo O de cada operación

Para la estructura y para resolver ambas necesidades, la arquitectura elegida es una híbrida de dos niveles:

- Nivel 1 -- Tabla Hash: Usa como clave los datos `ciudad|zona|tipo` para separar el catálogo por ubicación y categoría al mismo tiempo.
- Nivel 2 -- BTS por precio_usd: Dentro de cada casillero del diccionario, el lugar de buscar una lista desordenada, se almacenarán las propiedades en un árbol jerárquico indexado por su precio.

### ¿Por qué?

Como se mencionó, el arbol es una jerarquía que está organizada bajo la regla de: **menores a la izquierda, mayores a la derecha**. Esto transforma a la búsqueda en el juego de adivinar el número, en cada nodo que visitamos, comparamos el precio buscado contra la raíz y descartamos de inmediato la mitad del arbol que no nos sirve.

La tabla hash resuelve en tiempo constante la igualdad categórica exacta, mientras que el árbol AVL mantiene las propiedades ordenadas dinámicamente sin desplazar memoria al insertar o borrar. Al ser auto-balanceado, garantiza que su altura nunca se degenere en una lista ($h \approx \log_2 n$) incluso cuando los datos lelgan ordenados por fecha o precio desde la DB.

Además la jerarquía del árbol brinda dos recorridos naturales útiles para el negocio:

- Recorrido inorden (izquierda -> raiz -> derecha): Visita todos los nodos de menor a mayor precio, permitiendo entregar listados ordenados por presupuesto en O(n) sin ejecutar ningún algoritmo de ordenamiento adicional.
- Recorrido preorden (raiz -> izquierda -> derecha): Permite exportar o clonar la estructura exacta del índice jerárquico desde la raíz hacia sus ramas para respaldos en memoria o caché.

Básicamente según lo avanzado, lo que un árbol hace y un hash no, son los rangos para resolver `precio_min <= precio_usd <= precio_max`, el árbol desciende O(log n) hasta el límite inferior, quita todas las ramas que quedan fuera del presupuesto y recorre en inorden únicamente las k propiedades que cumplen el rango O(log n + k).

**Tabla de costos $O$ en la arquitectura elegida (Hash + BST Balanceado AVL):**

| Operacion                                          | Frecuencia |    Costo $O$    |                                             Por qué se obtiene el costo                                              |
| :------------------------------------------------- | :--------: | :-------------: | :------------------------------------------------------------------------------------------------------------------: |
| **Buscar por clave (`ciudad-zona-tipo`)**          |  Muy alta  |     $O(1)$      |                La función hash calcula directamente el casillero en el `Map` sin recorrer categorías                 |
| **Buscar por rango (`precio_min` a `precio_max`)** |  Muy alta  | $O(\log n + k)$ | El árbol AVL desciende por su altura balanceada descartando mitades fuera de rango y solo visita los k nodos válidos |
| **Obtener el menor o el siguiente**                |  Muy alta  |   $O(\log n)$   |     Se baja por la rama izquierda hasta la hoja mínima o se sube/baja al sucesor inmediato en altura logarítmica     |
| **Recorrer el orden de precio**                    |   Media    |     $O(n)$      |        Un recorrido inorden (izquierda -> raíz -> derecha) entrega los precios ordenados sin volver a ordenar        |
| **Insertar/Borrar propiedad**                      |    Baja    |   $O(\log n)$   |      Ubica el casillero en $O(1)$ y actualiza el nodo en el AVL reequilibrado la altura con rotaciones locales       |

---

En resumen, la arquitectura elegida **Hash** + **BST Balanceado**

- Los ubica categoricamente (`ciudad|zona|tipo`): O(1) promedio, porque la función hash calcula directo el casillero diccionario.
- Filtra el rango de presupuesto (`precio_min` a `precio_max`): O(log n + k), porque bajamos por la altura balanceada del árbol O(log n) decartando mitades y así solo visitando los k inmuebles dentro de este rango.
- Se insertan propiedades nuevas o se borran las vendidas: O(log n), ya que ubicamos el casillero en O(1) e insertamos/eliminamos el nodo reequilibrando la altura con rotaciones locales, sin tener que desplazar miles de elementos en memoria como pasaría en un arreglo ordenado.
