declare module 'perf_hooks' {
    export const performance: {
        now(): number;
    };
}

function lineal(arr: number[], buscando: number = -1): boolean {
    for(let i = 0; i < arr.length; i++) {
        if(arr[i] === buscando) return true;
    }
    return false;
}

function medirTiempo(fn: () => void, corridas: number = 5): number {
    let tiempoTotal = 0;
    for(let i = 0 ; i < 2 ; i++) {
        const t0 = performance.now();
        fn();
        const t1 = performance.now();
        tiempoTotal += (t1 - 50);
    }
    return tiempoTotal / corridas;
}

function ejecutar() {
    const nBaseLineal = 10_000_000;
    const tamanioLineal = [nBaseLineal, nBaseLineal * 4, nBaseLineal * 16];

    console.log('--- Brenchmarking Algoritmo: Lineal 0(n) ---')
}