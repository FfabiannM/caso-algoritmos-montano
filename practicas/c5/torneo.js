"use strict";

function insertionSort(arr) {
    const a = arr.slice();
    const n = a.length;
    for (let i = 1; i < n; i++) {
        const key = a[i];
        let j = i - 1;
        while (j >= 0 && a[j] > key) {
            a[j + 1] = a[j];
            j--;
        }
        a[j + 1] = key;
    }
    return a;
}

function mergeSort(arr) {
    if (arr.length <= 1) return arr.slice();

    const mid = Math.floor(arr.length / 2);
    const left = mergeSort(arr.slice(0, mid));
    const right = mergeSort(arr.slice(mid));

    const result = new Array(left.length + right.length);
    let i = 0, j = 0, k = 0;

    while (i < left.length && j < right.length) {
        if (left[i] <= right[j]) {
            result[k++] = left[i++];
        } else {
            result[k++] = right[j++];
        }
    }

    while (i < left.length) result[k++] = left[i++];
    while (j < right.length) result[k++] = right[j++];

    return result;
}

function quickSort(arr) {

    if(arr.length <= 1) {
        return arr;
    }

    const pivotIndex = Math.floor(arr.length / 2);
    const pivot = arr[pivotIndex];

    const left = [];
    const right = [];

    for(let i = 0; i < arr.length; i++) {
        if(i === pivotIndex) continue;

        if(arr[i] < pivot) {
            left.push(arr[i]);
        } else {
            right.push(arr[i]);
        }
    }

    return [...quickSort(left), pivot, ...quickSort(right)];
}

function nativeSort(arr) {
    const a = arr.slice();
    return a.sort((x, y) => x - y);
}

function estaOrdenado(arr) {
    for (let i = 1; i < arr.length; i++) {
        if (arr[i - 1] > arr[i]) return false;
    }
    return true;
}

function generarAleatorios(n) {
    const arr = new Array(n);
    for (let i = 0; i < n; i++) {
        arr[i] = Math.floor(Math.random() * (n * 10));
    }
    return arr;
}

function verificarAlgoritmos(algoritmos) {
    const muestraPrueba = generarAleatorios(200);
    console.log("Verificando correctitud de los algoritmos con muestra de prueba...");

    for (const algo of algoritmos) {
        const ordenado = algo.fn(muestraPrueba);
        if (!Array.isArray(ordenado) || ordenado.length !== muestraPrueba.length || !estaOrdenado(ordenado)) {
            throw new Error(`El algoritmo ${algo.nombre} no ordenó correctamente el arreglo.`);
        }
        console.log(`[OK] ${algo.nombre} ordenó correctamente.`);
    }
    console.log("");
}

function medirTiempo(fn, data, corridas = 3) {
    // Protocolo de calentamiento (warm-up) con datos reducidos
    const muestraWarmup = data.slice(0, Math.min(data.length, 1000));
    for (let w = 0; w < 2; w++) {
        fn(muestraWarmup);
    }

    // Corridas cronometradas
    const tiempos = [];
    for (let c = 0; c < corridas; c++) {
        const copia = data.slice();
        const t0 = performance.now();
        fn(copia);
        const t1 = performance.now();
        tiempos.push(t1 - t0);
    }

    const promedio = tiempos.reduce((acc, t) => acc + t, 0) / corridas;
    return { tiempos, promedio };
}


function ejecutarTorneo() {
    const cantidades = [10000, 20000, 40000, 80000, 150000];

    const competidores = [
        { nombre: "Insertion", fn: insertionSort },
        { nombre: "MergeSort", fn: mergeSort },
        { nombre: ".sort() Nativo", fn: nativeSort },
        { nombre: "QuickSort", fn: quickSort },
    ];

    verificarAlgoritmos(competidores);

    const resultados = [];

    for (const n of cantidades) {
        console.log(`Procesando N = ${n.toLocaleString()} elementos...`);
        const dataset = generarAleatorios(n);

        const fila = {
            "Cantidad (N)": n.toLocaleString(),
        };

        for (const comp of competidores) {
            const { tiempos, promedio } = medirTiempo(comp.fn, dataset, 3);
            /*const detalleTiempos = tiempos.map(t => `${t.toFixed(1)}ms`).join(" | ");
            fila[`${comp.nombre} [Corridas]`] = detalleTiempos; */
            fila[`${comp.nombre} [Promedio]`] = `${promedio.toFixed(2)} ms`;
        }

        resultados.push(fila);
    }

    console.log("\n=========================================================================================");
    console.log("                        TABLA COMPARATIVA DE TIEMPOS (TORNEO)");
    console.log("=========================================================================================");
    console.table(resultados);
}

ejecutarTorneo();

/*
¿Cual se adapta a la problemática h1?
La función nativa de JS .sort() es más estable por especificación, pero este no permitiría mantener la estrategia
Divide y Vencerás, por lo cual se mantendría con *MergeSort*. Siguiendo la problemática, al querer realizar una 
exportación o comparación, estos datos están semi-ordenados, por lo cual QuickSort sin pivote aleatorio cae en su 
mismo problema de lentitud, esto volvería a MergeSort una garantía y mejor opción a O (n log n).

Tabla diferencia de tiempos:
                                                    TORNEO
┌─────────┬──────────────┬──────────────────────┬──────────────────────┬───────────────────────────┬──────────────────────┐
│ (index) │ Cantidad (N) │ Insertion [Promedio] │ MergeSort [Promedio] │ .sort() Nativo [Promedio] │ QuickSort [Promedio] │
├─────────┼──────────────┼──────────────────────┼──────────────────────┼───────────────────────────┼──────────────────────┤
│ 0       │ '10.000'     │ '39.70 ms'           │ '2.44 ms'            │ '1.91 ms'                 │ '4.08 ms'            │
│ 1       │ '20.000'     │ '129.07 ms'          │ '5.73 ms'            │ '4.11 ms'                 │ '5.67 ms'            │
│ 2       │ '40.000'     │ '510.70 ms'          │ '9.94 ms'            │ '8.71 ms'                 │ '16.02 ms'           │
│ 3       │ '80.000'     │ '2045.79 ms'         │ '21.66 ms'           │ '20.04 ms'                │ '35.07 ms'           │
│ 4       │ '150.000'    │ '7188.69 ms'         │ '41.74 ms'           │ '38.01 ms'                │ '52.29 ms'           │
└─────────┴──────────────┴──────────────────────┴──────────────────────┴───────────────────────────┴──────────────────────┘

*/