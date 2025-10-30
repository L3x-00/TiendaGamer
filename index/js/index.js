// TiendaGamer/index/js/index.js

document.addEventListener('DOMContentLoaded', () => {
    // --- VARIABLES GLOBALES ---
    const API_BASE_URL = 'https://tiendagamer-api.onrender.com';
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

    // --- FUNCIONES DE LA API ---
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
            if (endpoint === 'productos' || endpoint === 'categorias') {
                productsGrid.innerHTML = `<div class="col-12"><div class="alert alert-danger">No se pudieron cargar los productos. Revisa la consola para más detalles.</div></div>`;
            }
            throw error;
        }
    }

    // --- FUNCIONES PARA OBTENER DATOS ---
    async function fetchProductos() {
        allProducts = await apiFetch('productos');
        renderProductos(allProducts);
    }

    function fetchProductosPorCategoria(idCategoria) {
        const productos = (idCategoria === 'all')
            ? allProducts
            : allProducts.filter(p => p.categoria_id == idCategoria);
        renderProductos(productos);
    }
    
    async function fetchCategorias() {
        allCategories = await apiFetch('categorias');
        renderMenuCategorias(allCategories);
        updateCategorySelect();
    }

    async function fetchProductoDetalle(idProducto) {
        const producto = await apiFetch(`productos/${idProducto}`);
        renderProductoDetalle(producto);
    }

    // --- FUNCIONES AUXILIARES ---
    function updateCategorySelect() {
        const prodCategoriaSelect = document.getElementById('prodCategoria');
        if (!prodCategoriaSelect) return;
        prodCategoriaSelect.innerHTML = '<option value="">Selecciona una categoría</option>';
        allCategories.forEach(cat => {
            const option = document.createElement('option');
            option.value = cat.id;
            option.textContent = cat.nombre;
            prodCategoriaSelect.appendChild(option);
        });
    }

    // --- FUNCIONES PARA RENDERIZAR HTML ---
    function renderProductos(productos) {
        if (!productos || productos.length === 0) {
            productsGrid.innerHTML = '<p class="text-muted col-12">No hay productos para mostrar.</p>';
            return;
        }
        
        const role = localStorage.getItem('role');
        const isAdmin = role === 'admin' || role === 'super';

        productsGrid.innerHTML = productos.map(producto => {
            const imagenPrincipal = producto.firstimageurl || 'https://via.placeholder.com/300x200.png?text=Sin+Imagen';
            const adminButtons = isAdmin ? `
                <button class="btn btn-sm btn-outline-secondary me-2 edit-btn" data-id="${producto.id}"><i class="bi bi-pencil"></i> Editar</button>
                <button class="btn btn-sm btn-outline-danger delete-btn" data-id="${producto.id}"><i class="bi bi-trash"></i></button>
            ` : '';
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
                            <div class="float-end">${adminButtons}</div>
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

        document.querySelectorAll('.edit-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const productoId = e.target.closest('.edit-btn').dataset.id;
                openEditProductModal(productoId);
            });
        });

        document.querySelectorAll('.delete-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const productoId = e.target.closest('.delete-btn').dataset.id;
                deleteProduct(productoId);
            });
        });
    }

    function renderMenuCategorias(categorias) {
        if (!categorias || categorias.length === 0) return;
        
        const role = localStorage.getItem('role');
        const isAdmin = role === 'admin' || role === 'super';

        categoriesNav.innerHTML = `
            <button class="btn categoria-btn active w-100 text-start mb-2" data-id="all">
                <i class="bi bi-grid-3x3-gap me-2"></i>Todos
            </button>
        `;
        
        categorias.forEach(categoria => {
            let deleteButton = '';
            if (isAdmin) {
                deleteButton = `<button class="btn btn-sm btn-outline-danger delete-cat-btn" data-id="${categoria.id}" title="Eliminar Categoría"><i class="bi bi-trash"></i></button>`;
            }
            
            const categoryButton = `
                <button class="btn categoria-btn w-100 text-start mb-2 d-flex justify-content-between align-items-center" data-id="${categoria.id}">
                    <span>${categoria.nombre}</span>
                    ${deleteButton}
                </button>
            `;
            categoriesNav.innerHTML += categoryButton;
        });

        document.querySelectorAll('.categoria-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                if (e.target.closest('.delete-cat-btn')) return;
                document.querySelectorAll('.categoria-btn').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                const categoriaId = btn.dataset.id;
                const categoriaNombre = btn.querySelector('span').textContent.trim();
                
                if (categoriaId === 'all') {
                    productsTitle.textContent = 'Todos los Productos';
                    renderProductos(allProducts);
                } else {
                    productsTitle.textContent = `Productos de: ${categoriaNombre}`;
                    fetchProductosPorCategoria(categoriaId);
                }
            });
        });

        document.querySelectorAll('.delete-cat-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                const categoriaId = e.target.closest('.delete-cat-btn').dataset.id;
                deleteCategory(categoriaId);
            });
        });
    }

    function renderProductoDetalle(producto) {
        if (!producto) return;
        detalleTitle.textContent = producto.nombre;
        let imagenesHtml = '<p>Cargando imágenes...</p>';
        detalleImagenes.innerHTML = imagenesHtml;
        
        apiFetch(`imagenes/${producto.id}`).then(imagenes => {
            if (imagenes.length === 0) {
                imagenesHtml = '<p>Este producto no tiene imágenes.</p>';
            } else {
                imagenesHtml = imagenes.map(img => {
                    const imageUrl = `${API_BASE_URL}/uploads/${img.url}`;
                    return `<div class="col-6 mb-2"><img src="${imageUrl}" class="img-fluid rounded" onerror="this.onerror=null; this.src='https://via.placeholder.com/300x200.png?text=Error+al+Cargar';"></div>`;
                }).join('');
            }
            detalleImagenes.innerHTML = imagenesHtml;
        }).catch(err => {
            console.error('Error cargando imágenes:', err);
            detalleImagenes.innerHTML = `<p class="text-danger">No se pudieron cargar las imágenes. Error: ${err.message}</p>`;
        });

        detalleInfo.innerHTML = `
            <li class="list-group-item"><b>Precio:</b> S/ ${Number(producto.precio).toFixed(2)}</li>
            <li class="list-group-item"><b>Stock:</b> ${producto.stock} unidades</li>
            <li class="list-group-item"><b>Categoría:</b> ${producto.categoria || "N/A"}</li>
            <li class="list-group-item"><b>Descripción:</b> ${producto.descripcion || "No disponible"}</li>
        `;
        detalleModal.show();
    }

    // --- FUNCIONES DE FORMULARIOS Y AUTENTICACIÓN ---
    async function handleLogin(e) {
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
        } catch (error) { 
            loginMsg.textContent = `❌ ${error.message}`; 
            loginMsg.className = 'text-danger mt-2 text-center'; 
        }
    }

    async function handleCreateCategory(e) {
        e.preventDefault();
        const nombre = catNombre.value;
        if (!nombre) return;
        apiFetch('categorias', { method: "POST", headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ nombre }) }).then(() => {
            catNombre.value = '';
            fetchCategorias();
        }).catch(err => { alert('Error al crear categoría'); });
    }

    // --- FUNCIÓN CORREGIDA Y SIMPLIFICADA ---
    async function handleCreateOrUpdateProduct(e) {
        e.preventDefault();
        const productId = document.getElementById('prodId').value;
        const isEditing = !!productId;

        const productData = { 
            nombre: document.getElementById('prodNombre').value, 
            precio: parseFloat(document.getElementById('prodPrecio').value), 
            stock: parseInt(document.getElementById('prodStock').value), 
            categoria_id: document.getElementById('prodCategoria').value ? parseInt(document.getElementById('prodCategoria').value) : null, 
            descripcion: document.getElementById('prodDescripcion').value,
            imagenUrl: document.getElementById('prodImagenUrl').value 
        };

        const options = {
            method: isEditing ? 'PUT' : 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(productData)
        };

        try {
            await apiFetch(isEditing ? `productos/${productId}` : 'productos', options);
            const productModalElement = document.getElementById('productModal');
            const productModalInstance = bootstrap.Modal.getInstance(productModalElement);
            productModalInstance.hide();
            
            productModalElement.addEventListener('hidden.bs.modal', function () {
                productModalInstance.dispose();
            }, { once: true });

            document.getElementById('formProducto').reset();
            fetchProductos();
        } catch (err) {
            console.error('Error al guardar el producto:', err);
            alert('Error al guardar el producto. Revisa la consola para más detalles.');
        }
    }

    function openEditProductModal(id) {
        const product = allProducts.find(p => p.id == id);
        if (!product) {
            alert('Error: No se encontraron los datos del producto para editar.');
            return;
        }

        document.getElementById('productModalTitle').textContent = 'Editar Producto';
        document.getElementById('prodId').value = product.id;
        document.getElementById('prodNombre').value = product.nombre;
        document.getElementById('prodPrecio').value = product.precio;
        document.getElementById('prodStock').value = product.stock;
        document.getElementById('prodCategoria').value = product.categoria_id;
        document.getElementById('prodDescripcion').value = product.descripcion;
        document.getElementById('prodImagenUrl').value = product.firstimageurl || ''; // Cargar la URL existente
        const productModal = new bootstrap.Modal(document.getElementById('productModal'));
        productModal.show();
    }

    async function deleteProduct(id) {
        if (!confirm("¿Estás seguro de que quieres eliminar este producto?")) return;
        try {
            await apiFetch(`productos/${id}`, { method: 'DELETE' });
            fetchProductos();
        } catch (err) { alert("Error al eliminar el producto"); }
    }

    async function deleteCategory(id) {
        if (!confirm("¿Estás seguro de que quieres eliminar esta categoría? Si hay productos asociados, la eliminación fallará.")) {
            return;
        }
        try {
            await apiFetch(`categorias/${id}`, { method: 'DELETE' });
            fetchCategorias();
            fetchProductos();
        } catch (err) {
            console.error("Error al eliminar la categoría:", err);
            alert("Error al eliminar la categoría. Es posible que tenga productos asociados.");
        }
    }

    function checkLoginStatus() {
        const token = localStorage.getItem('token');
        const role = localStorage.getItem('role');
        const isAdmin = role === 'admin' || role === 'super';
        document.querySelectorAll('.admin-panel').forEach(el => el.style.display = isAdmin ? 'block' : 'none');
        btnLogout.classList.toggle('d-none', !token);
        btnLogin.classList.toggle('d-none', !!token);
    }
    
    function logout() {
        localStorage.removeItem('token');
        localStorage.removeItem('role');
        checkLoginStatus();
        fetchProductos();
    }

    // --- CONFIGURACIÓN DE LISTENERS ---
    function setupEventListeners() {
        if (btnLogin) {
            btnLogin.addEventListener('click', () => {
                const modalElement = document.getElementById('loginModal');
                const modal = bootstrap.Modal.getOrCreateInstance(modalElement);
                modal.show();
            });
        }
        if (btnLogout) btnLogout.addEventListener('click', logout);
        if (formLogin) formLogin.addEventListener('submit', handleLogin);
        if (formCategoria) formCategoria.addEventListener('submit', handleCreateCategory);
        if (formProducto) formProducto.addEventListener('submit', handleCreateOrUpdateProduct);
    }

    // --- INICIALIZACIÓN ---
    fetchProductos();
    fetchCategorias();
    checkLoginStatus();
    setupEventListeners();
});