// EVALUACIÓN INTEGRADORA · VARIANTE B — "Compras de una escuela"
// Caso: una escuela tiene una lista de útiles (cada uno con un costo en Bs y un puntaje de utilidad) y un presupuesto en Bs.
// Hay que elegir QUÉ útiles comprar para sumar la máxima utilidad sin pasarse del presupuesto.
// Cada útil se compra entero o no se compra.
// CompradorIngenuo es CORRECTO pero LENTO (prueba todas las combinaciones). Tu trabajo: analizarlo, elegir la
// estrategia, APLICARLA en CompradorMejorado, medir la diferencia y justificar todo.
// Puedes usar este archivo tal cual (si tienes .NET) o portar todo a TU lenguaje.

const { performance } = require("perf_hooks");

class NotImplementedException extends Error {
  constructor(message = "NotImplementedException") {
    super(message);
    this.name = "NotImplementedException";
  }
}

class Util {
  constructor(codigo, costoBs, utilidad) {
    this.Codigo = codigo;
    this.CostoBs = costoBs;
    this.Utilidad = utilidad;
  }
}

class IComprador {
  // Devuelve la utilidad máxima y los códigos de los útiles elegidos (en cualquier orden).
  Elegir(utiles, presupuestoBs) {
    throw new NotImplementedException();
  }

  // Después de Elegir: ¿este útil está en la compra?
  EstaEnLaCompra(codigo) {
    throw new NotImplementedException();
  }
}

// ---------- SOLUCIÓN INGENUA: prueba todos los subconjuntos (2^n) ----------
class CompradorIngenuo extends IComprador {
  constructor() {
    super();
    this._elegidos = [];
  }

  Elegir(utiles, presupuestoBs) {
    const n = utiles.length;
    let mejor = 0;
    let mejorMascara = 0;
    for (let mascara = 0; mascara < 1 << n; mascara++) {
      let costo = 0,
        utilidad = 0;
      for (let i = 0; i < n; i++)
        if ((mascara & (1 << i)) !== 0) {
          costo += utiles[i].CostoBs;
          utilidad += utiles[i].Utilidad;
        }
      if (costo <= presupuestoBs && utilidad > mejor) {
        mejor = utilidad;
        mejorMascara = mascara;
      }
    }
    this._elegidos = [];
    for (let i = 0; i < n; i++)
      if ((mejorMascara & (1 << i)) !== 0)
        this._elegidos.push(utiles[i].Codigo);
    return [mejor, [...this._elegidos]];
  }

  EstaEnLaCompra(codigo) {
    return this._elegidos.includes(codigo);
  } // recorre la lista
}

// ---------- TU SOLUCIÓN: elige la estrategia y la(s) estructura(s) y escríbela aquí ----------
class CompradorMejorado extends IComprador {
  constructor() {
    super();
    this._elegidosSet = new Set();
  }

  Elegir(utiles, presupuestoBs) {
    this._elegidosSet = new Set();
    const n = utiles.length;
    if (n === 0 || presupuestoBs <= 0) return [0, []];

    const cols = presupuestoBs + 1;

    const dp = new Int32Array((n + 1) * cols);

    for (let i = 1; i <= n; i++) {
      const costo = utiles[i - 1].CostoBs;
      const util = utiles[i - 1].Utilidad;
      const filaAct = i * cols;
      const filaAnt = (i - 1) * cols;

      for (let p = 0; p <= presupuestoBs; p++) {
        let mejor = dp[filaAnt + p];
        if (costo <= p) {
          const conUtil = dp[filaAnt + (p - costo)] + util;
          if (conUtil > mejor) mejor = conUtil;
        }
        dp[filaAct + p] = mejor;
      }
    }

    const elegidos = [];
    let pRestante = presupuestoBs;
    for (let i = n; i >= 1; i--) {
      if (dp[i * cols + pRestante] !== dp[(i - 1) * cols + pRestante]) {
        const u = utiles[i - 1];
        elegidos.push(u.Codigo);
        this._elegidosSet.add(u.Codigo);
        pRestante -= u.CostoBs;
      }
    }
    return [dp[n * cols + presupuestoBs], elegidos];
  }
  EstaEnLaCompra(codigo) {
    return this._elegidosSet.has(codigo);
  }
}

class Programa {
  static Lote(...datos) {
    return datos.map((d) => new Util(d[0], d[1], d[2]));
  }

  // Los casos de prueba (todos con ÓPTIMO ÚNICO): (útiles, presupuesto, utilidad esperada, códigos esperados).
  static Casos = [
    [
      "el voraz se equivoca",
      Programa.Lote(["U1", 20, 120], ["U2", 40, 200], ["U3", 60, 240]),
      100,
      440,
      ["U2", "U3"],
    ],
    [
      "cuatro útiles",
      Programa.Lote(["U1", 4, 6], ["U2", 6, 8], ["U3", 8, 10], ["U4", 10, 12]),
      16,
      20,
      ["U2", "U4"],
    ],
    ["presupuesto cero", Programa.Lote(["U1", 5, 10], ["U2", 7, 12]), 0, 0, []],
    ["sin útiles", Programa.Lote(), 30, 0, []],
    ["nada cabe", Programa.Lote(["U1", 80, 90], ["U2", 100, 100]), 60, 0, []],
    [
      "entran todos",
      Programa.Lote(["U1", 10, 20], ["U2", 14, 24], ["U3", 6, 8]),
      200,
      52,
      ["U1", "U2", "U3"],
    ],
  ];

