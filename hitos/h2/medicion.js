const { performance } = require('perf_hooks');

const ZONAS = ['Norte', 'Cala Cala', 'Tiquipaya', 'Sud', 'Centro', 'Sarco', 'Queru Queru', 'Sacaba'];
const TIPOS = ['Departamento', 'Casa', 'Oficina', 'Terreno'];

// --- Generador de Datos
function generarDatos(n) {
  const propiedades = new Array(n);
  const busquedas = new Array(n);

  for (let i = 0; i < n; i++) {
    const zona = ZONAS[i % ZONAS.length];
    const tipo = TIPOS[i % TIPOS.length];
    // Precios en tendencia creciente 
    const precio_usd = 30000 + Math.floor((i / n) * 170000);

    propiedades[i] = {
      id_propiedad: `PROP-${i + 1}`,
      tipo,
      zona,
      ciudad: 'Cochabamba',
      precio_usd,
      habitaciones: (i % 5) + 1,
    };

    // Rango estrecho para evaluar poda real de rangos
    const pMin = 40000 + ((i * 97) % 130000);
    busquedas[i] = {
      id_busqueda: `BUSQ-${i + 1}`,
      tipo,
      zona,
      ciudad: 'Cochabamba',
      precio_min: pMin,
      precio_max: pMin + 2500,
      habitaciones_min: 2,
    };
  }

  return { propiedades, busquedas };
}

// ESTRUCTURA Ingenua: Diccionario (Hash) + Arreglo sin índice de precios
class IndiceIngenuo {
  constructor() {
    this.grupos = new Map();
  }

  insertar(propiedad) {
    const key = `${propiedad.ciudad}|${propiedad.zona}|${propiedad.tipo}`;
    let lista = this.grupos.get(key);
    if (!lista) {
      lista = [];
      this.grupos.set(key, lista);
    }
    lista.push(propiedad);
  }

  contarCoincidenciasRango(busqueda) {
    const key = `${busqueda.ciudad}|${busqueda.zona}|${busqueda.tipo}`;
    const lista = this.grupos.get(key);
    if (!lista) return 0;

    let total = 0;
    // Barrido lineal O(n) porque el hash no sabe de rangos ni orden
    for (let i = 0; i < lista.length; i++) {
      const p = lista[i];
      if (
        p.precio_usd >= busqueda.precio_min &&
        p.precio_usd <= busqueda.precio_max &&
        p.habitaciones >= busqueda.habitaciones_min
      ) {
        total++;
      }
    }
    return total;
  }
}

// ESTRUCTURA Adecuada: Diccionario (Hash) + Árbol BST Balanceado (AVL)
class NodoAVL {
  constructor(propiedad) {
    this.precio = propiedad.precio_usd;
    this.items = [propiedad];
    this.izq = null;
    this.der = null;
    this.altura = 1;
  }
}

class ArbolAVLPrecios {
  constructor() {
    this.raiz = null;
  }

  obtenerAltura(nodo) {
    return nodo ? nodo.altura : 0;
  }

  obtenerBalance(nodo) {
    return nodo ? this.obtenerAltura(nodo.izq) - this.obtenerAltura(nodo.der) : 0;
  }

  actualizarAltura(nodo) {
    nodo.altura = 1 + Math.max(this.obtenerAltura(nodo.izq), this.obtenerAltura(nodo.der));
  }

  rotarDerecha(y) {
    const x = y.izq;
    const t2 = x.der;
    x.der = y;
    y.izq = t2;
    this.actualizarAltura(y);
    this.actualizarAltura(x);
    return x;
  }

  rotarIzquierda(x) {
    const y = x.der;
    const t2 = y.izq;
    y.izq = x;
    x.der = t2;
    this.actualizarAltura(x);
    this.actualizarAltura(y);
    return y;
  }

  insertar(propiedad) {
    this.raiz = this._insertarRec(this.raiz, propiedad);
  }

  _insertarRec(nodo, propiedad) {
    if (!nodo) return new NodoAVL(propiedad);

    const precio = propiedad.precio_usd;
    if (precio < nodo.precio) {
      nodo.izq = this._insertarRec(nodo.izq, propiedad);
    } else if (precio > nodo.precio) {
      nodo.der = this._insertarRec(nodo.der, propiedad);
    } else {
      nodo.items.push(propiedad);
      return nodo;
    }

    this.actualizarAltura(nodo);
    const balance = this.obtenerBalance(nodo);

    // Rotaciones para evitar que el árbol degenere en una lista
    if (balance > 1 && precio < nodo.izq.precio) return this.rotarDerecha(nodo);
    if (balance < -1 && precio > nodo.der.precio) return this.rotarIzquierda(nodo);
    if (balance > 1 && precio > nodo.izq.precio) {
      nodo.izq = this.rotarIzquierda(nodo.izq);
      return this.rotarDerecha(nodo);
    }
    if (balance < -1 && precio < nodo.der.precio) {
      nodo.der = this.rotarDerecha(nodo.der);
      return this.rotarIzquierda(nodo);
    }

    return nodo;
  }

