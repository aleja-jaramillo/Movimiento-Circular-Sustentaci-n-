var colorBackground = "#ffffff"; // Color de fondo
var colorBody = "#ffffff"; // Color del cuerpo del péndulo.
var colorPosition = "#ff0000"; // Color para posicionar
var colorVelocity = "#ff00ff"; // Color para velocidad
var colorAcceleration = "#0000ff"; // color para aceleracion
var colorForce = "#008000"; // Color para fueza

// otras constantes

var MX = 150,
    MY = 160; // centro del círculo
var DX = 310,
    DY = 160; // diagrama de origen
var DEG = Math.PI / 180; // grado angular (radianes)
var FONT1 = "normal normal bold 12px sans-serif"; // conjunto de caracteres

// Attribute:

var canvas, ctx; // área de dibujo, contexto gráfico
var width, height; //  Dimensiones del área de dibujo (píxeles)
var bu1, bu2; // Botones de cambio (reinicio, inicio / pausa / continuar)
var cbSlow; //  botón de radio (cámara lenta)
var ipR, ipT, ipM; // campos de entrada (radio, período orbital, masa)
var rb1, rb2, rb3, rb4; // botones de radio (tamaño considerado)
var on; //  bandera para movimiento
var slow; //  bandera de cámara lenta
var t0; // hora de inicio
var t; // hora (s) actual (es)
var tU; // hora para el origen del gráfico
var timer; // Temporizador para animación
var nrSize; // número del tamaño considerado (0 a 3)
var r, rPix; // radio (mo píxeles)
var tPer; // período (s) orbital (es)
var m; // masa (kg)
var omega; //velocidad angular (1 / s)
var phi, sinPhi, cosPhi; //ángulo de rotación (radianes, valores trigonométricos)
var x, y, xPix, yPix; // posición (mo píxeles)
var v, vPix; // velocidad (m / so pixel)
var a, aPix; // aceleración (m / s� o píxel)
var f, fPix; // fuerza (N o píxel)
var pixL, pixV, pixA, pixF, pixT; // factores de conversión (píxeles por unidad SI)
var pixSI; // factor de conversión (píxeles por unidad SI en general)

// Elemento del botón (del archivo HTML):
// id ..... ID en el comando HTML
// texto ... texto (opcional)

function getElement(id, text) {
    var e = document.getElementById(id); // Elemento
    if (text) e.innerHTML = text; // Establecer texto si está definido
    return e; // valor de retorno
}

// Start:

function start() {
    canvas = getElement("cv"); // área de dibujo
    width = canvas.width;
    height = canvas.height; // dimensiones (píxeles)
    ctx = canvas.getContext("2d"); // contexto gráfico
    bu1 = getElement("bu1", text01); // Botón de reinicio
    bu2 = getElement("bu2", text02[0]); // botón de inicio
    bu2.state = 0; // estado inicial (antes de que comience la animación)
    cbSlow = getElement("cbSlow"); //  botón de radio (cámara lenta)
    cbSlow.checked = false; // Cámara lenta inicialmente apagada
    getElement("lbSlow", text03); // Texto explicativo (cámara lenta)
    getElement("ipRa", text04); // Texto explicativo (radio)
    ipR = getElement("ipRb"); // campo de entrada (radio)
    getElement("ipRc", meter); // unidad (radio)
    getElement("ipTa", text05); // Texto explicativo (período de circulación)
    ipT = getElement("ipTb"); // campo de entrada (tiempo de ida y vuelta)
    getElement("ipTc", second); // unidad (período orbital)
    getElement("ipMa", text06); // Texto explicativo (masivo)
    ipM = getElement("ipMb"); // campo de entrada (masa)
    getElement("ipMc", kilogram); // unidad de masa)
    rb1 = getElement("rb1"); // botón de radio (posición)
    getElement("lb1", text07); // Texto explicativo (posición)
    rb1.checked = true; // Selecciona el botón de radio
    rb2 = getElement("rb2"); //  botón de radio (velocidad)
    getElement("lb2", text08); // Texto explicativo (velocidad)
    rb3 = getElement("rb3"); // botón de radio (aceleración)
    getElement("lb3", text09); // Texto explicativo (aceleración)
    rb4 = getElement("rb4"); // botón de radio (fuerza)
    getElement("lb4", text10); // botón de radio (fuerza)
    getElement("author", author); // Autor
    getElement("translator", translator); // traductor

    r = 2;
    tPer = 5;
    m = 1; // Valores iniciales (radio, período orbital, masa)                 
    nrSize = 0; //  posición seleccionada
    t = tU = 0; // variable (s) de tiempo
    updateInput(); // Actualizar campos de entrada
    calculation(); //cálculos (efecto secundario)
    paint(); // Dibujar
    slow = false; // Cámara lenta inicialmente apagada
    bu1.onclick = reactionReset; // reacción al botón de reinicio
    bu2.onclick = reactionStart; // reacción al botón de inicio
    cbSlow.onclick = reactionSlow; // Botón de opción de reacción a cámara lenta
    ipR.onkeydown = reactionEnter; // // reacción para ingresar clave (ingresar radio)
    ipT.onkeydown = reactionEnter; // Tecla Reacción al ingreso (ingreso del período orbital)
    ipM.onkeydown = reactionEnter; // reacción a la tecla enter (masa de entrada)
    rb1.onclick = reactionRadioButton; // respuesta al botón de radio (posición)
    rb2.onclick = reactionRadioButton; // respuesta al botón de radio (velocidad)
    rb3.onclick = reactionRadioButton; // respuesta al botón de radio (aceleración)
    rb4.onclick = reactionRadioButton; // respuesta al botón de radio (forzar)

} // fin del inicio del método

