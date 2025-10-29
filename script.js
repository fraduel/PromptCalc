const input = document.getElementById("input");
const output = document.getElementById("output");

let historial = [];
let indiceHistorial = -1;

let historialNavegable = [];
let indiceNavegable = -1;

let buffer = [];

let span = null;
let ultimoRango = null; // { a: number, b: number }


const unidadesPorFamilia = {
    temperatura: ["C", "F", "K"],
    presion: ["kg/cm²", "bar", "psi", "kPa", "mmH2O", "mmHg", "atm"],
    longitud: ["mm", "ft", "in"],
    volumen: ["L", "galUS", "galUK"]
};

const factores = {
    presion: {
        "kg/cm²": 98066.5,
        bar: 100000,
        psi: 6894.76,
        kPa: 1000,
        mmH2O: 9.80665,
        mmHg: 133.322,
        atm: 101325
    },
    longitud: {
        mm: 1,
        ft: 304.8,
        in: 25.4
    },
    volumen: {
        L: 1,
        galUS: 3.78541,
        galUK: 4.54609
    }
};


// Cargar estado desde localStorage

try {
    const posible = JSON.parse(localStorage.getItem("buffer"));
    if (Array.isArray(posible)) {
        buffer = posible;
        actualizarBufferVisual();
    }
} catch (e) {
    buffer = [];
}

const historialGuardado = localStorage.getItem("historial");
const navegableGuardado = localStorage.getItem("historialNavegable");



if (historialGuardado) {
    historial = JSON.parse(historialGuardado);
    historial.slice().reverse().forEach(item => {
        if (item.tipo === "input") {
            output.innerHTML += `<div><span class="input-label">input:</span> <span class="input-value">${item.valor}</span></div>`;
        } else if (item.tipo === "operacion") {
            let operacionTexto;
            let encabezado = `> ${item.operador}`;

            if (item.operador === "inv") {
                operacionTexto = `1 / ${item.a}`;
            } else if (item.operador === "sqrt") {
                operacionTexto = `raíz ${item.b} de ${item.a}`;
                encabezado = `> sqrt ${item.b}`;
            } else if (item.operador === "sqr") {
                operacionTexto = `${item.a} ^ ${item.b}`;
                encabezado = `> sqr ${item.b}`;
            } else if (item.operador === "log") {
                const baseTexto = item.b === Math.E ? "e" : item.b;
                operacionTexto = `log base ${baseTexto} de ${item.a}`;
                encabezado = `> log ${baseTexto}`;
            } else if (["sin", "cos", "tan"].includes(item.operador)) {
                operacionTexto = `${item.operador}(${item.a}°)`;
            } else if (["sin", "cos", "tan", "asin", "acos", "atan", "deg", "rad"].includes(item.operador)) {
                let label;
                if (["asin", "acos", "atan"].includes(item.operador)) {
                    label = `${item.operador}(${item.a}) → grados`;
                } else {
                    label = `${item.operador}(${item.a})`;
                }
                operacionTexto = label;
            }

            else if (item.operador === "rango") {
                operacionTexto = `|${item.b} - ${item.a}|`;
                encabezado = `> rango`;
            }

            else if (item.operador === "porcentual") {
                operacionTexto = `Distribución entre ${item.a} y ${item.b}`;
                const valores = item.resultado;
                const porcentajes = valores.map(v => `<span class="result-label">${v.porcentaje}%:</span> <span class="result-value">${v.valor}</span>`).join("<br>");
                output.innerHTML += `<div><span class="op-label">> porcentual ${valores.length}</span><br><span class="operation">${operacionTexto}</span><br>${porcentajes}</div>`;
                return;
            }

            else if (item.operador === "cuadratica") {
                operacionTexto = `Distribución cuadrática entre ${item.a} y ${item.b}`;
                const valores = item.resultado;
                const porcentajes = valores.map(v => `<span class="result-label">${v.porcentaje}%:</span> <span class="result-value">${v.valor}</span>`).join("<br>");
                output.innerHTML += `<div><span class="op-label">> cuadratica ${valores.length}</span><br><span class="operation">${operacionTexto}</span><br>${porcentajes}</div>`;
                return;
            }

            else if (item.operador === "to9511") {
                operacionTexto = `Conversión al formato 9511`;
                encabezado = `> to9511`;
                resultadoHTML = `<span class="result-label">Hexadecimal:</span> <span class="result-value result-hex">${item.resultado}</span>`;
            }

            else if (item.operador === "from9511") {
                operacionTexto = `Conversión desde formato 9511`;
                encabezado = `> from9511 ${item.a}`;
                resultadoHTML = `<span class="result-label">Hexadecimal:</span> <span class="result-value result-hex">${item.a}</span><br><span class="result-label">Valor:</span> <span class="result-value">${item.resultado}</span>`;
            }

            else {
                operacionTexto = `${item.a} ${item.operador} ${item.b}`;
            }
            /*output.innerHTML += `<div><span class="op-label">${encabezado}</span><br><span class="operation">${operacionTexto}</span><br>${resultadoHTML}</div>`;*/
            output.innerHTML += `<div><span class="op-label">${encabezado}</span><br><span class="operation">${operacionTexto}</span><br>${resultadoHTML || `<span class="result-label">Resultado:</span> <span class="result-value">${item.resultado}</span>`}</div>`;



            /*output.innerHTML += `<div><span class="op-label">${encabezado}</span><br><span class="operation">${operacionTexto}</span><br><span class="result-label">Resultado:</span> <span class="result-value">${item.resultado}</span></div>`;*/
        } else if (item.tipo === "nota") {
            output.innerHTML += `<div class="info">📝 <span class="info">nota:</span><br><span class="operation">${item.contenido}</span></div>`;
        }
    });
}



