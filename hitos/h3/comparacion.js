const { performance } = require('perf_hooks');

// --- GENERADOR DETERMINISTA DE PROPIEDADES (precio en bloques de $10k, retorno en $1k) ---
function generarPropiedadesInversion(n, semilla = 42) {
  const props = [];
  let estado = semilla;
  const nextRand = (min, max) => {
    estado = (estado * 1664525 + 1013904223) % 4294967296;
    return min + Math.floor((estado / 4294967296) * (max - min + 1));
  };

  for (let i = 0; i < n; i++) {
    const precioBloques = nextRand(5, 35); // Entre $50k y $350k
    const retornoAnual = nextRand(15, 110); // Entre $15k y $110k
    props.push({
      id: `PROP-${i + 1}`,
      precio: precioBloques,
      retorno: retornoAnual,
    });
  }
  return props;
}

// --- 1. ALGORITMO VORAZ: Mayor retorno por dólar invertido — O(n log n) ---
// Rápido, pero NO garantiza el óptimo en la mochila 0/1
function carteraVoraz(propiedades, presupuesto) {
  const ordenadas = propiedades
    .slice()
    .sort((a, b) => b.retorno / b.precio - a.retorno / a.precio);

  let gastado = 0;
  let retornoTotal = 0;

  for (let i = 0; i < ordenadas.length; i++) {
    if (gastado + ordenadas[i].precio <= presupuesto) {
      gastado += ordenadas[i].precio;
      retornoTotal += ordenadas[i].retorno;
    }
  }
  return retornoTotal;
}

// --- 2. FUERZA BRUTA: Prueba los 2^n subconjuntos — O(2^n) ---
// Garantiza el óptimo, pero explota exponencialmente
function carteraFuerzaBruta(propiedades, presupuesto) {
  const n = propiedades.length;

  function explorar(idx, restante) {
    if (idx === n || restante === 0) return 0;

    // Opción 1: No comprar la propiedad actual
    let mejor = explorar(idx + 1, restante);

    // Opción 2: Comprarla si alcanza el presupuesto
    const p = propiedades[idx];
    if (p.precio <= restante) {
      const conActual = p.retorno + explorar(idx + 1, restante - p.precio);
      if (conActual > mejor) mejor = conActual;
    }
    return mejor;
  }

  return explorar(0, presupuesto);
}

// --- 3. PROGRAMACIÓN DINÁMICA: Tabla n x capacidad (bottom-up) — O(n * C) ---
// Garantiza el óptimo anotando cada subproblema una sola vez
function carteraDinamica(propiedades, presupuesto) {
  const n = propiedades.length;
  // Tabla de (n + 1) filas x (presupuesto + 1) columnas
  const tabla = Array.from({ length: n + 1 }, () => new Int32Array(presupuesto + 1));

  for (let i = 1; i <= n; i++) {
    const p = propiedades[i - 1];
    for (let cap = 0; cap <= presupuesto; cap++) {
      // Sin llevar la propiedad i
      let mejor = tabla[i - 1][cap];
      // Llevando la propiedad i (si cabe en la capacidad actual)
      if (p.precio <= cap) {
        const llevando = p.retorno + tabla[i - 1][cap - p.precio];
        if (llevando > mejor) mejor = llevando;
      }
      tabla[i][cap] = mejor;
    }
  }
  return tabla[n][presupuesto];
}

// --- PROTOCOLO: 1 corrida de calentamiento + 3 corridas medidas + promedio ---
function medirProtocolo(fn, corridas = 3) {
  // 1. Calentamiento (JIT V8 + caché)
  const resultado = fn();

  // 2. 3 corridas cronometradas
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
  console.log('=== 1. CONTRAEJEMPLO: DONDE EL VORAZ SE EQUIVOCA ===');
  const contraejemplo = [
    { id: 'PROP-A', precio: 10, retorno: 60 },
    { id: 'PROP-B', precio: 20, retorno: 100 },
    { id: 'PROP-C', precio: 30, retorno: 120 },
  ];
  const presupuestoEj = 50;
  console.log(`Presupuesto: ${presupuestoEj} ($500k)`);
  console.log(`Voraz (mayor retorno/precio): ${carteraVoraz(contraejemplo, presupuestoEj)} ($160k) -> FALLA`);
  console.log(`Programación Dinámica:        ${carteraDinamica(contraejemplo, presupuestoEj)} ($220k) -> ÓPTIMO`);
  console.log(`Fuerza Bruta (2^n):           ${carteraFuerzaBruta(contraejemplo, presupuestoEj)} ($220k) -> ÓPTIMO`);

  console.log('\n=== 2. COMPARATIVA MEDIDA (Protocolo: 1 warm-up + 3 corridas) ===');
  const tamanios = [16, 18, 20, 22];
  const presupuestoTest = 120; // $1,200,000 en bloques de $10k

  let prevBrutaMs = 0;
  const tablaResultados = [];

  for (const n of tamanios) {
    const props = generarPropiedadesInversion(n, 100 + n);

    const mVoraz = medirProtocolo(() => carteraVoraz(props, presupuestoTest), 3);
    const mDinamica = medirProtocolo(() => carteraDinamica(props, presupuestoTest), 3);
    const mBruta = medirProtocolo(() => carteraFuerzaBruta(props, presupuestoTest), 3);

    const ratioBruta = prevBrutaMs === 0 ? '-' : `x${(mBruta.promedioMs / prevBrutaMs).toFixed(2)}`;
    const aciertaVoraz = mVoraz.resultado === mDinamica.resultado ? 'Sí' : `NO (${mVoraz.resultado})`;

    tablaResultados.push({
      'Propiedades (n)': n,
      'Óptimo ($k)': mDinamica.resultado,
      'Voraz ¿acierta?': aciertaVoraz,
      'Voraz (ms)': mVoraz.promedioMs.toFixed(4),
      'Dinámica Tabla (ms)': mDinamica.promedioMs.toFixed(4),
      'Fuerza Bruta (ms)': mBruta.promedioMs.toFixed(3),
      'Ratio Bruta (+2 objs)': ratioBruta,
    });

    prevBrutaMs = mBruta.promedioMs;
  }

  console.table(tablaResultados);

  // Prueba de escala real donde Fuerza Bruta es imposible (2^500)
  const propsGrandes = generarPropiedadesInversion(500, 99);
  const mDinamicaGrande = medirProtocolo(() => carteraDinamica(propsGrandes, 500), 3);
  console.log(
    `\nPrueba de escala (500 propiedades, capacidad 500): Tabla Dinámica = ${mDinamicaGrande.promedioMs.toFixed(2)} ms | Óptimo = $${mDinamicaGrande.resultado}k (Fuerza Bruta 2^500 es inviable)`
  );
}

main();