// Determinar el estado del botón Inicio / Pausa / Continuar:

function setButton2State(st) {
    bu2.state = st; // guardar Estado
    bu2.innerHTML = text02[st]; // Actualizar texto
}

// Alterna el botón de inicio / pausa / siguiente:
function switchButton2() {
    var st = bu2.state; // Estado actual
    if (st == 0) st = 1; // Si el estado inicial, comienza
    else st = 3 - st; // Cambiar entre animación e interrupción
    setButton2State(st); // Guardar nuevo estado, cambiar texto
}

// Activación o desactivación de los campos de entrada:
// p ... indicador de posible entrada

function enableInput(p) {    
    ipR.readOnly = !p; // Campo de entrada para radio
    ipT.readOnly = !p; // campo de entrada para la duración del viaje de ida y vuelta
    ipM.readOnly = !p; // Campo de entrada para masa
}


// reacción al botón de reinicio:
// efecto secundario bu2, t, tU, on, timer, r, tPer, m, pixL, rPix, omega, v, pixV, vPix, a, pixA, aPix, f, pixF, fPix, pixT, t0

function reactionReset() {    
    setButton2State(0); // Estado del botón de inicio / pausa / continuar
    enableInput(true); // Activar campos de entrada
    stopAnimation(); // apaga la animación
    t = tU = 0; // restablecer variables de tiempo
    reaction(); // Aceptar valores ingresados ​​y calcular
    paint(); // Dibuja de nuevo
}

// Reacción al botón Inicio / Pausa / Continuar:
// efecto secundario bu2, t, tU, on, timer, t0, r, tPer, m, pixL, rPix, omega, v, pixV, vPix, a, pixA, aPix, f, pixF, fPix, pixT

function reactionStart() {
    switchButton2(); // Cambiar el estado del botón de cambio
        
    enableInput(false); // Desactivar campos de entrada
        
    if (bu2.state == 1) startAnimation(); // Inicia o continúa la
    else stopAnimation(); // ... o para
    reaction(); //Aceptar valores ingresados ​​y calcular
}

// Respuesta al botón de opción de cámara lenta:
// efecto secundario lento

function reactionSlow() {
    slow = cbSlow.checked; //  establecer bandera
}

// Rutina auxiliar: aceptar entrada y calcular
// efecto secundario r, tPer, m, pixL, rPix, omega, v, pixV, vPix, a, pixA, aPix, f, pixF, fPix, pixT

function reaction() {
    input(); // Aceptar valores ingresados ​​(posiblemente corregidos)
    calculation(); // cálculos
}

// Respuesta a presionar tecla (solo ingresar tecla):
// Efectos secundarios pixL, rPix, omega, v, pixV, vPix, a, pixA, aPix, f, pixF, fPix, pixT, t, t0, tU, phi, sinPhi, cosPhi, xPix, yPix

function reactionEnter(e) {
    if (e.key && String(e.key) == "Enter" /* Si la tecla Enter (Firefox / Internet Explorer) ...*/ || e.keyCode == 13) /*Si la tecla Enter (Chrome*/
        reaction(); // ... acepta y calcula datos                         
    paint(); // Dibuja de nuevo
}

// Respuesta al botón de radio:
// efecto secundario nrSize

function reactionRadioButton() {
    if (rb1.checked) nrSize = 0; // cualquier posición ..
    else if (rb2.checked) nrSize = 1; // ... o velocidad ...
    else if (rb3.checked) nrSize = 2; // ... o aceleración ...
    else nrSize = 3; // ... o selecciona potencia
    if (!on) paint(); // Si la animación no funciona, vuelva a dibujar
}
// iniciar o continuar la animación:
// efecto secundario activado, temporizador, t0

function startAnimation() {
    on = true; // animación en
    timer = setInterval(paint, 40); //  Activar temporizador con intervalo 0.040 s
    t0 = new Date(); //  Nueva hora de inicio
}

