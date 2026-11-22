// PARCIAL 2 · VARIANTE A — "Turnos de una clínica"
// Caso: pacientes que llegan con una URGENCIA (1 = crítico ... 5 = leve) y se atienden de la más urgente a la
// menos urgente; si dos tienen la misma urgencia, se atiende primero el que llegó antes.
// GestorIngenuo es CORRECTO pero LENTO (usa una lista simple). Tu trabajo: elegir la estructura que conviene,
// APLICARLA en GestorMejorado, medir la diferencia y justificar tu elección.
// Puedes usar este archivo tal cual (si tienes .NET) o portar todo a TU lenguaje.

const { performance } = require("perf_hooks");

class Paciente {
  constructor(nombre, urgencia, llegada) {
    this.nombre = nombre;
    this.urgencia = urgencia;
    this.llegada = llegada;
  }
}
// ---------- SOLUCIÓN INGENUA (lista simple): correcta pero lenta ----------
class GestorIngenuo {
    constructor() {
        this._lista = [];
        this._llegadas = 0;
    }

    Registrar(nombre, urgencia) {
        this._lista.push(new Paciente(nombre, urgencia, this._llegadas++));
    }

    AtenderSiguiente() {
        if (this._lista.length === 0) return null;
        let mejor = 0;
        for (let i = 1; i < this._lista.length; i++) {
            const p = this._lista[i];
            const m = this._lista[mejor];
            if (p.urgencia < m.urgencia || (p.urgencia === m.urgencia && p.llegada < m.llegada)) {
                mejor = i;
            }
        }
        const nombre = this._lista[mejor].nombre;
        this._lista.splice(mejor, 1);
        return nombre;
    }

    EstaEsperando(nombre) {
        for (const p of this._lista) {
            if (p.nombre === nombre) return true;
        }
        return false;
    }

    get Esperando() {
        return this._lista.length;
    }
}

// ---------- TU SOLUCIÓN: elige la(s) estructura(s) y escríbela aquí ----------

class ColaPrioridadMinima {
    constructor() {
        this._heap =[];
    }

    get length() {
        return this._heap.length;
    }

    _tieneMayorPrioridad(a,b) {
        if(a.urgencia !== b.urgencia) return a.urgencia < b.urgencia;
        return a.llegada < b.llegada;
    }

    enqueue(paciente) {
        this._heap.push(paciente);
        let i = this._heap.length - 1;
        while (i > 0) {
            const padre = (i - 1) >> 1;
            if (!this._tieneMayorPrioridad(this._heap[i], this._heap[padre])) break;
            [this._heap[padre], this._heap[i]] = [this._heap[i], this._heap[padre]];
            i = padre;
        }
    }

    dequeue() {
    if (this._heap.length === 0) return null;
    const raiz = this._heap[0];
    const ultimo = this._heap.pop();
    if (this._heap.length > 0) {
      this._heap[0] = ultimo;
      let i = 0;
      const n = this._heap.length;
      while (true) {
        const izq = (i << 1) + 1;
        const der = izq + 1;
        let menor = i;

        if (izq < n && this._tieneMayorPrioridad(this._heap[izq], this._heap[menor])) {
          menor = izq;
        }
        if (der < n && this._tieneMayorPrioridad(this._heap[der], this._heap[menor])) {
          menor = der;
        }
        if (menor === i) break;

        [this._heap[i], this._heap[menor]] = [this._heap[menor], this._heap[i]];
        i = menor;
      }
    }
    return raiz;
  }
}

class GestorMejorado {
    constructor() {
        this._cola = new ColaPrioridadMinima();
        this._enEspera = new Set();
        this._llegadas = 0;
    }

    Registrar(nombre, urgencia) {
        if (!this._enEspera.has(nombre)) {
            this._enEspera.add(nombre);
            this._cola.enqueue(new Paciente(nombre, urgencia, this._llegadas++));
        }
    }

    AtenderSiguiente() {
       const siguiente = this._cola.dequeue();
        if (!siguiente) return null;
        this._enEspera.delete(siguiente.nombre);
        return siguiente.nombre;
    }

    EstaEsperando(nombre) {
       return this._enEspera.has(nombre);
    }

