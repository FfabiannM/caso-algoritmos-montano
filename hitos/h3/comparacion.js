const { performance } = require('perf_hooks');

// --- GENERADOR DETERMINISTA DEL PROBLEMA ANÁLOGO (Cartera de Inversión Inmobiliaria) ---
// Dado un presupuesto fijo C (en bloques de $10k) y n propiedades (precio, retorno anual),
// maximizar el retorno total sin pasarse del presupuesto. Cada propiedad se compra entera o no.
function generarPropiedadesInversion(n, semilla = 77) {
  const props = new Array(n);
  let estado = semilla;
  const nextRand = (min, max) => {
    estado = (estado * 1664525 + 1013904223) % 4294967296;
    return min + Math.floor((estado / 4294967296) * (max - min + 1));
  };

  for (let i = 0; i < n; i++) {
    props[i] = {
      id: `PROP-${i + 1}`,
      precio: nextRand(5, 30),   // Costo entre $50k y $300k
      retorno: nextRand(10, 95), // Retorno anual entre $10k y $95k
    };
  }
  return props;
}

// --- 1. FUERZA BRUTA: Explora los 2^n subconjuntos — O(2^n) ---
function carteraFuerzaBruta(propiedades, presupuesto) {
  const n = propiedades.length;

  function resolver(i, capRestante) {
    if (i === n || capRestante === 0) return 0;

    // Decisión 1: No comprar la propiedad i
    let mejor = resolver(i + 1, capRestante);

    // Decisión 2: Comprarla si alcanza el presupuesto
    const p = propiedades[i];
    if (p.precio <= capRestante) {
      const conPropiedad = p.retorno + resolver(i + 1, capRestante - p.precio);
      if (conPropiedad > mejor) mejor = conPropiedad;
    }
    return mejor;
  }

  return resolver(0, presupuesto);
}

// --- 2. ESTRATEGIA ADECUADA: Programación Dinámica (Tabla bottom-up) — O(n * C) ---
// Por qué no Voraz: elegir mayor retorno/precio falla con presupuesto tope (ej. cap 50 con (10,60), (20,100), (30,120)).
// Por qué Dinámica: subestructura óptima + subproblemas repetidos anotados en tabla.
function carteraDinamica(propiedades, presupuesto) {
  const n = propiedades.length;
  const tabla = Array.from({ length: n + 1 }, () => new Int32Array(presupuesto + 1));

  for (let i = 1; i <= n; i++) {
    const p = propiedades[i - 1];
    for (let cap = 0; cap <= presupuesto; cap++) {
      let mejor = tabla[i - 1][cap];
      if (p.precio <= cap) {
        const llevando = p.retorno + tabla[i - 1][cap - p.precio];
        if (llevando > mejor) mejor = llevando;
      }
      tabla[i][cap] = mejor;
    }
  }
  return tabla[n][presupuesto];
}

// --- Protocolo de medicion
function medirProtocolo(fn, corridas = 3) {
  // 1. Calentamiento 
  const resultado = fn();

  // 2. 3 corridas
  let sumaMs = 0;
  for (let c = 0; c < corridas; c++) {
    const t0 = performance.now();
    fn();
    const t1 = performance.now();
    sumaMs += t1 - t0;
  }

  return { resultado, promedioMs: sumaMs / corridas };
}

function main() {
  // Cuatro tamaños que se duplican: n = 3, 2n = 6, 4n = 12, 8n = 24
  const nBase = 3;
  const tamanios = [nBase, nBase * 2, nBase * 4, nBase * 8];
  const presupuesto = 120; // $1,200,000 en bloques de $10k

  console.log('Ejecutando comparación: Fuerza Bruta O(2^n) vs. Programación Dinámica O(n * C)...\n');

  let prevBruta = 0;
  let prevDinamica = 0;
  const filas = [];

  for (const n of tamanios) {
    const props = generarPropiedadesInversion(n, 50 + n);

    const mBruta = medirProtocolo(() => carteraFuerzaBruta(props, presupuesto), 3);
    const mDinamica = medirProtocolo(() => carteraDinamica(props, presupuesto), 3);

    // Verificación obligatoria: ambas deben dar exactamente el mismo óptimo
    const iguales = mBruta.resultado === mDinamica.resultado;
    if (!iguales) {
      throw new Error(`Error en n=${n}: Bruta=${mBruta.resultado} != Dinamica=${mDinamica.resultado}`);
    }

    const multBruta = prevBruta === 0 ? '-' : `x${(mBruta.promedioMs / prevBruta).toFixed(2)}`;
    const multDin = prevDinamica === 0 ? '-' : `x${(mDinamica.promedioMs / prevDinamica).toFixed(2)}`;

    filas.push({
      n,
      'Óptimo ($k)': mDinamica.resultado,
      '¿Mismo resultado?': iguales ? 'Sí (verificado)' : 'NO',
      'Fuerza Bruta (ms)': mBruta.promedioMs.toFixed(4),
      'x (Bruta)': multBruta,
      'Dinámica (ms)': mDinamica.promedioMs.toFixed(4),
      'x (Dinámica)': multDin,
    });

    prevBruta = mBruta.promedioMs;
    prevDinamica = mDinamica.promedioMs;
  }

  console.table(filas);
}

main();