// detener la animación:
// efecto secundario activado, temporizador

function stopAnimation() {
    on = false; // animación desactivada
    clearInterval(timer); // desactivar temporizador
}

// Factor de conversión (píxel / unidad):
// maxReal .... valor máximo (unidad)
// maxPixel ... Longitud máxima de ruta (píxeles, idealmente divisible por 100)
// Valor de retorno: 5 veces, 2 veces o 1 veces la potencia de diez veces la longitud máxima de la ruta

function pix(maxReal, maxPixel) {
    var f = maxPixel; // valor inicial
    if (maxReal < 1) { // // Si el valor máximo es menor que 1 ...                               
        var n = Math.ceil(-Math.log(maxReal) / Math.LN10); // exponente de decenas de 1 / maxReal (redondeado hacia arriba)
        for (var i = 0; i < n; i++) f *= 10; // Multiplicación por la potencia correspondiente de diez
    }
    var q = maxPixel / maxReal;
    while (true) { // bucle infinito
        f /= 2;
        if (f <= q) break; // 5 veces el poder o potencia de diez
        f /= 2.5;
        if (f <= q) break; // 2 veces el poder de diez
        f /= 2;
        if (f <= q) break; // 1 potencia de diez
    }
    return f;
}

// Subdivisión del eje vertical (exponente de decenas):
// pix ... factor de conversión (píxeles por unidad, ¡no debe ser igual a 0!)

function exponent10(pix) {
    var q = 50 / pix;
    var log = Math.log(q) / Math.LN10; // log de diez de q
    return Math.round(log);
}

// Subdivisión del eje vertical (sección):
// pix ... factor de conversión (píxeles por unidad, ¡no debe ser igual a 0!)

function segment(pix) {
    var n = exponent10(pix);
    var dy = Math.pow(10, n);
    return dy * pix;
}


// rutina auxiliar: cadena de caracteres para la longitud de comparación (m)

function stringBaseLine() {
    var n = exponent10(pixL);
    var l = Math.pow(10, n);
    n = -n;
    if (n < 0) n = 0;
    var s = l.toFixed(n).replace(".", decimalSeparator);
    return s + " " + meterUnicode;
}

// cadena de caracteres para el etiquetado (eje vertical o longitud de comparación / flecha de comparación)
     // n ... número de secciones
     // e ... bandera para la unidad
     // h ... bandera para dividir a la mitad las secciones

function stringTick(n, e, h) {
    var digits = exponent10(pixSI);
    var wert = n * Math.pow(10, digits);
    digits = Math.max(-digits, 0);
    if (h) digits++;
    var s = ToString(wert, digits, true); // cadena para valor numérico
    if (!e || nrSize == 0) return s; // No agregue una unidad ...
    else if (nrSize == 1) return s + " " + meterPerSecond; // ... o agregue unidades m / s ...
    else if (nrSize == 2) return s + " " + meterPerSecond2; // ... o agregue unidades m / sal cuadrado
    else return s + " " + newton; // ... o agregue la unidad N.
}

  // cálculos:
     // Efectos secundarios pixL, rPix, omega, v, pixV, vPix, a, pixA, aPix, f, pixF, fPix, pixT
function calculation() {
    pixL = pix(r, 100); // Factor de conversión de longitud (píxeles por m)
    rPix = r * pixL; // radio (píxel)
    omega = 2 * Math.PI / tPer; // velocidad angular (1 / s)
    v = r * omega; // velocidad (m / s)
    pixV = pix(v, 100); // Factor de conversión de velocidad (píxeles por m / s)
    vPix = v * pixV; // velocidad (píxeles)
    a = v * omega; // aceleración centrípeta (m / s�)
    pixA = pix(a, 100); // Factor de conversión de aceleración (píxeles por m / s�)
    aPix = a * pixA; // aceleración centrípeta (píxel)
    f = m * a; // fuerza centrípeta (N)
    pixF = pix(f, 100); // Factor de conversión de fuerza (píxeles por N)
    fPix = f * pixF; // fuerza centrípeta (píxel)
    pixT = 20; // Factor de conversión de tiempo (píxeles por s)
}

// Convierte un número en una cadena:
     // n ..... Número dado
     // d ..... número de dígitos
     // arreglo ... marca para decimales (en contraste con dígitos válidos)

function ToString(n, d, fix) {
    var s = (fix ? n.toFixed(d) : n.toPrecision(d)); // Cadena con punto decimal
    return s.replace(".", decimalSeparator); // Posiblemente reemplace punto con coma
}

     // Ingrese un numero
     // ef .... campo de entrada
     // d ..... número de dígitos
     // arreglo ... marca para decimales (en contraste con dígitos válidos)
     // min ... mínimo del rango permitido
     // max ... máximo del rango permitido
     // Valor de retorno: número o NaN