    get Esperando() {
       return this._enEspera.size;
    }
}

class Programa {
    // El guion de pruebas: cada paso es (operación, argumento, urgencia, resultado esperado).
    static Guion = [
        ["registrar", "Ana", 3, ""], ["registrar", "Beto", 1, ""], ["registrar", "Carla", 3, ""], ["registrar", "Diego", 2, ""],
        ["esperando", "", 0, "4"],
        ["esta", "Beto", 0, "True"], ["esta", "Zoe", 0, "False"],
        ["atender", "", 0, "Beto"], ["esta", "Beto", 0, "False"],
        ["atender", "", 0, "Diego"],
        ["registrar", "Elena", 1, ""],
        ["atender", "", 0, "Elena"], ["atender", "", 0, "Ana"], ["atender", "", 0, "Carla"],
        ["atender", "", 0, "(nadie)"], ["esperando", "", 0, "0"],
    ];

    static Ejecutar(g, op, arg, urg) {
        switch (op) {
            case "registrar":
                g.Registrar(arg, urg);
                return "";
            case "atender":
                return g.AtenderSiguiente() ?? "(nadie)";
            case "esta":
                return g.EstaEsperando(arg) ? "True" : "False";
            default:
                return g.Esperando.toString();
        }
    }

    static Probar(titulo, g) {
        let bien = 0;
        let total = 0;
        for (const [op, arg, urg, esperado] of Programa.Guion) {
        const obtenido = Programa.Ejecutar(g, op, arg, urg);
        if (op === 'registrar') continue;
        total++;
        if (obtenido === esperado) {
            bien++;
        } else {
            console.log(`   MAL en «${op} ${arg}»: esperado ${esperado}, obtuvo ${obtenido}`);
        }
        }
        console.log(`${titulo}: ${bien} de ${total} pasos correctos`);
    }

    // Protocolo
        static medirConProtocolo(crearGestor, n, corridas = 3) {
        // 1. Calentamiento (JIT de V8 + caché)
        Programa.ejecutarCarga(crearGestor(), n);

        // 2. 3 corridas medidas
        let totalMs = 0;
        for (let c = 0; c < corridas; c++) {
        const gestor = crearGestor();
        const t0 = performance.now();
        Programa.ejecutarCarga(gestor, n);
        const t1 = performance.now();
        totalMs += t1 - t0;
        }
        return totalMs / corridas;
    }

   // La CARGA para medir: n pacientes llegan y después se atiende a los n.
  static ejecutarCarga(g, n) {
    for (let i = 0; i < n; i++) {
      g.Registrar('P' + i, ((i * 7919) % 5) + 1);
    }
    let control = 0;
    for (let i = 0; i < n; i++) {
      control += g.AtenderSiguiente().length;
    }
    return control;
  }

    static Main() {
    Programa.Probar('GestorIngenuo ', new GestorIngenuo());
    Programa.Probar('GestorMejorado', new GestorMejorado());

    console.log('\n** Medicion **');
    // n = 20.000 -> 4n = 80.000 (tarda entre ~1.5 y 4 segundos en Node.js para GestorIngenuo)
    const nBase = 20_000;
    const tamanios = [nBase, nBase * 2, nBase * 4];

    let prevIngenuo = 0;
    let prevMejorado = 0;
    const tabla = [];

    for (const n of tamanios) {
      const tIngenuo = Programa.medirConProtocolo(() => new GestorIngenuo(), n, 3);
      const tMejorado = Programa.medirConProtocolo(() => new GestorMejorado(), n, 3);

      const multIng = prevIngenuo === 0 ? '-' : `x${(tIngenuo / prevIngenuo).toFixed(2)}`;
      const multMej = prevMejorado === 0 ? '-' : `x${(tMejorado / prevMejorado).toFixed(2)}`;

      tabla.push({
        n: n.toLocaleString('es-BO'),
        'GestorIngenuo (ms)': tIngenuo.toFixed(2),
        'x (Ingenuo)': multIng,
        'GestorMejorado (ms)': tMejorado.toFixed(2),
        'x (Mejorado)': multMej,
      });

      prevIngenuo = tIngenuo;
      prevMejorado = tMejorado;
    }

    console.table(tabla);
  }
}

Programa.Main();