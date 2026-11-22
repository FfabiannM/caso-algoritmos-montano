**Fabian Montaño Mina** // tabla de tiempos y conclusión

# Estructuras elegidas

- Cola de propidad (`Heap Minimo`) + Hash Set

- `Registrar(nombre, urgencia)`: **$O(log n)$** (inserción en el Heap + registro en el `Set` en $O(1)$).
- `AtenderSiguiente()`: **$O(log n)$** (extracción de la raíz del Heap y eliminación del `Set` en $O(1)$), respetando el desempate mediante la clave compuesta `(urgencia, ordenLlegada)`.
- `EstaEsperando(nombre)`: **$O(1)$ promedio** (consulta directa en el `Set`).
- `Esperando`: **$O(1)$** (propiedad `.size` del `Set`).

## Tabla de mediciones

| (index) | n        | GestorIngenuo (ms) | x (Ingenuo) | GestorMejorado (ms) | x (Mejorado) |
| ------- | -------- | ------------------ | ----------- | ------------------- | ------------ |
| 0       | '20.000' | '951.03'           | '-'         | '20.47'             | '-'          |
| 1       | '40.000' | '5125.78'          | 'x5.39'     | '49.10'             | 'x2.40'      |
| 2       | '80.000' | '25991.54'         | 'x5.07'     | '87.82'             | 'x1.79'      |

#### Conclusiones

Los resultados de la tabla muestra el orden declarado: al duplicar $n$ en cada escalón, `GestorIngenuo` casi cuadriplica su tiempo de ejecución, confirmando el comportamiento cuadrático $O(n^2)$ de buscar y desplazar elementos en la lista, mientras que `GestorMejorado` apenas duplica ligeramente su tiempo, acorde con el costo $O(n log n)$ de realizar $n$ inserciones y extracciones en el Heap. En `GestorMejorado`.
