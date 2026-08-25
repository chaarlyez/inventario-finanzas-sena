// Generador de códigos QR autocontenido.
//
// La aplicación funciona sin conexión, así que no puede depender de una
// librería externa ni de un servicio que devuelva la imagen. Esto codifica
// en modo byte con corrección de errores nivel M y elige la versión más
// pequeña que quepa (1 a 10, hasta 213 caracteres), suficiente de sobra
// para un SKU.
//
// Devuelve una matriz de true/false que `dibujarSvg` convierte en SVG.
(function () {
  'use strict';

  // [correctores por bloque, bloques grupo 1, datos grupo 1, bloques grupo 2, datos grupo 2]
  const BLOQUES_M = {
    1: [10, 1, 16, 0, 0],
    2: [16, 1, 28, 0, 0],
    3: [26, 1, 44, 0, 0],
    4: [18, 2, 32, 0, 0],
    5: [24, 2, 43, 0, 0],
    6: [16, 4, 27, 0, 0],
    7: [18, 4, 31, 0, 0],
    8: [22, 2, 38, 2, 39],
    9: [22, 3, 36, 2, 37],
    10: [26, 4, 43, 1, 44],
  };

  // Centros de los patrones de alineación por versión.
  const ALINEACION = {
    1: [], 2: [6, 18], 3: [6, 22], 4: [6, 26], 5: [6, 30],
    6: [6, 34], 7: [6, 22, 38], 8: [6, 24, 42], 9: [6, 26, 46], 10: [6, 28, 50],
  };

  // ---------- Aritmética en GF(256), polinomio primitivo 0x11D ----------

  const EXP = new Uint8Array(512);
  const LOG = new Uint8Array(256);
  (function tablas() {
    let x = 1;
    for (let i = 0; i < 255; i++) {
      EXP[i] = x;
      LOG[x] = i;
      x <<= 1;
      if (x & 0x100) x ^= 0x11d;
    }
    for (let i = 255; i < 512; i++) EXP[i] = EXP[i - 255];
  })();

  function multiplicar(a, b) {
    if (a === 0 || b === 0) return 0;
    return EXP[LOG[a] + LOG[b]];
  }

  // Polinomio generador de grado `grado`.
  function generador(grado) {
    let g = [1];
    for (let i = 0; i < grado; i++) {
      const siguiente = new Array(g.length + 1).fill(0);
      for (let j = 0; j < g.length; j++) {
        siguiente[j] ^= g[j];
        siguiente[j + 1] ^= multiplicar(g[j], EXP[i]);
      }
      g = siguiente;
    }
    return g;
  }

  // Correctores de un bloque de datos (división polinómica).
  function correctores(datos, cantidad) {
    const g = generador(cantidad);
    const resto = new Array(cantidad).fill(0);
    for (const byte of datos) {
      const factor = byte ^ resto[0];
      resto.shift();
      resto.push(0);
      if (factor !== 0) {
        for (let i = 0; i < cantidad; i++) resto[i] ^= multiplicar(g[i + 1], factor);
      }
    }
    return resto;
  }

  // ---------- Codificación de los datos ----------

  function aBytes(texto) {
    return Array.from(new TextEncoder().encode(texto));
  }

  function capacidadDatos(version) {
    const [, b1, d1, b2, d2] = BLOQUES_M[version];
    return b1 * d1 + b2 * d2;
  }

  function elegirVersion(numBytes) {
    for (let v = 1; v <= 10; v++) {
      const cuentaBits = v <= 9 ? 8 : 16;
      const bitsNecesarios = 4 + cuentaBits + numBytes * 8;
      if (bitsNecesarios <= capacidadDatos(v) * 8) return v;
    }
    throw new Error('El texto es demasiado largo para un QR de versión 10.');
  }

  function construirDatos(bytes, version) {
    const bits = [];
    const push = (valor, longitud) => {
      for (let i = longitud - 1; i >= 0; i--) bits.push((valor >> i) & 1);
    };

    push(0b0100, 4);                              // modo byte
    push(bytes.length, version <= 9 ? 8 : 16);    // cuenta de caracteres
    bytes.forEach((b) => push(b, 8));

    const capacidadBits = capacidadDatos(version) * 8;
    // Terminador de hasta cuatro ceros.
    for (let i = 0; i < 4 && bits.length < capacidadBits; i++) bits.push(0);
    // Completar hasta byte entero.
    while (bits.length % 8 !== 0) bits.push(0);

    const palabras = [];
    for (let i = 0; i < bits.length; i += 8) {
      palabras.push(parseInt(bits.slice(i, i + 8).join(''), 2));
    }
    // Relleno alternando 236 y 17 hasta llenar la capacidad.
    const relleno = [0xec, 0x11];
    let k = 0;
    while (palabras.length < capacidadDatos(version)) palabras.push(relleno[k++ % 2]);

    return palabras;
  }

  // Intercala bloques de datos y de corrección, como exige la norma.
  function intercalar(palabras, version) {
    const [numEc, b1, d1, b2, d2] = BLOQUES_M[version];
    const bloques = [];
    let pos = 0;
    for (let i = 0; i < b1; i++) { bloques.push(palabras.slice(pos, pos + d1)); pos += d1; }
    for (let i = 0; i < b2; i++) { bloques.push(palabras.slice(pos, pos + d2)); pos += d2; }

    const bloquesEc = bloques.map((b) => correctores(b, numEc));

    const salida = [];
    const maxDatos = Math.max(d1, d2);
    for (let i = 0; i < maxDatos; i++) {
      for (const b of bloques) if (i < b.length) salida.push(b[i]);
    }
    for (let i = 0; i < numEc; i++) {
      for (const b of bloquesEc) salida.push(b[i]);
    }
    return salida;
  }

  // ---------- Construcción de la matriz ----------

  function matrizVacia(tam) {
    return Array.from({ length: tam }, () => new Array(tam).fill(null));
  }

  function ponerBuscadores(m, tam) {
    const patron = (fila, col) => {
      for (let r = -1; r <= 7; r++) {
        for (let c = -1; c <= 7; c++) {
          const y = fila + r;
          const x = col + c;
          if (y < 0 || y >= tam || x < 0 || x >= tam) continue;
          const borde = r === -1 || r === 7 || c === -1 || c === 7;
          const anillo = (r === 0 || r === 6) && c >= 0 && c <= 6;
          const lados = (c === 0 || c === 6) && r >= 0 && r <= 6;
          const centro = r >= 2 && r <= 4 && c >= 2 && c <= 4;
          m[y][x] = !borde && (anillo || lados || centro);
        }
      }
    };
    patron(0, 0);
    patron(0, tam - 7);
    patron(tam - 7, 0);
  }

  function ponerTiempo(m, tam) {
    for (let i = 8; i < tam - 8; i++) {
      const v = i % 2 === 0;
      if (m[6][i] === null) m[6][i] = v;
      if (m[i][6] === null) m[i][6] = v;
    }
  }

  function ponerAlineacion(m, version, tam) {
    const centros = ALINEACION[version];
    for (const fila of centros) {
      for (const col of centros) {
        // No se dibuja sobre los buscadores.
        if ((fila <= 8 && col <= 8) || (fila <= 8 && col >= tam - 9) || (fila >= tam - 9 && col <= 8)) continue;
        for (let r = -2; r <= 2; r++) {
          for (let c = -2; c <= 2; c++) {
            m[fila + r][col + c] = Math.max(Math.abs(r), Math.abs(c)) !== 1;
          }
        }
      }
    }
  }

  function reservarFormato(m, tam) {
    for (let i = 0; i < 9; i++) {
      if (m[8][i] === null) m[8][i] = false;
      if (m[i][8] === null) m[i][8] = false;
    }
    for (let i = 0; i < 8; i++) {
      if (m[8][tam - 1 - i] === null) m[8][tam - 1 - i] = false;
      if (m[tam - 1 - i][8] === null) m[tam - 1 - i][8] = false;
    }
    m[tam - 8][8] = true;   // módulo oscuro, siempre presente
  }

  function reservarVersion(m, version, tam) {
    if (version < 7) return;
    for (let i = 0; i < 18; i++) {
      const fila = Math.floor(i / 3);
      const col = i % 3;
      m[fila][tam - 11 + col] = false;
      m[tam - 11 + col][fila] = false;
    }
  }

  // Casillas ocupadas por patrones: no admiten datos.
  function mapaReservado(version, tam) {
    const r = matrizVacia(tam);
    ponerBuscadores(r, tam);
    ponerTiempo(r, tam);
    ponerAlineacion(r, version, tam);
    reservarFormato(r, tam);
    reservarVersion(r, version, tam);
    return r.map((fila) => fila.map((v) => v !== null));
  }

  function colocarDatos(m, reservado, palabras, tam) {
    const bits = [];
    palabras.forEach((p) => { for (let i = 7; i >= 0; i--) bits.push((p >> i) & 1); });

    let i = 0;
    let arriba = true;
    for (let col = tam - 1; col > 0; col -= 2) {
      if (col === 6) col--;   // la columna de tiempo se salta
      for (let paso = 0; paso < tam; paso++) {
        const fila = arriba ? tam - 1 - paso : paso;
        for (const c of [col, col - 1]) {
          if (reservado[fila][c]) continue;
          m[fila][c] = i < bits.length ? bits[i] === 1 : false;
          i++;
        }
      }
      arriba = !arriba;
    }
  }

  const MASCARAS = [
    (r, c) => (r + c) % 2 === 0,
    (r) => r % 2 === 0,
    (r, c) => c % 3 === 0,
    (r, c) => (r + c) % 3 === 0,
    (r, c) => (Math.floor(r / 2) + Math.floor(c / 3)) % 2 === 0,
    (r, c) => ((r * c) % 2) + ((r * c) % 3) === 0,
    (r, c) => (((r * c) % 2) + ((r * c) % 3)) % 2 === 0,
    (r, c) => (((r + c) % 2) + ((r * c) % 3)) % 2 === 0,
  ];

  function aplicarMascara(m, reservado, indice, tam) {
    const fn = MASCARAS[indice];
    const salida = m.map((fila) => fila.slice());
    for (let r = 0; r < tam; r++) {
      for (let c = 0; c < tam; c++) {
        if (!reservado[r][c] && fn(r, c)) salida[r][c] = !salida[r][c];
      }
    }
    return salida;
  }

  // Penalización estándar: cuanto menor, mejor se lee.
  function penalizar(m, tam) {
    let total = 0;

    // Regla 1: rachas de cinco o más del mismo color.
    const racha = (obtener) => {
      for (let a = 0; a < tam; a++) {
        let cuenta = 1;
        for (let b = 1; b < tam; b++) {
          if (obtener(a, b) === obtener(a, b - 1)) {
            cuenta++;
          } else {
            if (cuenta >= 5) total += 3 + (cuenta - 5);
            cuenta = 1;
          }
        }
        if (cuenta >= 5) total += 3 + (cuenta - 5);
      }
    };
    racha((r, c) => m[r][c]);
    racha((c, r) => m[r][c]);

    // Regla 2: bloques de 2x2 del mismo color.
    for (let r = 0; r < tam - 1; r++) {
      for (let c = 0; c < tam - 1; c++) {
        const v = m[r][c];
        if (v === m[r][c + 1] && v === m[r + 1][c] && v === m[r + 1][c + 1]) total += 3;
      }
    }

    // Regla 3: patrón 1:1:3:1:1 que imita un buscador.
    const P1 = [true, false, true, true, true, false, true, false, false, false, false];
    const P2 = [false, false, false, false, true, false, true, true, true, false, true];
    const coincide = (obtener, a, b, patron) => patron.every((v, k) => obtener(a, b + k) === v);
    for (let a = 0; a < tam; a++) {
      for (let b = 0; b <= tam - 11; b++) {
        if (coincide((x, y) => m[x][y], a, b, P1) || coincide((x, y) => m[x][y], a, b, P2)) total += 40;
        if (coincide((x, y) => m[y][x], a, b, P1) || coincide((x, y) => m[y][x], a, b, P2)) total += 40;
      }
    }

    // Regla 4: desequilibrio entre módulos claros y oscuros.
    let oscuros = 0;
    for (let r = 0; r < tam; r++) for (let c = 0; c < tam; c++) if (m[r][c]) oscuros++;
    const porcentaje = (oscuros * 100) / (tam * tam);
    total += Math.floor(Math.abs(porcentaje - 50) / 5) * 10;

    return total;
  }

  // BCH(15,5) para la información de formato; nivel M = 0b00.
  function bitsFormato(mascara) {
    let datos = (0b00 << 3) | mascara;
    let resto = datos << 10;
    for (let i = 14; i >= 10; i--) {
      if ((resto >> i) & 1) resto ^= 0x537 << (i - 10);
    }
    return ((datos << 10) | resto) ^ 0x5412;
  }

  function ponerFormato(m, mascara, tam) {
    const bits = bitsFormato(mascara);
    const bit = (i) => ((bits >> i) & 1) === 1;

    // Primera copia: los bits bajos bajan por la columna 8 y los altos
    // recorren la fila 8 hacia la izquierda. El orden importa y no es
    // simétrico, así que conviene leerlo tal cual está en la norma.
    for (let i = 0; i <= 5; i++) m[i][8] = bit(i);
    m[7][8] = bit(6);
    m[8][8] = bit(7);
    m[8][7] = bit(8);
    for (let i = 9; i <= 14; i++) m[8][14 - i] = bit(i);

    // Segunda copia: bits bajos por la fila 8 desde la derecha, bits altos
    // por la columna 8 desde abajo.
    for (let i = 0; i <= 7; i++) m[8][tam - 1 - i] = bit(i);
    for (let i = 8; i <= 14; i++) m[tam - 15 + i][8] = bit(i);

    m[tam - 8][8] = true;
  }

  // BCH(18,6) para la información de versión (solo versión 7 en adelante).
  function ponerVersion(m, version, tam) {
    if (version < 7) return;
    let resto = version << 12;
    for (let i = 17; i >= 12; i--) {
      if ((resto >> i) & 1) resto ^= 0x1f25 << (i - 12);
    }
    const bits = (version << 12) | resto;
    for (let i = 0; i < 18; i++) {
      const v = ((bits >> i) & 1) === 1;
      const fila = Math.floor(i / 3);
      const col = i % 3;
      m[fila][tam - 11 + col] = v;
      m[tam - 11 + col][fila] = v;
    }
  }

  // ---------- API ----------

  function generar(texto) {
    const bytes = aBytes(texto);
    const version = elegirVersion(bytes.length);
    const tam = 17 + version * 4;

    const palabras = intercalar(construirDatos(bytes, version), version);
    const reservado = mapaReservado(version, tam);

    const base = matrizVacia(tam);
    ponerBuscadores(base, tam);
    ponerTiempo(base, tam);
    ponerAlineacion(base, version, tam);
    reservarFormato(base, tam);
    reservarVersion(base, version, tam);
    colocarDatos(base, reservado, palabras, tam);

    // Se prueban las ocho máscaras y se conserva la de menor penalización.
    let mejor = null;
    let mejorPuntaje = Infinity;
    for (let i = 0; i < 8; i++) {
      const candidata = aplicarMascara(base, reservado, i, tam);
      ponerFormato(candidata, i, tam);
      ponerVersion(candidata, version, tam);
      const puntaje = penalizar(candidata, tam);
      if (puntaje < mejorPuntaje) {
        mejorPuntaje = puntaje;
        mejor = candidata;
      }
    }

    return { matriz: mejor.map((f) => f.map(Boolean)), tam, version };
  }

  // Dibuja la matriz como SVG. El margen de 4 módulos es obligatorio: sin él
  // muchos lectores no encuentran el código.
  function dibujarSvg(texto, opciones = {}) {
    const { matriz, tam } = generar(texto);
    const margen = opciones.margen ?? 4;
    const total = tam + margen * 2;
    const lado = opciones.lado ?? 160;

    // Un solo path con todos los módulos oscuros: mucho más liviano que
    // un <rect> por módulo, y se imprime igual de nítido.
    let d = '';
    for (let r = 0; r < tam; r++) {
      for (let c = 0; c < tam; c++) {
        if (matriz[r][c]) d += `M${c + margen} ${r + margen}h1v1h-1z`;
      }
    }

    return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${total} ${total}" width="${lado}" height="${lado}" shape-rendering="crispEdges" role="img" aria-label="Código QR de ${texto}"><rect width="${total}" height="${total}" fill="#ffffff"/><path d="${d}" fill="#000000"/></svg>`;
  }

  window.QR = { generar, dibujarSvg };
})();
