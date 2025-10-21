// index/js/index.js
document.addEventListener('DOMContentLoaded', () => {
    const API_BASE_URL = ''; 
    const productsGrid = document.getElementById('productsGrid');
    const categoriesNav = document.getElementById('categoriesNav');
    const productsTitle = document.getElementById('productsTitle');
    const detalleModal = new bootstrap.Modal(document.getElementById('detalleModal'));
    const detalleTitle = document.getElementById('detalleTitle');
    const detalleImagenes = document.getElementById('detalleImagenes');
    const detalleInfo = document.getElementById('detalleInfo');
    const formCategoria = document.getElementById('formCategoria');
    const catNombre = document.getElementById('catNombre');
    const formProducto = document.getElementById('formProducto');
    const formLogin = document.getElementById('formLogin');
    const loginUser = document.getElementById('loginUser');
    const loginPass = document.getElementById('loginPass');
    const loginMsg = document.getElementById('loginMsg');
    const btnLogin = document.getElementById('btnLogin');
    const btnLogout = document.getElementById('btnLogout');

    let allProducts = [];
    let allCategories = [];

    async function apiFetch(endpoint, options = {}) {
        const token = localStorage.getItem("token");
        if (token) {
            options.headers = { ...options.headers, "Authorization": "Bearer " + token };
        }
        const url = `${API_BASE_URL}/api/${endpoint}`;
        try {
            const response = await fetch(url, options);
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || `Error en la API: ${response.statusText}`);
            }
            return await response.json();
        } catch (error) {
            console.error('Error al conectar con la API:', error);
            if (productsGrid) {
                productsGrid.innerHTML = `<div class="col-12"><div class="alert alert-danger">No se pudieron cargar los productos. Revisa la consola para más detalles.</div></div>`;
            }
            throw error;
        }
    }

    async function fetchProductos() {
        allProducts = await apiFetch('productos');
        renderProductos(allProducts);
    }

    // CAMBIO: Esta función ahora filtra localmente, en lugar de llamar a una API que no existe.
    function fetchProductosPorCategoria(idCategoria) {
        const productos = (idCategoria === 'all')
            ? allProducts
            : allProducts.filter(p => p.categoria_id == idCategoria);
        renderProductos(productos);
    }
    
    async function fetchCategorias() {
        allCategories = await apiFetch('categorias');
        renderMenuCategorias(allCategories);
    }

    async function fetchProductoDetalle(idProducto) {
        const producto = await apiFetch(`productos/${idProducto}`);
        renderProductoDetalle(producto);
    }

    function renderProductos(productos) {
        if (!productos || productos.length === 0) {
            productsGrid.innerHTML = '<p class="text-muted col-12">No hay productos para mostrar.</p>';
            return;
        }
        
        productsGrid.innerHTML = productos.map(producto => {
            // CAMBIO: Ahora busca 'firstimageurl' que coincide con el backend.
            const imagenPrincipal = producto.firstimageurl || 'https://via.placeholder.com/300x200.png?text=Sin+Imagen';
            return `
                <div class="col-md-6 col-lg-4">
                    <div class="card h-100 producto-card" data-id="${producto.id}">
                        <img src="${imagenPrincipal}" class="card-img-top" alt="${producto.nombre}">
                        <div class="card-body">
                            <h5 class="card-title">${producto.nombre}</h5>
                            <p class="card-text text-muted">${producto.categoria || "Sin categoría"}</p>
                            <h4>S/ ${Number(producto.precio).toFixed(2)}</h4>
                        </div>
                        <div class="card-footer bg-white border-top-0 pb-3">
                            <button class="btn btn-primary ver-detalle-btn">Ver detalle</button>
                        </div>
                    </div>
                </div>
            `;
        }).join('');

        document.querySelectorAll('.ver-detalle-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                const card = e.target.closest('.producto-card');
                const productoId = card.dataset.id;
                fetchProductoDetalle(productoId);
            });
        });
    }

    function renderMenuCategorias(categorias) {
        if (!categorias || categorias.length === 0) return;
        categoriesNav.innerHTML = '<a href="#" class="list-group-item list-group-item-action active" data-id="all">Todos</a>';
        categorias.forEach(categoria => {
            categoriesNav.innerHTML += `<a href="#" class="list-group-item list-group-item-action categoria-link" data-id="${categoria.id}">${categoria.nombre}</a>`;
        });
        document.querySelectorAll('.categoria-link').forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const categoriaId = e.target.dataset.id;
                const categoriaNombre = e.target.textContent;
                productsTitle.textContent = `Productos de: ${categoriaNombre}`;
                // CAMBIO: Llama a la función local de filtrado.
                fetchProductosPorCategoria(categoriaId);
            });
        });
        categoriesNav.querySelector('a[data-id="all"]').addEventListener('click', (e) => {
            e.preventDefault();
            categoriesNav.querySelector('.active').classList.remove('active');
            e.target.classList.add('active');
            productsTitle.textContent = 'Todos los productos';
            renderProductos(allProducts);
        });
    }

    function renderProductoDetalle(producto) {
        if (!producto) return;
        detalleTitle.textContent = producto.nombre;
        let imagenesHtml = '<p>Cargando imágenes...</p>';
        detalleImagenes.innerHTML = imagenesHtml;
        apiFetch(`/imagenes/${producto.id}`).then(imagenes => {
            if (imagenes.length === 0) {
                imagenesHtml = '<p>Este producto no tiene imágenes.</p>';
            } else {
                imagenesHtml = imagenes.map(img => `<div class="col-6 mb-2"><img src="${img.url}" class="img-fluid rounded"></div>`).join('');
            }
            detalleImagenes.innerHTML = imagenesHtml;
        });
        detalleInfo.innerHTML = `
            <li class="list-group-item"><b>Precio:</b> S/ ${Number(producto.precio).toFixed(2)}</li>
            <li class="list-group-item"><b>Stock:</b> ${producto.stock} unidades</li>
            <li class="list-group-item"><b>Categoría:</b> ${producto.categoria || "N/A"}</li>
            <li class="list-group-item"><b>Descripción:</b> ${producto.descripcion || "No disponible"}</li>
        `;
        detalleModal.show();
    }

    if (formLogin) {
        formLogin.addEventListener('submit', async (e) => {
            e.preventDefault();
            loginMsg.textContent = '';
            try {
                const payload = { username: loginUser.value, password: loginPass.value };
                const data = await apiFetch('login', { method: "POST", headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
                localStorage.setItem('token', data.token);
                localStorage.setItem('role', data.role || 'user');
                loginMsg.textContent = '¡Login exitoso!';
                loginMsg.className = 'text-success mt-2 text-center';
                setTimeout(() => { bootstrap.Modal.getInstance(document.getElementById('loginModal')).hide(); checkLoginStatus(); fetchProductos(); }, 1000);
            } catch (error) { loginMsg.textContent = `❌ ${error.message}`; loginMsg.className = 'text-danger mt-2 text-center'; }
        });
    }

    if (formCategoria) {
        formCategoria.addEventListener('submit', async (e) => {
            e.preventDefault();
            const nombre = catNombre.value;
            if (!nombre) return;
            try {
                await apiFetch('categorias', { method: "POST", headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ nombre }) });
                catNombre.value = '';
                fetchCategorias();
            } catch (err) { alert('Error al crear categoría'); }
        });
    }

    function checkLoginStatus() {
        const token = localStorage.getItem('token');
        const role = localStorage.getItem('role');
        const isAdmin = role === 'admin' || role === 'super';
        document.querySelectorAll('.admin-panel').forEach(el => el.style.display = isAdmin ? 'block' : 'none');
        btnLogout.classList.toggle('d-none', !token);
        btnLogin.classList.toggle('d-none', !!token);
    }
    
    if(btnLogout) {
        btnLogout.addEventListener('click', () => {
            localStorage.removeItem('token');
            localStorage.removeItem('role');
            checkLoginStatus();
            fetchProductos();
        });
    }

    fetchProductos();
    fetchCategorias();
    checkLoginStatus();
});