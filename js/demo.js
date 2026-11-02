// ===== HOJA DE INVENTARIO ANIMADA (portada) =====
// Simula ventas de café: el stock baja de 18 a 4 y salta la alerta de stock bajo.
const STOCK_INICIAL = 18;
const STOCK_FINAL = 4;
const STOCK_MINIMO = 6;

const textoStock = document.getElementById("stock-cafe");
const barra = document.getElementById("barra-cafe");
const fila = document.getElementById("fila-alerta");
const aviso = document.getElementById("aviso-cafe");

function pintarStock(cantidad) {
    textoStock.textContent = cantidad;
    barra.style.setProperty("--nivel", cantidad / 30);
    if (cantidad < STOCK_MINIMO) {
        fila.classList.add("bajo");
        aviso.classList.add("visible");
    }
}

// Si la persona prefiere menos movimiento, se muestra el estado final directamente
const sinMovimiento = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

if (sinMovimiento) {
    pintarStock(STOCK_FINAL);
} else {
    let cantidad = STOCK_INICIAL;
    setTimeout(function venderUno() {
        cantidad--;
        pintarStock(cantidad);
        if (cantidad > STOCK_FINAL) {
            setTimeout(venderUno, 160);
        }
    }, 1200);
}
