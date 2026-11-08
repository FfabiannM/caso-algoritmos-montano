"use strict";
// --- GENERADOR DE MUESTRAS ---
const ZONAS = ['Norte', 'Cala Cala', 'Tiquipaya', 'Sud', 'Centro', 'Sarco', 'Queru Queru', 'Sacaba'];
const TIPOS = ['Departamento', 'Casa', 'Oficina', 'Terreno'];
function generarDatos(n) {
    const propiedades = [];
    const busquedas = [];

    for (let i = 0; i < n; i++) {
        const zona = ZONAS[i % ZONAS.length];
        const tipo = TIPOS[i % TIPOS.length];

        propiedades.push({
            id_propiedad: `PROP-${i + 1}`,
            tipo,
            zona,
            ciudad: 'Cochabamba',
            precio_usd: 30000 + ((i * 137) % 170000),
            superficie_m2: 50 + ((i * 31) % 250),
            habitaciones: (i % 5) + 1,
        });

        busquedas.push({
            id_busqueda: `BUSQ-${i + 1}`,
            tipo,
            zona,
            ciudad: 'Cochabamba',
            precio_min: 40000,
            precio_max: 120000,
            habitaciones_min: 2,
        });
    }
    return { propiedades, busquedas };
}
// --- 1. Proceso Actual: Doble Bucle (Fuerza Bruta) anidado O(N^2) ---
function matchingFuerzaBruta(propiedades, busquedas) {
    let coincidencias = 0;
    const nProp = propiedades.length;
    const nBusq = busquedas.length;

    for (let i = 0; i < nProp; i++) {
        const p = propiedades[i];
        for (let j = 0; j < nBusq; j++) {
            const b = busquedas[j];
            if (
                p.ciudad === b.ciudad &&
                p.zona === b.zona &&
                p.tipo === b.tipo &&
                p.precio_usd >= b.precio_min &&
                p.precio_usd <= b.precio_max &&
                p.habitaciones >= b.habitaciones_min) {
                coincidencias++;
            }
        }
    }
    return coincidencias;
}
// --- 2. Proceso Optimizado: Pre-indexación en Map O(N) ---
function matchingOptimizado(propiedades, busquedas) {
    let coincidencias = 0;
    // Paso 1: Indexar criterios en una tabla hash agrupada
    const mapaBusquedas = new Map();
    const nBusq = busquedas.length;
    for (let i = 0; i < nBusq; i++) {
        const b = busquedas[i];
        const key = `${b.ciudad}|${b.zona}|${b.tipo}`;
        const grupo = mapaBusquedas.get(key);
        if (!grupo) {
            mapaBusquedas.set(key, [b]);
        }
        else {
            grupo.push(b);
        }
    }
    // Paso 2: Evaluación directa por coincidencia de hash
    const nProp = propiedades.length;
    for (let i = 0; i < nProp; i++) {
        const p = propiedades[i];
        const key = `${p.ciudad}|${p.zona}|${p.tipo}`;
        const candidatos = mapaBusquedas.get(key);

        if (candidatos) {
            const cantCantidatos = candidatos.length;
            for (let j = 0; j < cantCantidatos; j++) {
                const b = candidatos[j];
                if (
                    p.precio_usd >= b.precio_min &&
                    p.precio_usd <= b.precio_max &&
                    p.habitaciones >= b.habitaciones_min
                ) {
                    coincidencias++;
                }
            }
        }
    }
    return coincidencias;
}
// --- Protocolo de medición: Desccartar calentamiento, 5 corridas y promedio
function medirTiempo(fn, corridas = 5) {
    // Calentamiento (evita penalizaciones JIT)
    for (let i = 0; i < 2; i++) {
        fn();
    }

    // 5 Corridas cronometradas
    let acumuladoMs = 0;
    for (let i = 0; i < corridas; i++) {
        const t0 = performance.now();
        fn();
        const t1 = performance.now();
        acumuladoMs += t1 - t0;
    }
    return acumuladoMs / corridas;
}
// --- Ejecutor con escalado n, 4n, 16n
function ejecutarProtocolo() {
    const nBase = 3000;
    const factores = [1, 4, 16];

    console.log('Iniciando benchmark...');

    const resultadosLento = [];
    const resultadosOpt = [];

    for (const factor of factores) {
        const n = nBase * factor;
        const etiqueta = factor === 1 ? 'n' : `${factor}n`;
        const { propiedades, busquedas } = generarDatos(n);

        // Medición proceso cuadrático
        const tLento = medirTiempo(() => matchingFuerzaBruta(propiedades, busquedas));
        resultadosLento.push({ escala: etiqueta, n, tMs: tLento });

        // Medición proceso optimizado
        const tOpt = medirTiempo(() => matchingOptimizado(propiedades, busquedas));
        resultadosOpt.push({ escala: etiqueta, n, tMs: tOpt });
    }
    // --- Generado de tablas
    console.log('\n======================================================');
    console.log('TABLA 1: PROCESO ACTUAL LENTO (Fuerza Bruta Anidada O(N^2))');
    console.log('======================================================');
    console.table(
        resultadosLento.map((item, idx, arr) => ({
            Escala: item.escala,
            'Registros (N)': item.n.toLocaleString(),
            'Operaciones Teóricas (N^2)': (item.n * item.n).toLocaleString(),
            'Tiempo Promeio (ms)': item.tMs.toFixed(3),
            'Radio t(k) / T(prev)':
                idx === 0
                    ? '1.00x (base)'
                    : `${(item.tMs / arr[idx - 1].tMs).toFixed(2)}x (esperado ~16x)`,
        }))
    );

    console.log('\n======================================================');
    console.log('TABLA 2: PROCESO OPTIMIZADO (Hash Indexing O(N))');
    console.log('======================================================');
    console.table(
        resultadosOpt.map((item, idx, arr) => ({
            Escala: item.escala,
            'Registros (N)': item.n.toLocaleString(),
            'Tiempo Promedio (ms)': item.tMs.toFixed(3),
            'Radio T(k) / T(prev)': 
                idx === 0 
                ? '1.00x (base)'
                : `${(item.tMs / arr[idx -1].tMs).toFixed(2)}x (esperado ~4x)`,
        }))
    )
}
ejecutarProtocolo();
