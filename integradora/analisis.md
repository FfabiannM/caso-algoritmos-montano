**Fabian Montaño Mina** - costos, recurrencia, contraejemplo, estrategia y estructura

# Análisis del caso Compras de una escuela

- a. Costo O de CompradorIngenuo y por qué:
  Su costo es $O(n * 2^n)$. El ciclo externo con la máscara de bits, este recorre los $2^n$ conjuntos posibles de útiles, y además por cada conjunto, un ciclo interno que recorre los n útiles para sumar su costo y utilidad. Como no depende de la potencia 2, cada útil extra duplica con el trabajo.
- b. Recurrencia `T(n) = 2 T(n-1) + 1`: por qué no aplica el Teorema Maestro y cuanto cuesta:
  El teorema maestro se aplica cuando el tamaño del problema se divide por un factor constante. El tamaño se reduce restando 1 (n-1) en lugar de dividirse, por lo que no encaja en el teorema. Como en cada nivel se abren 2 llamadas a lo largo de n niveles, el árbol genera $2^n$ hojas y su costo es $O(2^n)$
- c. Voraz, contraejemplo y estrategia que se elige:
  Un algoritmo voraz por mejor utilidad por Bs no sirviría. Contraejemplo con el primer caso de prueba (presupuesto de 100bs):
  - U1: costo de 20bs, utilidad de 120
  - U2: costo de 40bs, utilidad de 200
  - U3: costo de 60bs, utilidad de 240
  - El voraz elegirá primero el U1, gastaría 20 y sumarian 120 puntos, luego viene U2, se gastan 40 y se acumula a 60bs, la suma de utilidad será de 320. Sobrarían 40bs y U3 son 60bs lo cual ya no cabe. Quedaría como 320 puntos de utilidad. Para una solución óptima, se descartaría U1 y se compra U2 + U3 $(40 + 60 = 100 bs)$ lo cual logramos 440 puntos de utilidad.

- Para la estrategia elegida se tomaría **Programación dinámica**. Este funciona porque el problema tiene subproblemas que son repetidos, como el subproblema de Elegir, EstaEnLaCompra, etc. Por ello la elección, se divide y se conquista.
