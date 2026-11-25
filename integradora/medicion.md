**Fabian Montaño Mina** - tabla de tiempos, conclusión, escala grande

# Medición

En ambas implementaciones se obtuvo la misma utilidad óptima en todos los tamaños.
La solución **ingenua** confirmo su crecimiento y su costo de $O(n * 2^n)$ ya que cada vez que se suma 2 útiles su tiempo se multiplica por al menos 4 y crece demasiado rápido, siendo como tal que $O(2^n)$ es de las peores. Por otro lado, usar **Programación Dinámica** con tabla $O(n * P)$ evita repetir calculos y todos los datos se resuelven en fracciones de milisegundos como se muestra en la tabla. Aunque se nota un poco de ruido en el caché y el recolector de basura muy probablemente proveniente de Node.js, pero mediante su tendencia aclara que tiene bastante ventaja la tabla dinámica.

### Tabla:

| (index) | n   | Utilidad (verificada) | Ingenuo (ms) | x Ingenuo | Mejorado (ms) | x Mejorado |
| ------- | --- | --------------------- | ------------ | --------- | ------------- | ---------- |
| 0       | 18  | '616 (OK)'            | '25.221'     | '-'       | '0.3780'      | '-'        |
| 1       | 20  | '564 (OK)'            | '95.108'     | 'x3.77'   | '0.0931'      | 'x0.25'    |
| 2       | 22  | '882 (OK)'            | '302.460'    | 'x3.18'   | '0.0390'      | 'x0.42'    |
| 3       | 24  | '940 (OK)'            | '1241.826'   | 'x4.11'   | '0.0458'      | 'x1.17'    |
