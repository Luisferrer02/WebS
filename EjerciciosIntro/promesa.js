const statusPedido = () => {
    const status = Math.random() < 0.8;
    return status;
}

/*
for {let i = 0; i < 10; i++} {
    statusPedido();
}
*/

const miPedidoDePizza = new Promise((resolve, reject) => {
    setTimeout(() => {
        if (statusPedido()) {
            resolve('Pedido listo');
        } else {
            reject('Pedido no listo');
        }
    }, 3000);
});

const manejarExito = (mensaje) => {
    console.log(mensaje);
};

const manejarError = (error) => {
    console.error(error);
};

miPedidoDePizza
    .then(manejarExito) 
    .catch(manejarError);