  static Probar(titulo, fabrica) {
    let bien = 0,
      total = 0;
    try {
      for (const [
        que,
        utiles,
        presupuesto,
        esperada,
        codigos,
      ] of Programa.Casos) {
        const comprador = fabrica();
        const [utilidad, elegidos] = comprador.Elegir(utiles, presupuesto);
        total++;
        const a = [...elegidos].sort();
        const b = [...codigos].sort();
        const ok =
          utilidad === esperada &&
          a.length === b.length &&
          a.every((v, i) => v === b[i]);
        if (ok) bien++;
        else
          console.log(
            `   MAL en «${que}»: esperado ${esperada} con [${codigos.join(",")}], obtuvo ${utilidad} con [${elegidos.join(",")}]`,
          );
      }
      const c = fabrica();
      c.Elegir(Programa.Casos[0][1], Programa.Casos[0][2]);
      total += 2;
      if (c.EstaEnLaCompra("U2")) bien++;
      else console.log("   MAL en «EstaEnLaCompra(U2)»: esperado True");
      if (!c.EstaEnLaCompra("U1")) bien++;
      else console.log("   MAL en «EstaEnLaCompra(U1)»: esperado False");
      console.log(`${titulo}: ${bien} de ${total} pruebas correctas`);
    } catch (e) {
      if (e instanceof NotImplementedException)
        console.log(`${titulo}: (sin escribir todavía)`);
      else throw e;
    }
  }

  static _azar(semilla) {
    let s = semilla >>> 0;
    return (min, max) => {
      s = (Math.imul(1664525, s) + 1013904223) >>> 0;
      return min + (s % (max - min));
    };
  }

  // La CARGA para medir: n útiles al azar (semilla fija) y un presupuesto de un tercio del costo total.
  static EjecutarCarga(comprador, n) {
    const next = Programa._azar(n + 1000);
    const utiles = Array.from(
      { length: n },
      (_, i) => new Util("K" + i, next(4, 50), next(10, 100)),
    );
    const presupuesto = Math.floor(
      utiles.reduce((acc, u) => acc + u.CostoBs, 0) / 3,
    );
    const [utilidad] = comprador.Elegir(utiles, presupuesto);
    return utilidad;
  }
  // Procolo 3 corridas y un calentamiento
  static MedirProtocolo(fn, corridas = 3) {
    const resultado = fn();
    let sumaMs = 0;
    for (let c = 0; c < corridas; c++) {
      const t0 = performance.now();
      fn();
      sumaMs += performance.now() - t0;
    }
    return { resultado, promedioMs: sumaMs / corridas };
  }

  static Main() {
    Programa.Probar("CompradorIngenuo ", () => new CompradorIngenuo());
    Programa.Probar("CompradorMejorado", () => new CompradorMejorado());

    console.log("\n ** Medicion de Ingenuo y el mejorado **");
    // n, n+2, n+4, n+6 (si n+6 tarda < 500 ms en tu PC, sube nBase a 20)
    const nBase = 18;
    const tamanios = [nBase, nBase + 2, nBase + 4, nBase + 6];
    let prevIng = 0,
      prevMej = 0;
    const tabla = [];

    for (const n of tamanios) {
      const mIng = Programa.MedirProtocolo(() =>
        Programa.EjecutarCarga(new CompradorIngenuo(), n),
      );
      const mMej = Programa.MedirProtocolo(() =>
        Programa.EjecutarCarga(new CompradorMejorado(), n),
      );

      const igual = mIng.resultado === mMej.resultado;
      if (!igual)
        throw new Error(
          `Discrepancia en n=${n}: ${mIng.resultado} vs ${mMej.resultado}`,
        );

      tabla.push({
        n,
        "Utilidad (verificada)": `${mMej.resultado} (${igual ? "OK" : "ERROR"})`,
        "Ingenuo (ms)": mIng.promedioMs.toFixed(3),
        "x Ingenuo":
          prevIng === 0 ? "-" : `x${(mIng.promedioMs / prevIng).toFixed(2)}`,
        "Mejorado (ms)": mMej.promedioMs.toFixed(4),
        "x Mejorado":
          prevMej === 0 ? "-" : `x${(mMej.promedioMs / prevMej).toFixed(2)}`,
      });

      prevIng = mIng.promedioMs;
      prevMej = mMej.promedioMs;
    }
    console.table(tabla);

    const next = Programa._azar(2000);
    const utilesGrandes = Array.from(
      { length: 1000 },
      (_, i) => new Util("K" + i, next(4, 50), next(10, 100)),
    );
    const mGrande = Programa.MedirProtocolo(
      () => new CompradorMejorado().Elegir(utilesGrandes, 10_000)[0],
    );
    console.log(
      `Mejorado con 1.000 útiles y presupuesto 10.000 Bs: ${mGrande.promedioMs.toFixed(2)} ms (utilidad = ${mGrande.resultado})`,
    );
  }
}

Programa.Main();
