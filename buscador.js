// ============================================
// BUSCADOR DEL DICCIONARIO
// Funciona en todas las páginas (a.html ... z.html)
// 1) Si la palabra no está en la página actual, redirige a la página
//    de la letra correspondiente y busca automáticamente al llegar.
// 2) Una vez en la página correcta, filtra/resalta las filas de la
//    tabla que coincidan con la palabra buscada.
// ============================================

document.addEventListener('DOMContentLoaded', function () {

    const input = document.querySelector('.buscador input');
    const boton = document.querySelector('.buscador button');
    const filas = document.querySelectorAll('.table tbody tr');

    if (!input || !boton) return; // por seguridad, si no existe el buscador en la página

    // Si llegamos a la página por una redirección de búsqueda,
    // recuperamos el término guardado y lo aplicamos automáticamente.
    const terminoGuardado = sessionStorage.getItem('busquedaDiccionario');
    if (terminoGuardado) {
        input.value = terminoGuardado;
        sessionStorage.removeItem('busquedaDiccionario');
        filtrarTabla(terminoGuardado);
    }

    boton.addEventListener('click', function (e) {
        e.preventDefault();
        buscar();
    });

    input.addEventListener('keydown', function (e) {
        if (e.key === 'Enter') {
            e.preventDefault();
            buscar();
        }
    });

    function buscar() {
        const termino = input.value.trim();
        if (termino === '') {
            // si está vacío, mostramos todas las filas de nuevo
            mostrarTodasLasFilas();
            return;
        }

        // ¿La palabra existe en la tabla de ESTA página?
        const hayCoincidenciaLocal = filtrarTabla(termino);

        if (!hayCoincidenciaLocal) {
            // No está en esta página: averiguamos a qué letra pertenece
            const primeraLetra = obtenerLetraDeArchivo(termino);

            if (primeraLetra) {
                // Guardamos el término para usarlo en la página destino
                sessionStorage.setItem('busquedaDiccionario', termino);
                window.location.href = primeraLetra + '.html';
            } else {
                alert('No se encontró la palabra "' + termino + '" en el diccionario.');
            }
        }
    }

    // Filtra/resalta las filas de la tabla actual según el término.
    // Devuelve true si encontró al menos una coincidencia.
    function filtrarTabla(termino) {
        const terminoNormalizado = normalizar(termino);
        let encontrada = false;

        filas.forEach(function (fila) {
            const celdaPalabra = fila.querySelector('td:nth-child(2)'); // columna "Palabra"
            if (!celdaPalabra) return;

            const palabra = normalizar(celdaPalabra.textContent);

            if (palabra.includes(terminoNormalizado)) {
                fila.style.display = '';
                fila.classList.add('fila-resaltada');
                encontrada = true;
            } else {
                fila.style.display = 'none';
                fila.classList.remove('fila-resaltada');
            }
        });

        return encontrada;
    }

    function mostrarTodasLasFilas() {
        filas.forEach(function (fila) {
            fila.style.display = '';
            fila.classList.remove('fila-resaltada');
        });
    }

    // Quita acentos y pasa a minúsculas para comparar mejor
    function normalizar(texto) {
        return texto
            .toLowerCase()
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '')
            .trim();
    }

    // --------------------------------------------------------
    // Determina a qué archivo de letra pertenece una palabra.
    // Aquí usamos simplemente la primera letra de la palabra.
    // Si más adelante tienes un índice real palabra->letra,
    // se puede reemplazar esta función por una búsqueda en ese índice.
    // --------------------------------------------------------
    function obtenerLetraDeArchivo(termino) {
        const letrasValidas = 'abcdefghijklmnñopqrstuvwxyz';
        const primera = normalizar(termino).charAt(0);
        return letrasValidas.includes(primera) ? primera : null;
    }

});
