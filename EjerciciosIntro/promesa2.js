let products = [
  {
    nombre: "PC-Gaming",
    marca: "Asus",
    precio: 1200,
  },
  {
    nombre: "Tablet",
    marca: "Samsung",
    precio: 300,
  },
  {
    nombre: "Cámara-Reflex",
    marca: "Canon",
    precio: 650,
  },
];

function getProducts() {
    return new Promise((resolve) => {
        setTimeout(() => {
            resolve(products);
        }, 3000);
    });
}

getProducts().then(data => {
    console.log(data);
});

async function getMyProducts(){
    let misProductos = await getProducts();
    console.log(misProductos);
}

getMyProducts();