# Estrategia

## ¿Voraz, Programación Dinámica o Ninguna?

**Ninguna**. Tanto los algoritmos como la programación dinámica están diseñados para problemas de optimización secuencial (maximizar o minimizar un resultado tomando una cadena de decisiones). El motor de match entre propiedades no cumple con los requisitos de ambos.

- No hay decisión que optimizar: En el emparejamiento no elegimos "el mejor subconjunto" que sacrifique otras opciones. Si una propiedad cumple con `ciudad|zona|tipo` y no cae dentro de `precio_min <= precio_usd <= precio_max`, simplemente se ignora o se reporta. Incluir la propiedad A no consume presupuesto ni cambia el resultado para la propiedad B.
- No existen subproblemas que se repiten: Una señal para programación dinámica es que el algoritmo recalcule los mismos subproblemas una y otra vez (como se mencionó de Fibonacci sin memoria). Al consultar un rango en el árbol AVL, cada alerta consulta un intervalo específico de forma independiente, si no hay subproblemas repartidos, memorizar no ahorra nada.

---

En sí, el sistema solo busca y filtra propiedades que cumplan criterios exactos y de rango (`Tabla Hash + Árbol AVL`). No hay como tal una forma de optimizar un recurso limitado ni existen subproblemas repetidos.

En caso de que sí se pueda aplicar Voraz o Programación Dinámica, se tendría que cambiar el enfoque de cómo funciona el mismo sistema de match de propiedades.
Por ejemplo:

- Un planificador de visitas presenciales a una propiedad en un solo día (Aplica voráz). En caso de tener 15 solicitudes con hora de inicio y final y se quiere atender la mayor cantidad sin que se solapen, bastaría con elegir siempre la cita que termina primero $(O(n\log n))$.