function inputNumber(ef, d, fix, min, max) {
    var s = ef.value; // cadena en el campo de entrada
    s = s.replace(",", "."); // Posiblemente convierta una coma en un punto
    var n = Number(s); // Convertir a número si es posible
    if (isNaN(n)) n = 0; // interpreta entradas sin sentido como 0
    if (n < min) n = min; // Si el número es demasiado pequeño, corríjalo
    if (n > max) n = max; // Si el número es demasiado grande, corríjalo
    ef.value = ToString(n, d, fix); // campo de entrada correcto si es necesario
    return n; // valor de retorno
}

// Todas las entradas:
     // efecto secundario r, tPer, m

function input() {
    r = inputNumber(ipR, 3, true, 0.1, 10); // radio (m)
    tPer = inputNumber(ipT, 3, true, 1, 10); // // período (s) 
    m = inputNumber(ipM, 3, true, 0.1, 10); // masa (kg)
}

// Actualiza los campos de entrada:

function updateInput() {
    ipR.value = ToString(r, 3, true); // campo de entrada para radio (m)
    ipT.value = ToString(tPer, 3, true); // campo de entrada para duración (s) de ida y vuelta
    ipM.value = ToString(m, 3, true); // campo de entrada para masa (kg)
}

     // ------------------------------------------------ -------------------------------------------------

     // Nueva ruta gráfica con valores predeterminados:

function newPath() {
    ctx.beginPath(); // Nueva ruta de gráficos
    ctx.strokeStyle = "#000000"; //Color de línea negro
    ctx.lineWidth = 1; // Grosor de línea 1
}

     // disco circular con borde negro:
     // (x, y) ... coordenadas centrales (píxeles)
     // r ....... radio (píxeles)
     // c ....... color de relleno (opcional)

function circle(x, y, r, c) {
    if (c) ctx.fillStyle = c; // color de relleno
    newPath(); // Nuevo camino
    ctx.arc(x, y, r, 0, 2 * Math.PI, true); // Preparar círculo
    if (c) ctx.fill(); // Complete el círculo si lo desea
    ctx.stroke(); // dibujar borde
}

/// Dibujar linea:
     // x1, y1 ... punto de partida
     // x2, y2 ... punto final
     // c ........ color (opcional, valor predeterminado negro)
     // w ........ grosor de línea (opcional, valor predeterminado 1)

function line(x1, y1, x2, y2, c, w) {
    newPath(); // Nueva ruta de gráficos (valores predeterminados)
    if (c) ctx.strokeStyle = c; // Establecer color de línea
    if (w) ctx.lineWidth = w; // Establecer grosor de línea
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2); // Prepara la línea
    ctx.stroke(); // Dibujar linea
}

// dibujar flecha:
     // x1, y1 ... punto de partida
     // x2, y2 ... punto final
     // w ........ grosor de línea (opcional)
     // Nota: el color está determinado por ctx.strokeStyle.

function arrow(x1, y1, x2, y2, w) {
    if (!w) w = 1; // Si el grosor de la línea no está definido, valor predeterminado                         
    var dx = x2 - x1,
        dy = y2 - y1; // coordenadas vectoriales
    var length = Math.sqrt(dx * dx + dy * dy); // longitud
    if (length == 0) return; // Cancelar si la longitud 0
    dx /= length;
    dy /= length; // vector unitario
    var s = 2.5 * w + 7.5; // longitud de punta de flecha
    var xSp = x2 - s * dx,
        ySp = y2 - s * dy; // Punto de ayuda para punta de flecha         
    var h = 0.5 * w + 3.5; // La mitad del ancho de la punta de flecha
    var xSp1 = xSp - h * dy,
        ySp1 = ySp + h * dx; // esquina de punta de flecha
    var xSp2 = xSp + h * dy,
        ySp2 = ySp - h * dx; // esquina de punta de flecha
    xSp = x2 - 0.6 * s * dx;
    ySp = y2 - 0.6 * s * dy; // Entrando en la esquina de la punta de flecha
    ctx.beginPath(); // Nuevo camino
    ctx.lineWidth = w; // grosor de la línea
    ctx.moveTo(x1, y1); // punto de partida
    if (length < 5) ctx.lineTo(x2, y2); // Si hay una flecha corta, continúa hasta el punto final, ...
    else ctx.lineTo(xSp, ySp); // ... de lo contrario continuar a la esquina
    ctx.stroke(); // Dibujar linea
    if (length < 5) return; // Si hay una flecha corta, no hay punta
    ctx.beginPath(); // Nueva ruta para punta de flecha
    ctx.fillStyle = ctx.strokeStyle; // Color de relleno como color de línea
    ctx.moveTo(xSp, ySp); // punto de partida (esquina de entrada)
    ctx.lineTo(xSp1, ySp1); // Continuar al punto en una página
    ctx.lineTo(x2, y2); // Continuar a la cima
    ctx.lineTo(xSp2, ySp2); // Continúa hasta el punto del otro lado
    ctx.closePath(); // Volver al punto de partida
    ctx.fill(); // dibujar punta de flecha
}