if (navegableGuardado) {
    historialNavegable = JSON.parse(navegableGuardado);
    indiceNavegable = -1;
}

function actualizarFechaHora() {
    const ahora = new Date();
    const opciones = {
        weekday: 'short',
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
    };
    const formato = ahora.toLocaleString('es-ES', opciones);
    document.getElementById("fecha-hora").textContent = formato;
}

setInterval(actualizarFechaHora, 1000);
actualizarFechaHora(); // inicializa al cargar






function actualizarBufferVisual() {
    const bufferView = document.getElementById("buffer-view");
    bufferView.innerHTML = "";
    buffer.slice().reverse().forEach((valor, i) => {
        const li = document.createElement("li");
        li.textContent = `${i + 1}: ${valor}`;
        bufferView.appendChild(li);
    });
    bufferView.scrollTop = bufferView.scrollHeight;
}

function guardarEstado() {
    localStorage.setItem("buffer", JSON.stringify(buffer));
    localStorage.setItem("historial", JSON.stringify(historial));
    localStorage.setItem("historialNavegable", JSON.stringify(historialNavegable));
}

function guardarHistorialComoArchivo() {
    const contenido = output.innerText; // captura solo texto plano
    const blob = new Blob([contenido], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const enlace = document.createElement("a");
    enlace.href = url;
    enlace.download = `historial_${new Date().toISOString().slice(0, 19).replace(/[:T]/g, "-")}.txt`;
    document.body.appendChild(enlace);
    enlace.click();
    document.body.removeChild(enlace);
    URL.revokeObjectURL(url);
}



function to9511(real) {
    if (real === 0) return "00000000";

    // 1. Signo de la mantisa: 1 = negativo, 0 = positivo
    const signMantisa = real < 0 ? 1 : 0;
    const abs = Math.abs(real);

    // 2. Normalizar mantisa en el rango [0.5, 1)
    let exponent = 0;
    let mantisa = abs;

    while (mantisa >= 1) {
        mantisa /= 2;
        exponent++;
    }
    while (mantisa < 0.5) {
        mantisa *= 2;
        exponent--;
    }

    // 3. Codificar mantisa en 24 bits
    const mantisaBinInt = Math.floor(mantisa * (1 << 24));
    const mantisaBin = mantisaBinInt & 0xFFFFFF;

    // 4. Signo del exponente: 1 = negativo, 0 = positivo
    const signExp = exponent < 0 ? 1 : 0;

    // 5. Complemento a 2 del exponente en 6 bits
    const absExp = Math.abs(exponent);
    let expBits = absExp & 0b111111;
    if (signExp === 1) {
        expBits = (~expBits + 1) & 0b111111;
    }

    // 6. Construir los 32 bits
    let bits = 0;
    bits |= (signMantisa & 1) << 31;
    bits |= (signExp & 1) << 30;
    bits |= (expBits & 0b111111) << 24;
    bits |= mantisaBin;

    // 7. Convertir a hexadecimal
    return (bits >>> 0).toString(16).padStart(8, "0").toUpperCase();
}




function from9511(hex) {
    if (!/^[0-9A-F]{8}$/i.test(hex)) return NaN;

    const bits = parseInt(hex, 16);

    // Extraer campos
    const signMantisa = (bits >>> 31) & 1;
    const signExp = (bits >>> 30) & 1;
    const expBits = (bits >>> 24) & 0b111111;
    const mantisaBits = bits & 0xFFFFFF;

    // Interpretar complemento a 2 del exponente
    let exponent;
    if (signExp === 0) {
        exponent = expBits;
    } else {
        exponent = -((~expBits + 1) & 0b111111);
    }

    // Reconstruir mantisa
    const mantisa = mantisaBits / (1 << 24);

    // Reconstruir valor
    const valor = mantisa * Math.pow(2, exponent);
    return signMantisa === 1 ? -valor : valor;
}



function cargarUnidades(familia) {
    console.log("Cargando unidades para:", familia); // 👈
    const origen = document.getElementById("unidad-origen");
    const destino = document.getElementById("unidad-destino");

    origen.innerHTML = "";
    destino.innerHTML = "";

    const unidades = unidadesPorFamilia[familia];
    if (!unidades) return;

    unidades.forEach(u => {
        origen.innerHTML += `<option value="${u}">${u}</option>`;
        destino.innerHTML += `<option value="${u}">${u}</option>`;
    });
}

function convertirValor(valor, familia, origen, destino) {
    if (familia === "temperatura") {
        return convertirTemperatura(valor, origen, destino);
    }

    const f = factores[familia];
    if (!f || !f[origen] || !f[destino]) return null;

    const base = valor * f[origen]; // convertir a unidad base
    const resultado = base / f[destino];
    return resultado;
}


function convertirTemperatura(valor, origen, destino) {
    if (origen === destino) return valor;

    if (origen === "C" && destino === "F") return valor * 9 / 5 + 32;
    if (origen === "F" && destino === "C") return (valor - 32) * 5 / 9;
    if (origen === "C" && destino === "K") return valor + 273.15;
    if (origen === "K" && destino === "C") return valor - 273.15;
    if (origen === "F" && destino === "K") return (valor - 32) * 5 / 9 + 273.15;
    if (origen === "K" && destino === "F") return (valor - 273.15) * 9 / 5 + 32;

    return null;
}





function procesarEntrada(cmd) {
    if (!isNaN(cmd)) {
        const num = parseFloat(cmd);
        buffer.push(num);
        historial.unshift({ tipo: "input", valor: num });
        historialNavegable.unshift(cmd);
        actualizarBufferVisual();
        guardarEstado();
        output.innerHTML += `<div><span class="input-label">input:</span> <span class="input-value">${cmd}</span></div>`;
        indiceNavegable = -1;
    } else if (["+", "-", "*", "/"].includes(cmd)) {
        if (buffer.length < 2) {
            output.innerHTML += `<div class="error">> ${cmd}<br>Error: se necesitan al menos 2 números</div>`;
        } else {
            const b = buffer.pop();
            const a = buffer.pop();
            let resultado;

            switch (cmd) {
                case "+": resultado = a + b; break;
                case "-": resultado = a - b; break;
                case "*": resultado = a * b; break;
                case "/": resultado = b !== 0 ? a / b : "Error: división por cero"; break;
            }

            if (typeof resultado === "number") {
                const redondeado = parseFloat(resultado.toFixed(2));
                buffer.push(redondeado);
                historial.unshift({
                    tipo: "operacion",
                    operador: cmd,
                    a,
                    b,
                    resultado: redondeado
                });
                historialNavegable.unshift(redondeado.toString());
                actualizarBufferVisual();
                guardarEstado();
                output.innerHTML += `<div><span class="op-label">> ${cmd}</span><br><span class="operation">${a} ${cmd} ${b}</span><br><span class="result-label">Resultado:</span> <span class="result-value">${redondeado}</span></div>`;
                indiceNavegable = -1;
            } else {
                output.innerHTML += `<div class="error">> ${cmd}<br>${resultado}</div>`;
            }
        }
    } else if (cmd === "inv") {
        if (buffer.length < 1) {
            output.innerHTML += `<div class="error">> inv<br>Error: el buffer está vacío</div>`;
        } else {
            const x = buffer.pop();
            if (x === 0) {
                output.innerHTML += `<div class="error">> inv<br>Error: no se puede calcular la inversa de 0</div>`;
                buffer.push(x);
            } else {
                const inversa = parseFloat((1 / x).toFixed(4));
                buffer.push(inversa);
                historial.unshift({
                    tipo: "operacion",
                    operador: "inv",
                    a: x,
                    b: null,
                    resultado: inversa
                });
                historialNavegable.unshift(inversa.toString());
                actualizarBufferVisual();
                guardarEstado();
                output.innerHTML += `<div><span class="op-label">> inv</span><br><span class="operation">1 / ${x}</span><br><span class="result-label">Resultado:</span> <span class="result-value">${inversa}</span></div>`;
                indiceNavegable = -1;
            }
        }
    } else if (cmd.startsWith("nota ")) {
        const textoNota = cmd.slice(5).trim();
        if (textoNota) {
            historial.unshift({ tipo: "nota", contenido: textoNota });
            guardarEstado();
            output.innerHTML += `<div class="info">📝 <span class="info">nota:</span><br><span class="operation">${textoNota}</span></div>`;
        } else {
            output.innerHTML += `<div class="error">> nota<br>Error: la nota está vacía</div>`;
        }
    } else if (cmd.startsWith("sqrt ")) {
        const base = parseInt(cmd.slice(5).trim());
        if (isNaN(base) || base < 2) {
            output.innerHTML += `<div class="error">> sqrt<br>Error: raíz inválida. Usa sqrt n con n ≥ 2</div>`;
        } else if (buffer.length < 1) {
            output.innerHTML += `<div class="error">> sqrt ${base}<br>Error: el buffer está vacío</div>`;
        } else {
            const x = buffer.pop();
            const resultado = parseFloat(Math.pow(x, 1 / base).toFixed(4));
            buffer.push(resultado);
            historial.unshift({
                tipo: "operacion",
                operador: "sqrt",
                a: x,
                b: base,
                resultado
            });
            historialNavegable.unshift(resultado.toString());
            actualizarBufferVisual();
            guardarEstado();
            output.innerHTML += `<div><span class="op-label">> sqrt ${base}</span><br><span class="operation">raíz ${base} de ${x}</span><br><span class="result-label">Resultado:</span> <span class="result-value">${resultado}</span></div>`;
            indiceNavegable = -1;
        }
    } else if (cmd.startsWith("sqr ")) {
        const potencia = parseInt(cmd.slice(4).trim());
        if (isNaN(potencia) || potencia < 1) {
            output.innerHTML += `<div class="error">> sqr<br>Error: potencia inválida. Usa sqr n con n ≥ 1</div>`;
        } else if (buffer.length < 1) {
            output.innerHTML += `<div class="error">> sqr ${potencia}<br>Error: el buffer está vacío</div>`;
        } else {
            const x = buffer.pop();
            const resultado = parseFloat(Math.pow(x, potencia).toFixed(4));
            buffer.push(resultado);
            historial.unshift({
                tipo: "operacion",
                operador: "sqr",
                a: x,
                b: potencia,
                resultado
            });
            historialNavegable.unshift(resultado.toString());
            actualizarBufferVisual();
            guardarEstado();
            output.innerHTML += `<div><span class="op-label">> sqr ${potencia}</span><br><span class="operation">${x} ^ ${potencia}</span><br><span class="result-label">Resultado:</span> <span class="result-value">${resultado}</span></div>`;
            indiceNavegable = -1;
        }

    } else if (cmd.startsWith("log")) {
        const arg = cmd.slice(3).trim();
        let base;

        if (arg === "") {
            base = 10;
        } else if (arg === "e") {
            base = Math.E;
        } else {
            base = parseFloat(arg);
        }

        if (isNaN(base) || base <= 0 || base === 1) {
            output.innerHTML += `<div class="error">> log ${arg}<br>Error: base inválida. Usa log, log e o log n con n > 0 y ≠ 1</div>`;
        } else if (buffer.length < 1) {
            output.innerHTML += `<div class="error">> log ${arg}<br>Error: el buffer está vacío</div>`;
        } else {
            const x = buffer.pop();
            if (x <= 0) {
                output.innerHTML += `<div class="error">> log ${arg}<br>Error: no se puede calcular logaritmo de ${x}</div>`;
                buffer.push(x);
            } else {
                const resultado = parseFloat((Math.log(x) / Math.log(base)).toFixed(4));
                buffer.push(resultado);
                historial.unshift({
                    tipo: "operacion",
                    operador: "log",
                    a: x,
                    b: base,
                    resultado
                });
                historialNavegable.unshift(resultado.toString());
                actualizarBufferVisual();
                guardarEstado();
                const baseTexto = arg === "" ? "10" : (arg === "e" ? "e" : base);
                output.innerHTML += `<div><span class="op-label">> log ${baseTexto}</span><br><span class="operation">log base ${baseTexto} de ${x}</span><br><span class="result-label">Resultado:</span> <span class="result-value">${resultado}</span></div>`;
                indiceNavegable = -1;
            }
        }

    }

    else if (["sin", "cos", "tan"].includes(cmd)) {
        if (buffer.length < 1) {
            output.innerHTML += `<div class="error">> ${cmd}<br>Error: el buffer está vacío</div>`;
        } else {
            const x = buffer.pop();
            const rad = x * Math.PI / 180; // convertir a radianes
            let resultado;

            switch (cmd) {
                case "sin": resultado = Math.sin(rad); break;
                case "cos": resultado = Math.cos(rad); break;
                case "tan": resultado = Math.tan(rad); break;
            }

            const redondeado = parseFloat(resultado.toFixed(4));
            buffer.push(redondeado);
            historial.unshift({
                tipo: "operacion",
                operador: cmd,
                a: x,
                b: null,
                resultado: redondeado
            });
            historialNavegable.unshift(redondeado.toString());
            actualizarBufferVisual();
            guardarEstado();
            output.innerHTML += `<div><span class="op-label">> ${cmd}</span><br><span class="operation">${cmd}(${x}°)</span><br><span class="result-label">Resultado:</span> <span class="result-value">${redondeado}</span></div>`;
            indiceNavegable = -1;
        }
        output.scrollTop = output.scrollHeight;
    }

    else if (["asin", "acos", "atan", "deg", "rad"].includes(cmd)) {
        if (buffer.length < 1) {
            output.innerHTML += `<div class="error">> ${cmd}<br>Error: el buffer está vacío</div>`;
        } else {
            const x = buffer.pop();
            let resultado;

            switch (cmd) {
                case "asin":
                    if (x < -1 || x > 1) {
                        output.innerHTML += `<div class="error">> asin<br>Error: dominio inválido para asin (${x})</div>`;
                        buffer.push(x);
                        output.scrollTop = output.scrollHeight;
                        return;
                    }
                    resultado = Math.asin(x) * 180 / Math.PI;
                    break;
                case "acos":
                    if (x < -1 || x > 1) {
                        output.innerHTML += `<div class="error">> acos<br>Error: dominio inválido para acos (${x})</div>`;
                        buffer.push(x);
                        output.scrollTop = output.scrollHeight;
                        return;
                    }
                    resultado = Math.acos(x) * 180 / Math.PI;
                    break;
                case "atan":
                    resultado = Math.atan(x) * 180 / Math.PI;
                    break;
                case "deg":
                    resultado = x * 180 / Math.PI;
                    break;
                case "rad":
                    resultado = x * Math.PI / 180;
                    break;
            }

            const redondeado = parseFloat(resultado.toFixed(4));
            buffer.push(redondeado);
            historial.unshift({
                tipo: "operacion",
                operador: cmd,
                a: x,
                b: null,
                resultado: redondeado
            });
            historialNavegable.unshift(redondeado.toString());
            actualizarBufferVisual();
            guardarEstado();
            const label = ["deg", "rad"].includes(cmd)
                ? `${cmd}(${x})`
                : `${cmd}(${x}) → grados`;
            output.innerHTML += `<div><span class="op-label">> ${cmd}</span><br><span class="operation">${label}</span><br><span class="result-label">Resultado:</span> <span class="result-value">${redondeado}</span></div>`;
            indiceNavegable = -1;
        }
        output.scrollTop = output.scrollHeight;
    }

    else if (cmd === "rango") {

        if (buffer.length < 2) {
            output.innerHTML += `<div class="error">> ${cmd}<br>Error: se necesitan al menos 2 números en el buffer</div>`;
        } else {
            const b = buffer.pop();
            const a = buffer.pop();
            let resultado;
            ultimoRango = { a, b };

            if (cmd === "rango") {
                resultado = Math.abs(b - a);
            } else {
                resultado = Math.abs(Math.pow(b, 2) - Math.pow(a, 2));
            }

            span = resultado; // ← guarda el resultado como span

            historial.unshift({
                tipo: "operacion",
                operador: cmd,
                a,
                b,
                resultado
            });

            actualizarBufferVisual();
            guardarEstado();
            output.innerHTML += `<div><span class="op-label">> ${cmd}</span><br><span class="operation">${cmd === "rango" ? `|${b} - ${a}|` : `|${b}² - ${a}²|`}</span><br><span class="result-label">Span:</span> <span class="result-value">${resultado}</span></div>`;
            indiceNavegable = -1;
        }
        output.scrollTop = output.scrollHeight;
    }

    else if (cmd.startsWith("porcentual ")) {
        const n = parseInt(cmd.slice(11).trim());
        if (!ultimoRango) {
            output.innerHTML += `<div class="error">> porcentual ${n}<br>Error: no hay rango previo</div>`;
        } else if (isNaN(n) || n < 2) {
            output.innerHTML += `<div class="error">> porcentual ${n}<br>Error: usa porcentual n con n ≥ 2</div>`;
        } else {
            const { a, b } = ultimoRango;
            const paso = (b - a) / (n - 1);
            const valores = [];

            for (let i = 0; i < n; i++) {
                const porcentaje = Math.round((i / (n - 1)) * 100);
                const valor = parseFloat((a + paso * i).toFixed(4));
                valores.push({ porcentaje, valor });
            }

            historial.unshift({
                tipo: "operacion",
                operador: "porcentual",
                a,
                b,
                resultado: valores
            });

            guardarEstado();

            output.innerHTML += `<div><span class="op-label">> porcentual ${n}</span><br><span class="operation">Distribución entre ${a} y ${b}:</span><br>` +
                valores.map(v => `<span class="result-label">${v.porcentaje}%:</span> <span class="result-value">${v.valor}</span>`).join("<br>") +
                `</div>`;
            indiceNavegable = -1;
        }
        output.scrollTop = output.scrollHeight;
    }

    else if (cmd.startsWith("cuadratica ")) {
        const n = parseInt(cmd.slice(11).trim());
        if (!ultimoRango) {
            output.innerHTML += `<div class="error">> cuadratica ${n}<br>Error: no hay rango previo</div>`;
        } else if (isNaN(n) || n < 2) {
            output.innerHTML += `<div class="error">> cuadratica ${n}<br>Error: usa cuadratica n con n ≥ 2</div>`;
        } else {
            const { a, b } = ultimoRango;
            const delta = b - a;
            const valores = [];

            for (let i = 0; i < n; i++) {
                const t = i / (n - 1);        // porcentaje normalizado (0 a 1)
                const porcentaje = Math.round(t * 100);
                const valor = parseFloat((a + delta * Math.pow(t, 2)).toFixed(4));
                valores.push({ porcentaje, valor });
            }

            historial.unshift({
                tipo: "operacion",
                operador: "cuadratica",
                a,
                b,
                resultado: valores
            });

            guardarEstado();

            output.innerHTML += `<div><span class="op-label">> cuadratica ${n}</span><br><span class="operation">Distribución cuadrática entre ${a} y ${b}:</span><br>` +
                valores.map(v => `<span class="result-label">${v.porcentaje}%:</span> <span class="result-value">${v.valor}</span>`).join("<br>") +
                `</div>`;
            indiceNavegable = -1;
        }
        output.scrollTop = output.scrollHeight;
    }

    else if (/^\d+(\.\d+)?%$/.test(cmd)) {
        // Ejemplo: "50%"
        if (!ultimoRango) {
            output.innerHTML += `<div class="error">> ${cmd}<br>Error: no hay rango definido</div>`;
        } else {
            const porcentaje = parseFloat(cmd.replace("%", ""));
            if (isNaN(porcentaje) || porcentaje < 0 || porcentaje > 100) {
                output.innerHTML += `<div class="error">> ${cmd}<br>Error: porcentaje inválido</div>`;
            } else {
                const { a, b } = ultimoRango;
                const valor = parseFloat((a + (b - a) * (porcentaje / 100)).toFixed(4));
                historial.unshift({
                    tipo: "operacion",
                    operador: "%",
                    a: porcentaje,
                    b: null,
                    resultado: valor
                });
                historialNavegable.unshift(valor.toString());
                guardarEstado();
                output.innerHTML += `<div><span class="op-label">> ${cmd}</span><br><span class="operation">${porcentaje}% de rango ${a} → ${b}</span><br><span class="result-label">Valor:</span> <span class="result-value">${valor}</span></div>`;
                indiceNavegable = -1;
            }
        }
        output.scrollTop = output.scrollHeight;


    }

    else if (/^\d+(\.\d+)?x$/.test(cmd)) {
        // Ejemplo: "1500x"
        if (!ultimoRango) {
            output.innerHTML += `<div class="error">> ${cmd}<br>Error: no hay rango definido</div>`;
        } else {
            const valor = parseFloat(cmd.replace("x", "").trim());
            const { a, b } = ultimoRango;
            if (isNaN(valor) || valor < Math.min(a, b) || valor > Math.max(a, b)) {
                output.innerHTML += `<div class="error">> ${cmd}<br>Error: valor fuera del rango</div>`;
            } else {
                const porcentaje = parseFloat(((100 * (valor - a) / (b - a)).toFixed(2)));
                historial.unshift({
                    tipo: "operacion",
                    operador: "x",
                    a: valor,
                    b: null,
                    resultado: porcentaje
                });
                historialNavegable.unshift(porcentaje.toString());
                guardarEstado();
                output.innerHTML += `<div><span class="op-label">> ${cmd}</span><br><span class="operation">¿Qué porcentaje representa ${valor} en rango ${a} → ${b}?</span><br><span class="result-label">Porcentaje:</span> <span class="result-value">${porcentaje}%</span></div>`;
                indiceNavegable = -1;
            }
        }
        output.scrollTop = output.scrollHeight;
    }

    else if (cmd === "to9511") {
        if (buffer.length < 1) {
            output.innerHTML += `<div class="error">> to9511<br>Error: el buffer está vacío</div>`;
        } else {
            const n = buffer[buffer.length - 1];
            const hex = to9511(n);
            historial.unshift({
                tipo: "operacion",
                operador: "to9511",
                a: n,
                b: null,
                resultado: hex
            });
            /*historialNavegable.unshift(hex);*/
            historialNavegable.unshift(`HEX:${hex}`);
            guardarEstado();

            output.innerHTML += `<div><span class="op-label">> to9511</span><br><span class="operation">Conversión al formato 9511</span><br><span class="result-label">Valor:</span> <span class="result-value">${n}</span><br><span class="result-label">Hexadecimal:</span> <span class="result-value result-hex">${hex}</span></div>`;

            /*output.innerHTML += `<div><span class="op-label">> to9511</span><br><span class="operation">Conversión al formato 9511</span><br><span class="result-label">Valor:</span> <span class="result-value">${n}</span><br><span class="result-label">Hexadecimal:</span> <span class="result-value">${hex}</span></div>`;*/
            indiceNavegable = -1;
        }
        output.scrollTop = output.scrollHeight;
    }

    else if (cmd === "to9511verbose") {
        if (buffer.length < 1) {
            output.innerHTML += `<div class="error">> to9511verbose<br>Error: el buffer está vacío</div>`;
        } else {
            const real = buffer[buffer.length - 1];

            const signMantisa = real < 0 ? 1 : 0;
            const abs = Math.abs(real);

            let exponent = 0;
            let mantisa = abs;

            while (mantisa >= 1) {
                mantisa /= 2;
                exponent++;
            }
            while (mantisa < 0.5) {
                mantisa *= 2;
                exponent--;
            }

            const mantisaBinInt = Math.floor(mantisa * (1 << 24));
            const mantisaBin = mantisaBinInt.toString(2).padStart(24, "0");

            const signExp = exponent < 0 ? 1 : 0;
            const absExp = Math.abs(exponent);
            let expBits = absExp & 0b111111;
            if (signExp === 1) {
                expBits = (~expBits + 1) & 0b111111;
            }
            const complementoA2 = expBits.toString(2).padStart(6, "0");

            let bits = 0;
            bits |= (signMantisa & 1) << 31;
            bits |= (signExp & 1) << 30;
            bits |= (expBits & 0b111111) << 24;
            bits |= mantisaBinInt & 0xFFFFFF;

            const binarioFinal = (bits >>> 0).toString(2).padStart(32, "0");
            const hexFinal = bits.toString(16).padStart(8, "0").toUpperCase();

            output.innerHTML += `<div><span class="op-label">> to9511verbose</span>
        <span class="operation">Conversión detallada al formato 9511</span>
        <span class="result-label">Valor original:</span> <span class="result-value">${real}</span>
        <span class="result-label">Signo mantisa:</span> <span class="result-value">${signMantisa ? "-" : "+"} (${signMantisa})</span>
        <span class="result-label">Signo exponente:</span> <span class="result-value">${signExp ? "-" : "+"} (${signExp})</span>
        <span class="result-label">Exponente:</span> <span class="result-value">${exponent}</span>
        <span class="result-label">Complemento A2 (6 bits):</span> <span class="result-value">${complementoA2}</span>
        <span class="result-label">Mantisa normalizada:</span> <span class="result-value">${mantisa}</span>
        <span class="result-label">Mantisa codificada (24 bits):</span> <span class="result-value">${mantisaBin}</span>
        <span class="result-label">Binario final (32 bits):</span> <span class="result-value">${binarioFinal}</span>
        <span class="result-label">Hexadecimal final:</span> <span class="result-value result-hex">${hexFinal}</span></div>`;

            indiceNavegable = -1;
            output.scrollTop = output.scrollHeight;
        }
    }

    else if (cmd.startsWith("from9511 ")) {
        const hex = cmd.slice(9).trim().toUpperCase();
        if (!/^[0-9A-F]{8}$/.test(hex)) {
            output.innerHTML += `<div class="error">> from9511 ${hex}<br>Error: formato hexadecimal inválido</div>`;
        } else {
            const valor = from9511(hex);
            historial.unshift({
                tipo: "operacion",
                operador: "from9511",
                a: hex,
                b: null,
                resultado: valor
            });
            historialNavegable.unshift(valor.toString());
            guardarEstado();
            output.innerHTML += `<div><span class="op-label">> from9511 ${hex}</span><br><span class="operation">Conversión desde formato 9511</span><br><span class="result-label">Hexadecimal:</span> <span class="result-value result-hex">${hex}</span><br><span class="result-label">Valor:</span> <span class="result-value">${valor}</span></div>`;
            indiceNavegable = -1;
        }
        output.scrollTop = output.scrollHeight;
    }

    else if (cmd.startsWith("from9511verbose")) {
        let hex = cmd.slice(17).trim().toUpperCase();

        // Si no se pasa argumento, usar el último valor del buffer

        if (hex === "") {
            const ultimoHex = historialNavegable.find(v => v.startsWith("HEX:"));
            if (!ultimoHex) {
                output.innerHTML += `<div class="error">> from9511verbose<br>Error: no hay ningún valor hexadecimal reciente disponible</div>`;
                return;
            }
            hex = ultimoHex.slice(4).toUpperCase();
        }

        // Si tiene menos de 8 caracteres, rellenar con ceros a la izquierda
        if (/^[0-9A-F]{1,7}$/.test(hex)) {
            hex = hex.padStart(8, "0");
        }

        if (!/^[0-9A-F]{8}$/.test(hex)) {
            output.innerHTML += `<div class="error">> from9511verbose ${hex}<br>Error: formato hexadecimal inválido</div>`;
        } else {
            const bits = parseInt(hex, 16);
            const signMantisa = (bits >>> 31) & 1;
            const signExp = (bits >>> 30) & 1;
            const expBits = (bits >>> 24) & 0b111111;
            const mantisaBits = bits & 0xFFFFFF;

            let exponent;
            if (signExp === 0) {
                exponent = expBits;
            } else {
                exponent = -((~expBits + 1) & 0b111111);
            }

            const complementoA2 = expBits.toString(2).padStart(6, "0");
            const mantisa = mantisaBits / (1 << 24);
            const resultado = signMantisa === 1 ? -mantisa * Math.pow(2, exponent) : mantisa * Math.pow(2, exponent);
            const binarioFinal = (bits >>> 0).toString(2).padStart(32, "0");
            const mantisaBin = mantisaBits.toString(2).padStart(24, "0");

            output.innerHTML += `<div><span class="op-label">> from9511verbose ${hex}</span>
        <span class="operation">Desglose detallado desde formato 9511</span>
        <span class="result-label">Hexadecimal:</span> <span class="result-value result-hex">${hex}</span>
        <span class="result-label">Binario final (32 bits):</span> <span class="result-value">${binarioFinal}</span>
        <span class="result-label">Signo mantisa:</span> <span class="result-value">${signMantisa ? "-" : "+"} (${signMantisa})</span>
        <span class="result-label">Signo exponente:</span> <span class="result-value">${signExp ? "-" : "+"} (${signExp})</span>
        <span class="result-label">Complemento A2 (6 bits):</span> <span class="result-value">${complementoA2}</span>
        <span class="result-label">Exponente:</span> <span class="result-value">${exponent}</span>
        <span class="result-label">Mantisa codificada (24 bits):</span> <span class="result-value">${mantisaBin}</span>
        <span class="result-label">Mantisa reconstruida:</span> <span class="result-value">${mantisa}</span>
        <span class="result-label">Valor final:</span> <span class="result-value">${resultado}</span></div>`;

            indiceNavegable = -1;
            output.scrollTop = output.scrollHeight;
        }
    }


    else if (cmd === "conversor") {
        /*document.getElementById("modal-conversor").classList.remove("oculto");*/
        const modal = document.getElementById("modal-conversor");
        modal.classList.remove("oculto");

        const ultimo = buffer[buffer.length - 1];
        const valor = (typeof ultimo === "number" || !isNaN(parseFloat(ultimo))) ? ultimo : "1";
        document.getElementById("valor-conversion").value = valor;

        const selector = document.getElementById("familia-unidad");
        selector.value = "temperatura";
        cargarUnidades("temperatura");
    }






    else if (cmd === "help") {
        const funciones = [
            // 🧮 Básicos
            { comando: "🧮 Básicos", descripcion: "" },
            { comando: "+ - * /", descripcion: "Operaciones entre los dos últimos números del buffer" },
            { comando: "inv", descripcion: "Inversa del último número del buffer (1/x)" },
            { comando: "sqrt n", descripcion: "Raíz n-ésima del último número del buffer" },
            { comando: "sqr n", descripcion: "Potencia n del último número del buffer" },
            { comando: "log", descripcion: "Logaritmo base 10 del último número del buffer" },
            { comando: "log n", descripcion: "Logaritmo base n del último número del buffer" },
            { comando: "log e", descripcion: "Logaritmo neperiano (base e) del último número del buffer" },

            // 📐 Trigonometría
            { comando: "📐 Trigonometría", descripcion: "" },
            { comando: "sin", descripcion: "Seno del último número del buffer (en grados)" },
            { comando: "cos", descripcion: "Coseno del último número del buffer (en grados)" },
            { comando: "tan", descripcion: "Tangente del último número del buffer (en grados)" },
            { comando: "asin", descripcion: "Arco seno del último número del buffer (resultado en grados)" },
            { comando: "acos", descripcion: "Arco coseno del último número del buffer (resultado en grados)" },
            { comando: "atan", descripcion: "Arco tangente del último número del buffer (resultado en grados)" },
            { comando: "deg", descripcion: "Convierte de radianes a grados el último número del buffer" },
            { comando: "rad", descripcion: "Convierte de grados a radianes el último número del buffer" },

            // 📊 Rango y distribución
            { comando: "📊 Rango y distribución", descripcion: "" },
            { comando: "rango", descripcion: "Calcula la diferencia entre los dos últimos valores del buffer y define un rango" },
            { comando: "porcentual n", descripcion: "Genera n valores equidistantes entre los extremos del último rango" },
            { comando: "cuadratica n", descripcion: "Genera n valores distribuidos cuadráticamente entre los extremos del último rango" },
            { comando: "n%", descripcion: "Devuelve el valor correspondiente al porcentaje n dentro del último rango (ej: 25%)" },
            { comando: "nx", descripcion: "Devuelve el porcentaje que representa el valor n dentro del último rango (ej: 1500x)" },

            // 🧾 Conversión 9511
            { comando: "🧾 Conversión 9511", descripcion: "" },
            { comando: "to9511", descripcion: "Convierte el último número del buffer al formato hexadecimal 9511 (8 caracteres)" },
            { comando: "from9511 HEX", descripcion: "Convierte un valor hexadecimal 9511 al número real correspondiente" },


            // 📝 Utilidades
            { comando: "📝 Utilidades", descripcion: "" },
            { comando: "nota texto", descripcion: "Añade una nota al historial visual" },
            { comando: "Delete", descripcion: "Borra el buffer, historial y navegación" },
            { comando: "F8", descripcion: "Exporta el historial visual como archivo .txt" },
            { comando: "ArrowUp / ArrowDown", descripcion: "Navega por entradas y resultados anteriores" },
            { comando: "help", descripcion: "Muestra este menú de ayuda con todos los comandos disponibles" }
        ];


        output.innerHTML += `<div class="info">📘 <span class="info">Funciones disponibles:</span><br>` +
            funciones.map(f =>
                f.descripcion
                    ? `<span class="operation">• <b>${f.comando}</b>: ${f.descripcion}</span>`
                    : `<br><span class="group-title">${f.comando}</span>`
            ).join("<br>") +
            `</div>`;



        /*
                output.innerHTML += `<div class="info">📘 <span class="info">Funciones disponibles:</span><br>` +
                    funciones.map(f => `<span class="operation">• <b>${f.comando}</b>: ${f.descripcion}</span>`).join("<br>") +
                    `</div>`;*/
        output.scrollTop = output.scrollHeight;
    }


    else {
        output.innerHTML += `<div class="error">> ${cmd}<br>Comando desconocido</div>`;
    }

    output.scrollTop = output.scrollHeight;
}


let conversionEjecutada = false;

document.addEventListener("DOMContentLoaded", () => {
    document.getElementById("familia-unidad").addEventListener("change", e => {
        cargarUnidades(e.target.value);
    });

    document.getElementById("cerrar-conversor").addEventListener("click", () => {
        document.getElementById("modal-conversor").classList.add("oculto");
    });

    document.getElementById("confirmar-conversion").addEventListener("click", () => {
        if (conversionEjecutada) return;
        conversionEjecutada = true;

        const familia = document.getElementById("familia-unidad").value;
        const origen = document.getElementById("unidad-origen").value;
        const destino = document.getElementById("unidad-destino").value;
        const valor = parseFloat(document.getElementById("valor-conversion").value);

        if (isNaN(valor)) {
            output.innerHTML += `<div class="error">Error: el valor no es numérico</div>`;
            return;
        }

        const resultado = convertirValor(valor, familia, origen, destino);

        if (resultado === null || isNaN(resultado)) {
            output.innerHTML += `<div class="error">Error: conversión no válida</div>`;
            return;
        }

        output.innerHTML += `<div><span class="op-label">> convertir ${valor} <span class="unidad">${origen}</span> a <span class="unidad">${destino}</span></span><br><span class="operation">Conversión de ${familia}</span><br><span class="result-label">Resultado:</span> <span class="result-value">${resultado.toFixed(4)}</span></div>`;

        historial.unshift({
            tipo: "operacion",
            operador: "convertir",
            a: valor,
            b: { origen, destino, familia },
            resultado: resultado.toFixed(4)
        });

        document.getElementById("modal-conversor").classList.add("oculto");
        output.scrollTop = output.scrollHeight;

        setTimeout(() => conversionEjecutada = false, 100); // desbloquea tras un breve tiempo
    });
    /*
        document.getElementById("confirmar-conversion").addEventListener("click", () => {
            const familia = document.getElementById("familia-unidad").value;
            const origen = document.getElementById("unidad-origen").value;
            const destino = document.getElementById("unidad-destino").value;
            const valor = parseFloat(document.getElementById("valor-conversion").value);
    
            if (isNaN(valor)) {
                output.innerHTML += `<div class="error">Error: el valor no es numérico</div>`;
                return;
            }
    
            const resultado = convertirValor(valor, familia, origen, destino);
    
            if (resultado === null || isNaN(resultado)) {
                output.innerHTML += `<div class="error">Error: conversión no válida</div>`;
                return;
            }
    
            output.innerHTML += `<div><span class="op-label">> convertir ${valor} <span class="unidad">${origen}</span> a <span class="unidad">${destino}</span></span><br><span class="operation">Conversión de ${familia}</span><br><span class="result-label">Resultado:</span> <span class="result-value">${resultado.toFixed(4)}</span></div>`;
    
            historial.unshift({
                tipo: "operacion",
                operador: "convertir",
                a: valor,
                b: { origen, destino, familia },
                resultado: resultado.toFixed(4)
            });
    
            document.getElementById("modal-conversor").classList.add("oculto");
            output.scrollTop = output.scrollHeight;
        });*/

    // También puedes conectar aquí el botón de conversión si aún no lo has hecho
    input.addEventListener("keydown", function (e) {
        const valor = input.value.trim();
        const operadores = ["+", "-", "*", "/"];

        if (e.key === "ArrowUp") {
            e.preventDefault();
            if (historialNavegable.length > 0 && indiceNavegable < historialNavegable.length - 1) {
                indiceNavegable++;
                input.value = historialNavegable[indiceNavegable];
            }
        }

        if (e.key === "ArrowDown") {
            e.preventDefault();
            if (indiceNavegable > 0) {
                indiceNavegable--;
                input.value = historialNavegable[indiceNavegable];
            } else {
                indiceNavegable = -1;
                input.value = "";
            }
        }

        if (operadores.includes(e.key)) {
            e.preventDefault();
            if (valor !== "" && !isNaN(valor)) {
                procesarEntrada(valor);
            }
            procesarEntrada(e.key);
            input.value = "";
            return;
        }

        if (e.key === "Delete") {
            e.preventDefault();
            buffer = [];
            historial = [];
            historialNavegable = [];
            indiceHistorial = -1;
            indiceNavegable = -1;
            output.innerHTML = `<div class="info">> limpiar<br>Buffer, historial y navegación borrados</div>`;
            actualizarBufferVisual();
            guardarEstado();
            input.value = "";
            return;
        }

        if (e.key === "Tab") {
            e.preventDefault();
            if (valor !== "" && !isNaN(valor)) {
                input.value = valor.startsWith("-") ? valor.slice(1) : "-" + valor;
            }
            return;
        }

        if (e.key === "Enter") {
            if (valor) {
                procesarEntrada(valor);
                input.value = "";
            }
        }

        if (e.key === "F8") {
            e.preventDefault();
            guardarHistorialComoArchivo();
            output.innerHTML += `<div class="info">> exportar<br>Historial exportado correctamente</div>`;
            output.scrollTop = output.scrollHeight;
            return;
        }
    });

});
