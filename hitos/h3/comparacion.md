# Comparación de Estrategias: Voraz, Programación Dinámica y Fuerza Bruta

## 1. Análisis sobre el Caso Principal y Problema Análogo

En el motor principal de emparejamiento inmobiliario (filtrar propiedades por `ciudad|zona|tipo` y rangos de `precio_usd`) **no aplica ni estrategia voraz ni programación dinámica**, porque es un problema de consulta e indexación sin restricciones de capacidad compartida ni subproblemas que se repitan (resuelto óptimamente con Tabla Hash + Árbol AVL).

Para evaluar estrategias de optimización dentro del mismo dominio, se modela el problema análogo de Selección de Cartera de Inversión Inmobiliaria **(Mochila 0/1)**: dado un presupuesto tope $C = 120$ ($\$1\,200\,000$ en bloques de $\$10\,000$) y $n$ propiedades candidatas (cada una con un `precio` y un `retorno` anual), elegir qué propiedades comprar enteras para maximizar el retorno total sin exceder $C$.

- **Por qué falla el Voraz:** Elegir siempre la propiedad con mayor retorno por dólar invertido no garantiza el óptimo; por ejemplo, con presupuesto $50$ y propiedades $(10, 60), (20, 100), (30, 120)$, el voraz elige las dos primeras sumando $160$ y deja presupuesto muerto, mientras que el óptimo toma la segunda y tercera sumando $220$.
- **Por qué aplica Programación Dinámica:** Cumple **subestructura óptima** y **subproblemas repetidos** (distintas combinaciones de compra dejan el mismo presupuesto restante $c$), resolviéndose mediante una tabla _bottom-up_ de $n \times C$ celdas en $O(n \cdot C)$.

---

### Tabla de comparación

| Tamaño ($n$) | Óptimo ($k) | ¿Mismo resultado? | Fuerza Bruta $O(2^n)$ (ms) | Veces vs anterior | Dinámica $O(n \cdot C)$ (ms) | Veces vs anterior |
| :----------: | :---------: | :---------------: | :------------------------: | :---------------: | :--------------------------: | :---------------: |
|    **3**     |     112     |  Sí (verificado)  |           0.0079           |         -         |          **0.0865**          |         -         |
|    **6**     |     351     |  Sí (verificado)  |           0.0068           |       x0.86       |          **0.0708**          |       x0.82       |
|    **12**    |     590     |  Sí (verificado)  |           0.1658           |      x24.26       |          **0.0206**          |       x0.29       |
|    **24**    |     663     |  Sí (verificado)  |          12.1691           |      x73.41       |          **0.0443**          |       x2.16       |

### Conclusión

Ambas estrategias producen el mismo retorno óptimo en todas las escalas, pero su comportamiento se separa drásticamente: al duplicar $n$ de $12$ a $24$, Fuerza Bruta explota exponencialmente ($O(2^n)$, multiplicando su tiempo por cientos de veces al pasar de $2^{12}$ a $2^{24}$ llamadas), mientras que Programación Dinámica apenas duplica su tiempo ($\approx \text{x}2$, acorde con su costo lineal respecto a $n$ cuando la capacidad $C$ es fija: $O(n \cdot C)$).
