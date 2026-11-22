**Fabian Montaño Mina** // tabla de operaciones, estructura, costos, contra la lista simple

# P2.1 Elegir

## Cuatro Operaciones:

- `Registrar(nombre, urgencia)`: llega un paciente (los nombres son únicos).
- `AtenderSiguiente()`: saca y devuelve al más urgente; devuelve «nadie» (null) si no hay ninguno.
- `EstaEsperando(nombre)`: ¿ese paciente sigue en espera? (atenderlo lo saca).
- `Esperando`: cuántos hay en espera.

## Elección:

| Operacion                     | Veces/dia | Estructura                                           | Costo O           |
| ----------------------------- | --------- | ---------------------------------------------------- | ----------------- |
| `Registrar(nombre, urgencia)` | 100.000   | **Heap Mínimo (prioridad menor) + HashSet(nombres)** | $O(log n) + O(1)$ |
| `AtenderSiguiente()`          | 100.000   | **Heap Mínimo**                                      | $O(log n)$        |
| `EstaEsperando(nombre)`       | 30.000    | **HashSet**                                          | $O(1)$            |
| `Esperando`                   | --        | **Contador tradicional**                             | O(1)              |

Para el registro se realiza una combinación de un `HeapMin` para mantener al más urgente delante y el uso de `HashSet` para la función `EstaEsperando` en $O(1)$ sin tener que recorrer el heap.

---

### Contra el Gestor Ingenuo

Al usar una lista simple, las operaciones son mucho más pesadas y funcionan tanto como el número de datos $n$.

- `Registrar`: Costaría O(1), es decir 100.000 x 1 = 100.000 operaciones
- `AtenderSiguiente()`: Tiene que recorrer toda la lista para encontrar al mínimo (al más urgente), un promedio de 100.000 pacientes es 50.000, generaría $100.000 x 50.000 = 5.000.000.000$ operaciones.
- `EstaEsperando(nombre)`: Su búsqueda lineal -> O(n) haría que recorra la lista buscando el nombre. Similar al anterior, millones de operaciones.
- Costo total de hasta unos 5 mil millones de operaciones al día.

#### Costo con heap + HashSet

- `Registrar`: 100.000 x (17 + 1) = 1.800.000 operaciones.
- `AtenderSiguiente()`: 100.000 x (17 + 1) = 1.800.000 operaciones.
- `EstaEsperando(nombre)`: 30.000 x 1 = 30.000 operaciones.
- `Esperando`: 1 operación.
- Costo aproximado con Heap + HashSet: 3.600.000 operaciones

---

### Condición en la que cambiaría de opinión

- Si se tratara de una posta rural muy pequeña, menos de 50 pacientes al día y casi sin consultas de EstaEsperando: usaría una lista simple, ya que con menos de 50 datos el costo O(n^2) tarda microsegundos y se ahorra la memoria extra de mantener dos estructuras sincronizadas.