  // Búsqueda por rango O(log n + k) con poda de subárboles fuera de presupuesto
  contarEnRango(pMin, pMax, habMin) {
    return this._buscarRangoRec(this.raiz, pMin, pMax, habMin);
  }

  _buscarRangoRec(nodo, pMin, pMax, habMin) {
    if (!nodo) return 0;

    let contador = 0;
    if (nodo.precio > pMin) {
      contador += this._buscarRangoRec(nodo.izq, pMin, pMax, habMin);
    }
    if (nodo.precio >= pMin && nodo.precio <= pMax) {
      for (let i = 0; i < nodo.items.length; i++) {
        if (nodo.items[i].habitaciones >= habMin) contador++;
      }
    }
    if (nodo.precio < pMax) {
      contador += this._buscarRangoRec(nodo.der, pMin, pMax, habMin);
    }
    return contador;
  }
}

class IndiceAdecuadoHashAVL {
  constructor() {
    this.grupos = new Map();
  }

  insertar(propiedad) {
    const key = `${propiedad.ciudad}|${propiedad.zona}|${propiedad.tipo}`;
    let arbol = this.grupos.get(key);
    if (!arbol) {
      arbol = new ArbolAVLPrecios();
      this.grupos.set(key, arbol);
    }
    arbol.insertar(propiedad);
  }

  contarCoincidenciasRango(busqueda) {
    const key = `${busqueda.ciudad}|${busqueda.zona}|${busqueda.tipo}`;
    const arbol = this.grupos.get(key);
    if (!arbol) return 0;

    return arbol.contarEnRango(
      busqueda.precio_min,
      busqueda.precio_max,
      busqueda.habitaciones_min
    );
  }
}

// --- PROTOCOLO DE MEDICIÓN: 1 Warm-up + 5 Corridas + Promedio ---
function medirConsultasMs(indice, busquedas, corridas = 3) {
  const ejecutarLote = () => {
    let total = 0;
    for (let i = 0; i < busquedas.length; i++) {
      total += indice.contarCoincidenciasRango(busquedas[i]);
    }
    return total;
  };

  // Calentamiento (descartado)
  ejecutarLote();

  // 3 corridas cronometradas
  let acumuladoMs = 0;
  for (let c = 0; c < corridas; c++) {
    const t0 = performance.now();
    ejecutarLote();
    const t1 = performance.now();
    acumuladoMs += t1 - t0;
  }

  return acumuladoMs / corridas;
}

// --- Ejecución de la medición
function ejecutarMedicion() {
  const nBase = 6_000;
  const escalas = [
    { etiqueta: 'n', n: nBase },
    { etiqueta: '2n', n: nBase * 2 },
    { etiqueta: '4n', n: nBase * 4 },
    { etiqueta: '8n', n: nBase * 8 },
    { etiqueta: '10n', n: nBase * 10 },
  ];

  console.log('Ejecutando experimento Medicion\n');

  let prevIngenuo = 0;
  let prevAdecuado = 0;
  const resultados = [];

  for (const esc of escalas) {
    const { propiedades, busquedas } = generarDatos(esc.n);

    const ingenuo = new IndiceIngenuo();
    const adecuado = new IndiceAdecuadoHashAVL();

    for (let i = 0; i < propiedades.length; i++) {
      ingenuo.insertar(propiedades[i]);
      adecuado.insertar(propiedades[i]);
    }

    // Validación de exactitud antes de medir
    let checkIng = 0;
    let checkAde = 0;
    for (let i = 0; i < 100; i++) {
      checkIng += ingenuo.contarCoincidenciasRango(busquedas[i]);
      checkAde += adecuado.contarCoincidenciasRango(busquedas[i]);
    }
    if (checkIng !== checkAde) {
      throw new Error(`Discrepancia detectada: ${checkIng} vs ${checkAde}`);
    }

    const msIngenuo = medirConsultasMs(ingenuo, busquedas, 3);
    const msAdecuado = medirConsultasMs(adecuado, busquedas, 3);

    const ratioIng = prevIngenuo === 0 ? '1.00x (base)' : `${(msIngenuo / prevIngenuo).toFixed(2)}x`;
    const ratioAde = prevAdecuado === 0 ? '1.00x (base)' : `${(msAdecuado / prevAdecuado).toFixed(2)}x`;
    //const speedup = `${(msIngenuo / msAdecuado).toFixed(2)}x`;

    resultados.push({
      Escala: esc.etiqueta,
      Registros: esc.n.toLocaleString('es-BO'),
      'Ingenua (ms)': msIngenuo.toFixed(2),
      'Ratio Ingenua': ratioIng,
      'Adecuada AVL (ms)': msAdecuado.toFixed(2),
      'Ratio Adecuada': ratioAde,
    });

    prevIngenuo = msIngenuo;
    prevAdecuado = msAdecuado;
  }

  console.table(resultados);

}

ejecutarMedicion();