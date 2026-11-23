# Estrategia

## ¿Voraz, Dinámica o Ninguna?

Tanto los algoritmos como la programación dinámica están diseñados para problemas de optimización secuencial (maximizar o minimizar un resultado tomando una cadena de decisiones). El motor de match entre propiedades no cumple con los requisitos de ambos.

- No hay decisión que optimizar: En el emparejaiento no elegimos "el mejor subconjunto" que sacrifique otras opciones. Si una propiedad cumple con `ciudad|zona|tipo` y no cae dentro de `precio_min <= precio_usd <= precio_max`, simplemente se reporta. Incluir la propiedad A no consume presupuesto ni cambia el resultado para la propiedad B.
- No existen subproblemas que se repiten: Una señal para programación dinámica es que el algoritmo recalcule los mismos subproblemas una y otra vez (como se mencionó de Fibonacci sin memoria), de modo que anotarlos en una tabla ahorre trabajo.
