const datos = [3,8,12,19,25,31,40,47];
const buscando = 5;

function buscarNumero(Datos) {
    let pasos = 0;
    let ini = 0;
    let final = Datos.length - 1;

    while(ini <= final) {
        let medio = Math.floor(ini + (final - ini) / 2);
        pasos++;

        if(Datos[medio] === buscando) {
            console.log(`Encontrado en posición ${medio} (pasos: ${pasos})`);
            return medio;
        }

        if(Datos[medio] < buscando) {
            ini = medio + 1;
        } else {
            final = medio - 1;
        }
    }

    console.log("El valor no existe");
    return -1;
}

buscarNumero(datos);
