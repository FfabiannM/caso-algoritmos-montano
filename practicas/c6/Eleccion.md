# Elección del Algoritmo de Ordenamiento: Emparejamiento de Inmobiliaria

## Contexto del Proceso y Volumen de Datos

El cuello de botella se encuentra en el motor de alertas automáticas de la plataforma inmobiliaria, encargado de cruzar nuevas propiedades publicadas en Cochabamba contra las búsquedas guardadas de los clientes. En un mes de operación normal, el sistema gestiona alrededor de **12,000 propiedades activas** frente a **35,000 criterios de búsqueda**, mientras que en el peor mes del año (temporadas altas y campañas comerciales) la carga escala a **48,000 propiedades** y **140,000 búsquedas**.

Los registros llegan desde la base de datos ordenados cronológicamente por fecha de publicación, pero carecen de orden garantizado respecto al atributo **`precio_usd`**, que es el filtro numérico continuo que define cada alerta.

## La Operación Dominante

Dentro del ciclo completo de emparejamiento, la operación que realmente pesa es **buscar y filtrar rangos de precio** (`precio_min <= precio_usd <= precio_max`). Mientras que ordenar el catálogo por precio se ejecuta **una sola vez** al cargar el lote, la búsqueda de coincidencias se repite decenas de miles de veces por cada alerta activa. Por este motivo, pagar el costo de un buen ordenamiento inicial se amortiza rápidamente al transformar barridos repetitivos en búsquedas logarítmicas.

## Candidatos Evaluados

Para ordenar los subgrupos de propiedades por `precio_usd` previo a la búsqueda binaria, se evaluaron tres algoritmos con distinto comportamiento en su peor caso:

- **Inserción (Insertion Sort) — Peor caso $O(n^2)$:** Resulta eficiente únicamente en lotes diminutos ($n < 50$) que ya vienen casi ordenados. Sobre decenas de miles de inmuebles desordenados por precio, su costo cuadrático de desplazamientos en memoria bloquea el hilo de ejecución.
- **QuickSort (pivote clásico) — Peor caso $O(n^2)$:** Aunque en datos puramente aleatorios promedia $O(n \log n)$, presenta dos riesgos críticos para este negocio. Primero, los listados exportados desde SQL suelen traer secuencias parcialmente ordenadas o agrupadas, escenario en el que QuickSort sin pivote aleatorio se degrada hacia $O(n^2)$. Segundo, es un algoritmo **inestable**: al reordenar empates de precio, destruye el orden previo por fecha de publicación, haciendo que propiedades antiguas aparezcan antes que las recién publicadas.
- **MergeSort (Divide y Vencerás) — Peor caso $O(n \log n)$:** Garantiza un techo asintótico estricto de $O(n \log n)$ sin importar cómo vengan distribuidos los precios desde la base de datos, y es **estable** por naturaleza, conservando intacta la prioridad cronológica cuando dos inmuebles comparten el mismo valor.

## Elección y Análisis de Costos

Se elige **MergeSort** como algoritmo de ordenamiento por precio dentro de cada grupo (`ciudad|zona|tipo`), acoplado a una **Búsqueda Binaria (`lower_bound`)** para resolver los rangos de presupuesto.

Al incorporar el **análisis de costos** (operaciones, memoria y amortización) se confirma por qué esta elección supera a las alternativas:

1. **Costo de amortización:** Con $48,000$ propiedades y $35,000$ consultas, dejar los datos sin ordenar exige $1.68 \times 10^9$ comparaciones lineales. Ordenar una vez con MergeSort ($746,443$ operaciones) y ejecutar las $35,000$ búsquedas binarias ($16$ pasos cada una) reduce el costo operacional total a apenas $1.30 \times 10^6$ pasos, logrando una reducción superior a **1,280x** en carga de cómputo.
2. **Costo espacial controlado:** A diferencia de QuickSort, MergeSort requiere un buffer auxiliar de memoria ($O(n)$). Sin embargo, en V8 esto representa apenas $8\text{ bytes}$ por referencia: **$0.37\text{ MB}$** en el peor mes ($48,000$ registros) y **$15.26\text{ MB}$** en una prueba extrema de $2,000,000$ de registros, un costo de RAM despreciable frente a la estabilidad y previsibilidad que aporta al servidor.

## Protocolo de Medición y Evidencia Empírica

Para evitar mediciones engañosas (como tomar una sola corrida fría, ejecutar con el depurador activo o probar con arreglos triviales de pocos elementos), se aplicó un protocolo estricto en Node.js sobre objetos con el esquema real del catálogo (`id_propiedad`, `tipo`, `zona`, `ciudad`, `precio_usd`, `habitaciones`):

- **Escalado:** Pruebas desde $3,000$ hasta $2,000,000$ de registros para observar la curva asintótica.
- **Ejecución:** 1 corrida de calentamiento (_warm-up_) descartada para estabilizar el compilador JIT de V8, seguida de **3 corridas cronometradas** con `performance.now()` (clonando los arreglos fuera del cronómetro) para obtener el tiempo promedio.

| Escala ($N$)          |  Inserción (Real)  | QuickSort BD (Real) | MergeSort (Real) | Peor Caso ($N^2$) | Pasos MergeSort ($N \log_2 N$) | Consulta Binaria ($\lfloor \log_2 N \rfloor + 1$) | Costo RAM Auxiliar | Reducción Costo Amortizado |
| :-------------------- | :----------------: | :-----------------: | :--------------: | :---------------: | :----------------------------: | :-----------------------------------------------: | :----------------: | :------------------------: |
| **3.000 (base)**      |      0.06 ms       |      19.18 ms       |   **1.87 ms**    |     $9.00e+6$     |             34.652             |                     12 pasos                      |      0.02 MB       |    **230.9x menos ops**    |
| **12.000 (hoy)**      |      0.08 ms       |      283.12 ms      |   **1.29 ms**    |     $1.44e+8$     |            162.609             |                     14 pasos                      |      0.09 MB       |    **643.6x menos ops**    |
| **48.000 (peor mes)** |      64.33 ms      |     2417.68 ms      |   **4.24 ms**    |     $2.30e+9$     |            746.436             |                     16 pasos                      |      0.37 MB       |   **1285.9x menos ops**    |
| **1.000.000 (1M)**    | Inviable (>10 min) |   Degradado O(n²)   |  **112.80 ms**   |    $1.00e+12$     |           19.931.569           |                     20 pasos                      |      7.63 MB       |   **1696.4x menos ops**    |
| **2.000.000 (2M)**    | Inviable (>10 min) |   Degradado O(n²)   |  **291.68 ms**   |    $4.00e+12$     |           41.863.137           |                     21 pasos                      |      15.26 MB      |   **1643.3x menos ops**    |