// rutina auxiliar: flecha de comparación (unidad SI)

function arrowComparison(c) {
    var s = stringTick(1, true, false); // // cadena (potencia de diez con unidad)
    var a = segment(pixSI); // longitud de la flecha (píxel)
    ctx.strokeStyle = c; // Aplicar color
    arrow(MX, 350, MX + a, 350, 3); // dibujar flecha
    alignText(s, 1, MX + a / 2, 340); // Inscripción sobre la flecha (centrada)    
}

// Rutina de ayuda: flecha (lejos del cuerpo), líneas de ayuda
     // c ....... color
     // (x, y) ... coordenadas de la punta de flecha

function arrows(c, x, y) {
    newPath(); // Nueva ruta de gráficos (valores 
    line(x, y, x, yPix); // línea auxiliar vertical     
    line(x, y, xPix, y); // línea auxiliar horizontal
    ctx.strokeStyle = c; // Aplicar color
    arrow(xPix, yPix, x, y, 3); // Flecha grande (lejos del cuerpo)
    arrow(xPix, yPix, x, yPix, 1); // Flecha delgada para componente horizontal
    arrow(xPix, yPix, xPix, y, 1); // Flecha delgada para componente vertical
}

    // Alinear texto (juego de caracteres FONT1):
     // s ....... cadena
     // t ....... Tipo (0 para justificado a la izquierda, 1 para centrado, 2 para justificado a la derecha)
     // (x, y) ... posición (píxel)

function alignText(s, t, x, y) {
    ctx.font = FONT1; // conjunto de caracteres
    if (t == 0) ctx.textAlign = "left"; // Alineado a la izquierda dependiendo del valor de t ...
    else if (t == 1) ctx.textAlign = "center"; // ... o centrado ...
    else ctx.textAlign = "right"; // ... o derecha
    ctx.fillText(s, x, y); // texto de salida
}

// Texto centrado con índice:
     // s1 ...... texto normal
     // s2 ...... índice
     // (x, y) ... posición

function centerTextIndex(s1, s2, x, y) {
    var w1 = ctx.measureText(s1).width; // ancho de s1 (píxeles)
    var w2 = ctx.measureText(s2).width; // ancho de s2 (píxeles)
    var x0 = x - (w1 + w2) / 2; // x coordenada para comenzar
    alignText(s1, 0, x0, y); // texto normal
    alignText(s2, 0, x0 + w1 + 1, y + 5); // índice
}

// Salida centrada de dos textos con índices:
     // s1 ...... Primer texto normal
     // s2 ...... Primer índice
     // s3 ...... Segundo texto normal
     // s4 ...... Segundo índice
     // (x, y) ... posición

function center2TextIndex(s1, s2, s3, s4, x, y) {
    var w1 = ctx.measureText(s1).width; // ancho del primer texto normal (píxeles)
    var w2 = ctx.measureText(s2).width; // ancho del primer índice (píxel)             
    var w3 = ctx.measureText(s3).width; // ancho del segundo texto normal (píxeles)
    var w4 = ctx.measureText(s4).width; // x coordenada para comenzar
    var x0 = x - (w1 + w2 + w3 + w4) / 2; // x-Koordinate f�r Beginn 
    alignText(s1, 0, x0, y); // Primer texto normal
    alignText(s2, 0, x0 + w1 + 1, y + 5); // Primer índice
    alignText(s3, 0, x0 + w1 + w2, y); // Segundo texto normal
    alignText(s4, 0, x0 + w1 + w2 + w3 + 1, y + 5); // Segundo índice
}

// Salida de un valor numérico:
     // s1 ...... Nombre del tamaño
     // s2 ...... Índice de la designación
     // w ....... valor numérico
     // u ....... unidad
     // n ....... Número de dígitos válidos
     // (x, y) ... posición

function writeValue(s1, s2, w, u, n, x, y) {
    var w1 = ctx.measureText(s1).width; // ancho de la etiqueta de tamaño (píxel)
    var w2 = ctx.measureText(s2).width; // ancho del índice (píxeles)
    alignText(s1, 0, x, y); // Nombre del tamaño
    alignText(s2, 0, x + w1, y + 5); // índice
    var s = " = " + w.toPrecision(n) + " " + u; // cadena (signo igual, valor numérico y unidad)
    s = s.replace(".", decimalSeparator); // Posiblemente reemplace punto con coma
    alignText(s, 0, x + w1 + w2, y); // Edición restante
}

