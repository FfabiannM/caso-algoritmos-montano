# Medición de estructuras

Para la demostración de la diferencia entre ambas decisiones de diseño sobre el mismo problema, se definieron dos implementaciones:

- Solución ingenua(`Hash + Arreglo sin ordenar`) Agrupa por `ciudad|zona|tipo`, pero guarda las propiedades en un arreglo plano sin índie de precios. Ante cada búsqueda guarda las propiedades en un arreglo sin índice de precios. Ante cada búsqueda guardada, debe recorrer de forma lineal todo el arreglo de esta zona es decir O(n), para cocmprobar `precio_min <= precio_usd <= precio_max`.
- Solución adecuada(`Hash + BST balanecado AVL`): Agrupa por `ciudad|zona|tipo` y organiza las propiedades de cada zona en un árbol AVL ordenado por `precio_usd`, aún si los datos ingresan ordenados por precio desde la DB, resolvendo cada rango mediante poda jerárquica en O(log n + k).

### Tamaños y protocolo

- Se realizó la escala de 5 tamaños que se duplican: Se evalúa n = 6.000, 2n = 12.000, 4n = 24.000, 8n = 48.000 y 10n = 60.000.
- Protocolo: Misma ejecución descartando la primera corrida de calentamiento, seguidas de las 3 corridas ya medidas.

## Tabla de medición

| index     |  Escala  | Ingenua (ms) | Ratio ingenua  | Adecuada AVL (ms) | Ratio adecuada |
| :-------- | :------: | :----------: | :------------: | :---------------: | -------------- |
| **$n$**   | $6.000 $ |  $ 10.87 $   | $1.00x (base)$ |     $ 5.16 $      | $1.00x (base)$ |
| **$2n$**  | $12.000$ |  $ 40.51 $   |   $ 3.72x $    |     $ 12.47$      | $2.42x $       |
| **$4n$**  | $24.000$ |  $ 185.99$   |   $ 4.59x $    |     $ 43.96$      | $3.52x $       |
| **$8n$**  | $48.000$ |  $2429.46$   |   $ 13.06x $   |     $149.44$      | $3.40x $       |
| **$10n$** | $60.000$ |  $5767.90$   |   $ 2.37x $    |     $238.09$      | $1.59x $       |

Teniendo los resultados, la solución ingenua casi cuadriplica su tiempo de ejecución, confirmando que el comportamiento cuadrático $O(N^2)$ derivado de recorrer linealmente cada grupo en cada consulta. Por el otro lado, la solución adecuada (Hash + BST Balanceado) apenas duplica de forma ligera su tiempo, manteniendo la altura del árbol incluso ante ingresos ordenados desde la base de datos y rediciendo drásticamente la latencia en el escenario del peor mes.
