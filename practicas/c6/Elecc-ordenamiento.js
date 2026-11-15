const { performance } = require('perf_hooks');

const ZONAS = ['Norte', 'Cala Cala', 'Tiquipaya', 'Sud', 'Centro', 'Sarco', 'Queru Queru', 'Sacaba'];
const TIPOS = ['Departamento', 'Casa', 'Oficina', 'Terreno'];

const CONSULTAS_MES = 35_000;

// Generación de datos (propiedades) como una exportación de la DB
function generarCatalogo(n) {
    const datos = new Array(n);
    const esMasivo = n > 1_000_000;

    for(let i = 0; i < n; i++) {
        // Simulación de correlacion parcial
        const tendencia = Math.floor((i / n) * 140000);
        const variacion = (i + 137) % 45000;
        const precio_usd = 28000 + tendencia + variacion;

        if(esMasivo) {
            datos[i] = { id: i + 1, precio_usd};
        } else {
            datos[i] = {
                id_propiedad: `PROP-${i + 1}`,
                tipo: TIPOS[i % TIPOS.length],
                zona: ZONAS[i % ZONAS.length],
                ciudad: 'Cochabamba',
                precio_usd,
                habitaciones: (i % 5) + 1,
            }
        }
    }
    return datos;
}

// Canditado A: Inserción O(n^2)
function insertionSortPorPrecio(arr) {
    for(let i = 1; i < arr.length; i++) {
        const actual = arr[i];
        let j = i - 1;
        while(j >= 0 && arr[j].precio_usd > actual.precio_usd) {
            arr[j + 1] = arr[j];
            j--;
        }
        arr[j + 1] = actual;
    }
    return arr;
}

// Candidato B: QuickSort clásico
function quickSortPorPrecio(arr) {
    if(arr.length <= 1) return arr;
    const pila = [[0, arr.length - 1]];

    while(pila.length > 0) {
        const [inicio, fin] = pila.pop();
        if(inicio >= fin) continue;

        // Pivote al extremo derecho: se degrada con datos semi-ordenados
        const pivote = arr[fin].precio_usd;
        let i = inicio;

        for(let j = inicio; j < fin; j++) {
            if(arr[j].precio_usd <= pivote) {
                const temp = arr[i];
                arr[i] = arr[j];
                arr[j] = temp;
                i++;
            }
        }
        const temp = arr[i];
        arr[i] = arr[fin];
        arr[fin] = temp;

        pila.push([inicio, i -1]);
        pila.push([i + 1, fin]);
    }
    return arr;
}

// Candidato C (Elegido): MergeSort estable
function mergeSortPorPrecio(arr) {
    const n = arr.length;
    if(n < 1) return arr;
    const aux = new Array(n) //Costo espacial controlado

    function dividirYMezclar(izq, der) {
        if(izq >= der) return;
        const medio = (izq + der) >> 1;
        dividirYMezclar(izq, medio);
        dividirYMezclar(medio +  1, der);
        mezclar(izq, medio, der);
    }

    function mezclar(izq, medio, der) {
        for(let k = izq; k <= der; k ++) {
            aux[k] = arr[k];
        }
        let i = izq;
        let j = medio + 1;
        let k = izq;

        while(i <= medio && j <= der) {
            // '<=' garantiza ESTABILIDAD: conserva el orden de publicación en empates de precio
            if(aux[i].precio_usd <= aux[j].precio_usd) {
                arr[k++] = aux[i++];
            } else {
                arr[k++] = aux[j++];
            }
        }
        while(i <= medio) {
            arr[k++] = aux[i++]
        }
    }

    dividirYMezclar(0, n -1);
    return arr;
}

// Protocolo de medicion: 1 Calentamiento + 3 corridas + promedio
function medirAlgoritmo(sortFn, datosBase, corridas = 3) {
    // Calentamiento
    sortFn(datosBase.slice());

    //Corridas formales
    let totalMs = 0;
    for(let c = 0; c < corridas; c++) {
        const copia = datosBase.slice(); //Clonado fuera del cronometro
        const t0 = performance.now();
        sortFn(copia);
        const t1 = performance.now();
        totalMs += t1 - t0;
    }
    return totalMs / corridas;
}

// Calculo de costos
function calcularCostos(n) {
    const peorCasoCuadratico = n * n;
    const pasosMergeSort = Math.round(n * Math.log2(n));
    const pasosBinaria = Math.floor(Math.log2(n)) + 1;

    // Costo de memoria auxiliar de MergeSort
    const costoMemoriaMB = (n * 8) / (1024 * 1024);

    //Costo total amortizado
    const costoTotalSinOrdenar = n * CONSULTAS_MES;
    const costoTotalConMergeSort = pasosMergeSort + CONSULTAS_MES * pasosBinaria;
    const ahorroOperacional = costoTotalSinOrdenar / costoTotalConMergeSort;

    return {
        peorCasoCuadratico,
        pasosMergeSort,
        pasosBinaria,
        costoMemoriaMB,
        costoTotalSinOrdenar,
        costoTotalConMergeSort,
        ahorroOperacional,
    }
} 

// --- EJECUCIÓN PRINCIPAL ---
function ejecutarBenchmark() {
  const escenarios = [
    { etiqueta: '3.000 (base)', n: 3_000, medirCuadratico: true },
    { etiqueta: '12.000 (hoy)', n: 12_000, medirCuadratico: true },
    { etiqueta: '48.000 (peor mes)', n: 48_000, medirCuadratico: true },
    { etiqueta: '1.000.000 (1M)', n: 1_000_000, medirCuadratico: false },
    { etiqueta: '2.000.000 (2M)', n: 2_000_000, medirCuadratico: false },
  ];

  console.log('Ejecutando protocolo (warm-up + 3 corridas promedio) y cálculo de costos...\n');

  const filasTabla = [];

  for (const esc of escenarios) {
    const datos = generarCatalogo(esc.n);
    //console.log(datos[200])
    const costos = calcularCostos(esc.n);

    // Medir MergeSort en todas las escalas (2 corridas en 16M para agilidad)
    const corridas = esc.n >= 16_000_000 ? 2 : 3;
    const msMerge = medirAlgoritmo(mergeSortPorPrecio, datos, corridas);

    let msInsertion = 'Inviable (>10 min)';
    let msQuick = 'Degradado O(n²)';

    if (esc.medirCuadratico) {
      msInsertion = `${medirAlgoritmo(insertionSortPorPrecio, datos, 3).toFixed(2)} ms`;
      msQuick = `${medirAlgoritmo(quickSortPorPrecio, datos, 3).toFixed(2)} ms`;
    }

    filasTabla.push({
      'Escala (N)': esc.etiqueta,
      'Inserción (ms)': msInsertion,
      'QuickSort BD (ms)': msQuick,
      'MergeSort (ms)': `${msMerge.toFixed(2)} ms`,
      'Peor Caso N^2': costos.peorCasoCuadratico.toExponential(2),
      'Pasos MergeSort (N log2 N)': costos.pasosMergeSort.toLocaleString('es-BO'),
      'Binaria (log2 N + 1)': `${costos.pasosBinaria} pasos`,
      'Costo RAM Aux': `${costos.costoMemoriaMB.toFixed(2)} MB`,
      'Ahorro Amortizado': `${costos.ahorroOperacional.toFixed(1)}x menos ops`,
    });
  }

  console.log('====================================================================================================');
  console.log('TABLA DE MEDICIONES Y COSTOS: CANDIDATOS DE ORDENAMIENTO PARA EL MOTOR DE MATCHING');
  console.log('====================================================================================================');
  console.table(filasTabla);
}

ejecutarBenchmark();