// rutina auxiliar: salida de cantidad y componentes
     // t ...... nombre del tamaño
     // s ...... símbolo de tamaño
     // u ...... unidad
     // b ...... cantidad
     // x, y .... componentes
     // posY ... distancia desde el borde superior (píxeles)

function writeValuesXY(t, s, u, b, x, y, posY) {
    var posX1 = DX + 20; // x coordenada para números
    var posX2 = DX + 150; // coordenada x para explicaciones
    alignText(t, 0, DX, posY); // Muestra el nombre del tamaño
    posY += 20; // a la siguiente línea
    writeValue(s, "", b, u, 3, posX1, posY); // Cantidad de gasto
    alignText(text23, 0, posX2, posY); // Explicación (cantidad)
    posY += 20; // a la siguiente línea
    writeValue(s, symbolX, x, u, 3, posX1, posY); // salida x componente
    alignText(text21, 0, posX2, posY); // Explicación (en dirección x)
    posY += 20; // a la siguiente línea
    writeValue(s, symbolY, y, u, 3, posX1, posY); // salida y componente
    alignText(text22, 0, posX2, posY); // Explicación (en dirección y)
}

// Eje horizontal con marcas y etiquetado para diagrama:
     // (x, y) ... origen

function horizontalAxis(x, y) {
    newPath(); // Nueva ruta de gráficos
    arrow(x - 20, y, x + 240, y); // Dibuja el eje horizontal
    var t0 = Math.ceil(tU); // hora del primer tick (s)
    var x0 = x + pixT * (t0 - tU); // posición del primer tic          
    for (var i = 0; i <= 10; i++) { // para todos los ticks ...               
        var xT = x0 + i * pixT; // Coordenada horizontal de la marca
        line(xT, y - 3, xT, y + 3); // dibujar tick
        if (xT >= x + 5 && xT <= x + 215 // Si la marca no está demasiado a la izquierda o a la derecha ...
            &&
            (t0 + i <= 100 || (t0 + i) % 2 == 0)) // ... y espacio para etiquetado disponible ...
            alignText("" + (t0 + i), 1, xT, y + 13); // ... hacer etiquetado
    }
    alignText(symbolTime, 1, DX + 230, DY + 18); // inscripción (t)
    alignText(text16, 1, DX + 230, DY + 30); // especificación de la (s) unidad (es)
}

// Eje vertical con marcas y etiqueta para diagrama:
     // (x, y) ..... origen (píxel)
     // yMin ...... extremo inferior del eje (píxel)
     // yMax ...... extremo superior del eje (píxeles)

function verticalAxis(x, y, yMin, yMax) {
    arrow(x, yMin, x, yMax); // Dibuja el eje vertical
    var dyPix = segment(pixSI); // distancia entre dos garrapatas (provisional)
    var bigDist = false; // bandera de larga distancia
    if (dyPix > 50) { // Si la distancia es demasiado grande ...
        dyPix /= 2; // ... reducir a la mitad la distancia
        bigDist = true; // ... cambiar bandera
    }
    var i0 = Math.floor((y - yMax) / dyPix - 0.5); // Cantidad máxima para ejecutar el índice
    for (var i = -i0; i <= i0; i++) { // para todos los ticks ...
        var yT = y - i * dyPix; // Coordenada vertical de la marca
        if (yT > yMin - 10) continue; // Si la marca es demasiado baja, continúe con la siguiente marca
        if (yT < yMax + 10) break; //Si la marca es demasiado alta, cancele
        if (yT == y) continue; // Si marca en el eje t, continúe con el siguiente    
        line(x - 3, yT, x + 3, yT); // dibujar tick
        var ii = (bigDist ? i / 2.0 : i); // Reducir a la mitad el índice si es necesario
        alignText(stringTick(ii, false, bigDist), 2, x - 5, yT + 5); // Hacer etiquetado
    }
}



// curva sinusoidal (aproximación por polígono):
// (x, y) ... punto cero (píxel)
// por ..... punto (píxel)
// ampl .... amplitud (píxel)
// xMin .... Valor x mínimo (píxel)
// xMax .... valor x máximo (píxel)

function sinus(x, y, per, ampl, xMin, xMax) {
    var omega = 2 * Math.PI / per; // tamaño auxiliar
    var xx = xMin; // coordenada x del punto de partida
    var yy = y - ampl * Math.sin(omega * (xx - x)); // coordenada y del punto de partida
    newPath(); // Nueva ruta de gráficos (valores predeterminados)
    ctx.moveTo(xx, yy); // Punto de inicio de la polilínea
    while (xx < xMax) { // siempre que no se alcance el margen derecho ...
        xx++;
        yy = y - ampl * Math.sin(omega * (xx - x)); // coordenadas del siguiente punto
        ctx.lineTo(xx, yy); // Añadir ruta a la ruta gráfica
    }
    ctx.stroke(); // dibujar curva
}

