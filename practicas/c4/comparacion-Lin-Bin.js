const { performance } = require("perf_hooks");

const TAMANO_ARREGLO = 1_000_000;
const arregloOrdenado = new Int32Array(TAMANO_ARREGLO);
for (let i = 0; i < TAMANO_ARREGLO; i ++) {
    arregloOrdenado[i] = i * 2;
}

const CANTIDAD_CLAVES = 1_000;
const clavesExistentes = new Int32Array(CANTIDAD_CLAVES);
for(let i = 0; i < CANTIDAD_CLAVES; i++) {
    const indiceReal = Math.floor((i / CANTIDAD_CLAVES) * TAMANO_ARREGLO);
    clavesExistentes[i] = arregloOrdenado[indiceReal];
}

function busquedaLineal(arr, objetivo) {
    for (let i = 0; i < arr.length; i++) {
        if(arr[i] === objetivo) return i;
    }
    return -1;
}

function busquedaBinaria (arr, objetivo) {
    let inicio = 0;
    let fin = arr.length -1;

    while(inicio <= fin) {
        const medio = (inicio + fin) >> 1;

        if(arr[medio] === objetivo) return medio;
        if(arr[medio] < objetivo) inicio = medio + 1;
        else fin = medio - 1;
    }
    return -1;
}

function medirAlgoritmo(fnBusqueda, corridas = 3) {
    const resultadoAlgoritmo = [];
    // Calentamiento (evita penalizaciones JIT)
    for (let i = 0; i < clavesExistentes.length; i++) {
        fnBusqueda(arregloOrdenado, clavesExistentes[i])
    }

    // 3 Corridas cronometradas
    let tiempoTotalMs = 0;
    let tiempos = [];
    let cociente = 0;   
    for (let c = 0; c < corridas; c++) {
        const t0 = performance.now();
        for (let i = 0; i < clavesExistentes.length; i++) {
            fnBusqueda(arregloOrdenado, clavesExistentes[i]);
        }
        const t1 = performance.now();

        const tiempoCorrida = t1 - t0;
        tiempoTotalMs += tiempoCorrida;
        tiempos.push(tiempoCorrida);

        if(c === 0) {
            cociente = tiempoCorrida;
        } else {
            cociente /= tiempoCorrida
        }
    }   
    resultadoAlgoritmo.push(tiempoTotalMs / corridas)     
    resultadoAlgoritmo.push(cociente)     
    //console.log("Res", resultadoAlgoritmo, " en ", fnBusqueda)
    return resultadoAlgoritmo;
}

const promedioLinealMs = medirAlgoritmo(busquedaLineal, 3);
const promedioBinariaMs = medirAlgoritmo(busquedaBinaria, 3);
const aceleracion = promedioLinealMs[0] / promedioBinariaMs[0];

console.log('\n===========================================================================');
console.log('Comparativa: 1.000 búsquedas en arreglo ordenado de 1.000.000 enteros');
console.log('===========================================================================');
console.table([
  {
    Algoritmo: 'Búsqueda Lineal',
    'Tiempo Promedio (ms)': promedioLinealMs[0].toFixed(4),
    'Cociente': promedioLinealMs[1].toFixed(4),
    'Factor de Mejora': '1.00x (base)',

  },
  {
    Algoritmo: 'Búsqueda Binaria',
    'Tiempo Promedio (ms)': promedioBinariaMs[0].toFixed(4),
    'Cociente': promedioBinariaMs[1].toFixed(4),
    'Factor de Mejora': `${aceleracion.toFixed(2)}x más rápida`,
  },
]);
