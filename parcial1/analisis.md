**Fabian Montaño Mina**

# 1.1

## A)

- F1: El conteo de pares utiliza el bucle for que recorre una sola vez de forma lineal. En cada iteración se verifica la condición **IF**. Este es **`O(n)`**

- F2: Al existir dos bucles anidados donde ambos dependen de `n` el cual ejecutaría `n x n` comparaciones, como el ejemplo donde Todos saludan a Todos. Este es **`O(n^2)`**

- F3: Este es un incremento que multiplica `k = k * 2` esto se duplica en cada iteración, lo cual encontraría una busqueda en menos pasos, como se había explicado con la metáfora de la guía telefónica, aunque no se abre a la mitad, este avanza por cada `*2`, cubriría la distancia hasta `n` lo cual reduce el número de pasos y no es `1 * 1` como la lineal. Este es: **`O(log n)`**

- F4: El mejor ordenamiento posible, este es una combinación de `O(n)` el cual recorre cada elemento, dentro del `while()` es como el anterior de la gúia telefónica `O(log n)` donde en cada paso se descarta una parte del problema donde se divide `k / 3`. Este sería **`O(n log n)`**

## B)

- **(i)** T(n) = 4 T(n/3) + n
- a = 4, b = 3, f(n) = n (d = 1)
- b^d = 3 -> O(n²)
- **(ii)** T(n) = 2 T(n/2) + n²
- a = 2, b = 2, f(n) = n² (d = 2)
- b^d = 4 -> O(n²)