// diagrama con dos curvas:
     // type1, type2 ... seno (0), coseno (1), seno (2), coseno (3)
     // (x, y) ........ origen (píxeles)
     // yMax ......... Amplitud (unidad SI)

function diagram(typ1, typ2, x, y, yMax) {
    horizontalAxis(x, y); // Eje horizontal (eje de tiempo)
    verticalAxis(x, y, y + 130, y - 140); // Eje vertical
    var per = tPer * pixT; // punto (píxeles)
    var ampl = yMax * pixSI; // amplitud (píxel)
    sinus(x - (typ1 * tPer / 4 + tU) * pixT, y, per, ampl, x, x + 200); //Primera curva sinusoidal
    sinus(x - (typ2 * tPer / 4 + tU) * pixT, y, per, ampl, x, x + 200); // segunda curva sinusoidal
}

   // Marca el valor actual con un círculo:
     // v ....... valor
     // (x, y) ... posición de origen
     // c ....... color

function markMomWert(v, x, y, c) {
    x += (t - tU) * pixT;
    y -= v * pixSI; // coordenadas
    circle(x, y, 2.5, c); // dibuja un circulo
}

// salida gráfica para la posición:

function drawPosition() {
    pixSI = pixL; // factor de conversión (píxeles por m)
    diagram(1, 0, DX, DY, r); // diagrama (x e y en función de t)
    alignText(symbolsXY, 1, DX + 20, DY - 125); // Etiquetado del eje vertical (x, y)
    alignText(text17, 1, DX + 20, DY - 110); // especificación de la unidad (m)
    ctx.fillStyle = colorPosition; // color para la posición
    alignText(text11, 0, DX, 350); // Encabezado: posición
    var x = r * cosPhi,
        y = r * sinPhi; // coordenadas (m)
    writeValue(symbolX, "", x, meterUnicode, 3, DX + 20, 370); // Salida de la coordenada x
    alignText(text21, 0, DX + 150, 370); // Explicación (dirección x)
    writeValue(symbolY, "", y, meterUnicode, 3, DX + 20, 390); // Salida de la coordenada y
    alignText(text22, 0, DX + 150, 390); // Explicación (dirección y)
    line(xPix, yPix, xPix, MY); // línea auxiliar vertical
    line(xPix, yPix, MX, yPix); // línea auxiliar horizontal
    ctx.strokeStyle = colorPosition; // color para la posición
    arrow(MX, MY, xPix, yPix, 3); // flecha gruesa (radio vector)
    arrow(MX, MY, xPix, MY, 1); // Flecha delgada (componente x)
    arrow(MX, MY, MX, yPix, 1); // flecha delgada (componente y)
    markMomWert(x, DX, DY, colorPosition); // Valor x actual en el diagrama
    markMomWert(y, DX, DY, colorPosition); // Valor y actual en el diagrama
}

// Rutina auxiliar para velocidad, aceleración y fuerza:
     // Flechas con líneas auxiliares, marcas en el diagrama, flecha de comparación
     // (xA, yA) ... posición de la punta de flecha
     // compX ..... x componente
     // compY ..... y componente
     // c ......... color

function drawVAF(xA, yA, compX, compY, c) {
    arrows(c, xA, yA); // flechas con guías
    markMomWert(compX, DX, DY, c); // Valor actual del componente x en el diagrama
    markMomWert(compY, DX, DY, c); // Valor actual del componente y en el diagrama
    arrowComparison(c); // flecha de comparación
}

// Salida gráfica de velocidad:

function drawVelocity() {
    pixSI = pixV; // factor de conversión (píxeles por m / s)
    diagram(2, 1, DX, DY, v); // diagrama (v_x y v_y en función de t)
    var sv = symbolVelocity; // Abreviatura de velocidad
    center2TextIndex(sv, symbolX, " , " + sv, symbolY, // etiquetado del eje vertical (v_x, v_y)
        DX + 30, DY - 120);
    alignText(text18, 1, DX + 30, DY - 100); // especificación de la unidad (m / s)
    ctx.fillStyle = colorVelocity; // Color para velocidad
    alignText(text13, 0, DX, 310); // rumbo (velocidad angular)
    writeValue(symbolAngVel, "", omega, radPerSecond, 3, DX + 20, 330); // Salida de la velocidad angular
    var vx = -v * sinPhi,
        vy = v * cosPhi; // componentes de velocidad
    writeValuesXY(text12, sv, meterPerSecond, v, vx, vy, 360); // Salida de los componentes de velocidad
    var xA = xPix - vPix * sinPhi,
        yA = yPix - vPix * cosPhi; // Coordenadas de la punta de flecha
    drawVAF(xA, yA, vx, vy, colorVelocity); // flechas y marcas    
}

// Salida gráfica para la aceleración (centrípeta):

