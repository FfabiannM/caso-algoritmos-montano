## Torneo de Algoritmos

### ¿Cual se adapta a la problemática h1?

La función nativa de JS .sort() es más estable por especificación, pero este no permitiría mantener la estrategia
Divide y Vencerás, por lo cual se mantendría con _MergeSort_. Siguiendo la problemática, al querer realizar una
exportación o comparación, estos datos están semi-ordenados, por lo cual QuickSort sin pivote aleatorio cae en su
mismo problema de lentitud, esto volvería a MergeSort una garantía y mejor opción a O (n log n).

### Tabla diferencia de tiempos:

| (index) | Cantidad (N) | Insertion [Promedio] | MergeSort [Promedio] | .sort() Nativo [Promedio] | QuickSort [Promedio] |
| ------- | ------------ | -------------------- | -------------------- | ------------------------- | -------------------- |
| 0       | '10.000'     | '39.70 ms'           | '2.44 ms'            | '1.91 ms'                 | '4.08 ms'            |
| 1       | '20.000'     | '129.07 ms'          | '5.73 ms'            | '4.11 ms'                 | '5.67 ms'            |
| 2       | '40.000'     | '510.70 ms'          | '9.94 ms'            | '8.71 ms'                 | '16.02 ms'           |
| 3       | '80.000'     | '2045.79 ms'         | '21.66 ms'           | '20.04 ms'                | '35.07 ms'           |
| 4       | '150.000'    | '7188.69 ms'         | '41.74 ms'           | '38.01 ms'                | '52.29 ms'           |
