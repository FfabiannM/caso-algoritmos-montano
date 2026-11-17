class Caja {
  // Solución ACTUAL (lenta): comparar cada comprobante con todos los que le siguen.
  static hayComprobantesRepetidosPorPares(comprobantes) {
    for (let a = 0; a < comprobantes.length; a++)
      for (let b = a + 1; b < comprobantes.length; b++)
        if (comprobantes[a] === comprobantes[b]) return true;
    return false;
  }

  // TU CURA: escribe aquí una versión correcta que cueste MENOS que O(n²).
  // No modifiques la lista que recibes (trabaja sobre una copia si la necesitas ordenada).
  static hayComprobantesRepetidosCurado(comprobantes) {
    const vistos = new Set();
    for (let i = 0; i < comprobantes.length; i++) {
      const actual = comprobantes[i];
      if (vistos.has(actual)) {
        return true;
      }
      vistos.add(actual);
    }
    return false;
  }

  // El PEOR CASO para las dos: una lista SIN repetidos (hay que mirarlo todo).
  static generarSinRepetidos(n, semilla = 77) {
    const datos = new Array(n);
    for (let i = 0; i < n; i++) datos[i] = 1000 + i;

    let s = semilla;
    function nextRandom(max) {
      s = (s * 1103515245 + 12345) & 0x7fffffff;
      return s % max;
    }

    for (let i = n - 1; i > 0; i--) {
      int: {
        let k = nextRandom(i + 1);
        [datos[i], datos[k]] = [datos[k], datos[i]];
      }
    }
    return datos;
  }
}

function medirProtocolo(fn, datos, corridas = 3) {
  // 1 corrida de calentamiento (no cronometrada)
  fn(datos);

  // 3 corridas cronometradas
  let suma = 0;
  for (let c = 0; c < corridas; c++) {
    const t0 = performance.now();
    fn(datos);
    const t1 = performance.now();
    suma += t1 - t0;
  }
  return suma / corridas;
}

class Programa {
  // Los cinco casos que tu cura debe pasar (la esperada va a la derecha).
  static Casos = [
    {
      datos: [1010, 1003, 1009, 1003, 1005],
      esperado: true,
      que: "repetido en el medio",
    },
    {
      datos: [1010, 1003, 1009, 1004, 1005],
      esperado: false,
      que: "sin repetidos",
    },
    { datos: [], esperado: false, que: "lista vacía" },
    { datos: [1008], esperado: false, que: "un solo elemento" },
    {
      datos: [1004, 1001, 1002, 1006, 1004],
      esperado: true,
      que: "repetido en los extremos",
    },
  ];

  static main() {
    for (const { datos, esperado, que } of Programa.Casos) {
      let lenta = Caja.hayComprobantesRepetidosPorPares(datos);
      let curada;
      try {
        curada = Caja.hayComprobantesRepetidosCurado(datos).toString();
      } catch (e) {
        curada = "(sin escribir)";
      }
      console.log(
        `${que.padEnd(26)} esperado ${String(esperado).padEnd(5)} · por pares ${String(lenta).padEnd(5)} · tu cura ${curada}`,
      );
    }

    // Medición con protocolo: 4 tamaños duplicados (n, 2n, 4n, 8n)
    const nBase = 10000;
    const factores = [1, 2, 4, 8];
    const resultados = [];

    console.log("\nMediciones");

    for (const f of factores) {
      const n = nBase * f;
      const muestra = Caja.generarSinRepetidos(n);

      const tLenta = medirProtocolo(
        Caja.hayComprobantesRepetidosPorPares,
        muestra,
        3,
      );
      const tCura = medirProtocolo(
        Caja.hayComprobantesRepetidosCurado,
        muestra,
        3,
      );

      resultados.push({ n, tLenta, tCura });
    }

    console.log("\n *** Tabla de mediciones ***");
    console.table(
      resultados.map((item, idx, arr) => ({
        n: item.n.toLocaleString(),
        "Por Pares (ms)": item.tLenta.toFixed(2),
        "Factor Lenta":
          idx === 0
            ? "1.00x"
            : `${(item.tLenta / arr[idx - 1].tLenta).toFixed(2)}`,
        "Cura Set (ms)": item.tCura.toFixed(2),
        "Factor Cura":
          idx === 0
            ? "1.00x"
            : `${(item.tCura / arr[idx - 1].tCura).toFixed(2)}`,
      })),
    );
  }
}

Programa.main();