function drawAcceleration() {
    pixSI = pixA; // factor de conversión (píxeles por m / s�)
    diagram(3, 2, DX, DY, a); // diagrama (a_x y a_y en función de t)
    var sa = symbolAcceleration; // Abreviatura de aceleración
    center2TextIndex(sa, symbolX, " , " + sa, symbolY, // etiquetado del eje vertical (a_x, a_y)
        DX + 30, DY - 120);
    alignText(text19, 1, DX + 30, DY - 100); // especificación de la unidad (m / s�)
    ctx.fillStyle = colorAcceleration; // Color para aceleración     
    var ax = -a * cosPhi,
        ay = -a * sinPhi; // componentes de aceleración
    writeValuesXY(text14, sa, meterPerSecond2, a, ax, ay, 340); // Salida de los componentes de aceleración
    var xA = xPix - aPix * cosPhi,
        yA = yPix + aPix * sinPhi; // Coordenadas de la punta de flecha
    drawVAF(xA, yA, ax, ay, colorAcceleration); // flechas y marcas
}

// Salida gráfica sobre la fuerza (centrípeta):

function drawForce() {
    pixSI = pixF; // factor de conversión (píxeles por N)
    diagram(3, 2, DX, DY, f); // diagrama (F_x y F_y en función de t)
    var sf = symbolForce; // Abreviatura de fuerza
    center2TextIndex(sf, symbolX, " , " + sf, symbolY, // etiquetado del eje vertical (F_x, F_y)    
        DX + 25, DY - 120);
    alignText(text20, 1, DX + 25, DY - 100); // especificación de la unidad (N)
    ctx.fillStyle = colorForce; // Color para la fuerza     
    var fx = -f * cosPhi,
        fy = -f * sinPhi; // Componentes de potencia
    writeValuesXY(text15, sf, newton, f, fx, fy, 340); // Salida de los componentes de potencia.
    var xA = xPix - fPix * cosPhi,
        yA = yPix + fPix * sinPhi; // Coordenadas de la punta de flecha
    drawVAF(xA, yA, fx, fy, colorForce); // flechas y marcas
}

// salida gráfica:
     // efecto secundario t, t0, tU, phi, sinPhi, cosPhi, xPix, yPix

function paint() {
    ctx.fillStyle = colorBackground; // color de fondo
    ctx.fillRect(0, 0, width, height); // completa el fondo
    if (on) { // si la animación está activada ...
        var t1 = new Date(); // ... Tiempo actual
        var dt = (t1 - t0) / 1000; // ... duración del intervalo de tiempo 
        if (slow) dt /= 10; // ... Si es en cámara lenta, divida el intervalo de tiempo entre 10
        t += dt; // ... actualizar la variable de tiempo
        t0 = t1; // ... Nueva hora de inicio
        tU = (t < 5 ? 0 : t - 5); // Hora para el origen de un diagrama
    }
    ctx.font = FONT1; // conjunto de caracteres
    ctx.fillStyle = ctx.strokeStyle = "#000000"; // Color de relleno negro
    alignText(symbolX, 1, MX + 115, MY + 15); // etiqueta eje x
    alignText(symbolY, 2, MX - 10, MY - 110); // Etiqueta del eje y
    arrow(MX - 120, MY, MX + 120, MY); // eje X
    arrow(MX, MY + 120, MX, MY - 120); // eje y
    circle(MX, MY, rPix); // camino circular
    phi = t * omega; // ángulo de fase (radianes)
    sinPhi = Math.sin(phi);
    cosPhi = Math.cos(phi); // valores trigonométricos
    xPix = MX + rPix * cosPhi;
    yPix = MY - rPix * sinPhi; // coordenadas (píxeles)                                 
    circle(xPix, yPix, 5, colorBody); // cuerpo
    var a = segment(pixL); // longitud de comparación
    line(MX, 380, MX + a, 380); // Linea horizontal
    line(MX, 377, MX, 383); // extremo izquierdo de la línea
    line(MX + a, 377, MX + a, 383); // extremo derecho de la línea
    var s = stringBaseLine(); // Cadena para longitud de comparación
    ctx.fillStyle = "#000000"; // Color de fuente negro
    alignText(s, 1, MX + a / 2, 375); // Etiquetado para longitud de comparación
    switch (nrSize) { // dependiendo del tamaño seleccionado ...
        case 0:
            drawPosition();
            break; // ... salida gráfica para el puesto
        case 1:
            drawVelocity();
            break; // ... salida gráfica para velocidad
        case 2:
            drawAcceleration();
            break; // ... salida de gráficos para aceleración
        case 3:
            drawForce();
            break; // ... salida gráfica a la fuerza
    }
}

document.addEventListener("DOMContentLoaded", start, false); // Llame al método de inicio después de cargar la pagina
{}