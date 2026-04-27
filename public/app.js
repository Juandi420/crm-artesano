const { useState, useEffect, useCallback } = React;

const API_URL = 'http://localhost:3000/api';

// ===== UTILIDADES =====
const formatCurrency = (amount) => {
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    minimumFractionDigits: 0
  }).format(amount);
};

const formatDate = (dateString) => {
  if (!dateString) return 'N/A';
  return new Date(dateString).toLocaleDateString('es-CO', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
};

// ===== COMPONENTE PRINCIPAL =====
function App() {
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [usuario, setUsuario] = useState(JSON.parse(localStorage.getItem('usuario') || 'null'));
  const [view, setView] = useState('login');

  useEffect(() => {
    if (token && usuario) {
      setView(usuario.rol === 'admin' ? 'admin-dashboard' : 'cliente-productos');
    }
  }, [token, usuario]);

  const handleLogin = (newToken, newUsuario) => {
    localStorage.setItem('token', newToken);
    localStorage.setItem('usuario', JSON.stringify(newUsuario));
    setToken(newToken);
    setUsuario(newUsuario);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('usuario');
    setToken(null);
    setUsuario(null);
    setView('login');
  };

  return (
    <div className="app-container">
      {!token ? (
        view === 'login' ? (
          <Login onLogin={handleLogin} onSwitchToRegister={() => setView('register')} />
        ) : (
          <Register onRegister={handleLogin} onSwitchToLogin={() => setView('login')} />
        )
      ) : usuario.rol === 'admin' ? (
        <AdminDashboard token={token} usuario={usuario} onLogout={handleLogout} />
      ) : (
        <ClienteDashboard token={token} usuario={usuario} onLogout={handleLogout} />
      )}
    </div>
  );
}

// ===== COMPONENTE LOGIN =====
function Login({ onLogin, onSwitchToRegister }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await fetch(`${API_URL}/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });

      const data = await response.json();

      if (response.ok) {
        onLogin(data.token, data.usuario);
      } else {
        setError(data.error || 'Error al iniciar sesión');
      }
    } catch (err) {
      setError('Error de conexión con el servidor');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.authContainer}>
      <div style={styles.authCard} className="fade-in-up">
        <div style={styles.authHeader}>
          <h1 style={styles.authTitle}>Bienvenido</h1>
          <p style={styles.authSubtitle}>Ingresa a tu cuenta</p>
        </div>
        
        <form onSubmit={handleSubmit} style={styles.form}>
          <div style={styles.formGroup}>
            <label style={styles.label}>Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              style={styles.input}
              required
              placeholder="tu@email.com"
            />
          </div>

          <div style={styles.formGroup}>
            <label style={styles.label}>Contraseña</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              style={styles.input}
              required
              placeholder="••••••••"
            />
          </div>

          {error && <div style={styles.error}>{error}</div>}

          <button type="submit" style={styles.primaryButton} disabled={loading}>
            {loading ? 'Ingresando...' : 'Iniciar Sesión'}
          </button>
        </form>

        <div style={styles.authFooter}>
          <span style={styles.footerText}>¿No tienes cuenta?</span>
          <button onClick={onSwitchToRegister} style={styles.linkButton}>
            Regístrate aquí
          </button>
        </div>

        <div style={styles.demoCredentials}>
          <p style={styles.demoTitle}>Credenciales de prueba:</p>
          <p style={styles.demoText}>Admin: admin@artesano.com / admin123</p>
        </div>
      </div>
    </div>
  );
}

// ===== COMPONENTE REGISTRO =====
function Register({ onRegister, onSwitchToLogin }) {
  const [formData, setFormData] = useState({
    nombre: '',
    email: '',
    telefono: '',
    direccion: '',
    password: '',
    confirmPassword: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (formData.password !== formData.confirmPassword) {
      setError('Las contraseñas no coinciden');
      return;
    }

    if (formData.password.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres');
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(`${API_URL}/registro`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nombre: formData.nombre,
          email: formData.email,
          telefono: formData.telefono,
          direccion: formData.direccion,
          password: formData.password
        })
      });

      const data = await response.json();

      if (response.ok) {
        onRegister(data.token, data.usuario);
      } else {
        setError(data.error || 'Error al registrar');
      }
    } catch (err) {
      setError('Error de conexión con el servidor');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.authContainer}>
      <div style={styles.authCard} className="fade-in-up">
        <div style={styles.authHeader}>
          <h1 style={styles.authTitle}>Crear Cuenta</h1>
          <p style={styles.authSubtitle}>Regístrate para hacer pedidos</p>
        </div>
        
        <form onSubmit={handleSubmit} style={styles.form}>
          <div style={styles.formGroup}>
            <label style={styles.label}>Nombre completo</label>
            <input
              type="text"
              name="nombre"
              value={formData.nombre}
              onChange={handleChange}
              style={styles.input}
              required
              placeholder="Juan Pérez"
            />
          </div>

          <div style={styles.formGroup}>
            <label style={styles.label}>Email</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              style={styles.input}
              required
              placeholder="juan@email.com"
            />
          </div>

          <div style={styles.formGroup}>
            <label style={styles.label}>Teléfono</label>
            <input
              type="tel"
              name="telefono"
              value={formData.telefono}
              onChange={handleChange}
              style={styles.input}
              placeholder="300 123 4567"
            />
          </div>

          <div style={styles.formGroup}>
            <label style={styles.label}>Dirección</label>
            <input
              type="text"
              name="direccion"
              value={formData.direccion}
              onChange={handleChange}
              style={styles.input}
              placeholder="Calle 123 #45-67"
            />
          </div>

          <div style={styles.formGroup}>
            <label style={styles.label}>Contraseña</label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              style={styles.input}
              required
              placeholder="••••••••"
            />
          </div>

          <div style={styles.formGroup}>
            <label style={styles.label}>Confirmar contraseña</label>
            <input
              type="password"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              style={styles.input}
              required
              placeholder="••••••••"
            />
          </div>

          {error && <div style={styles.error}>{error}</div>}

          <button type="submit" style={styles.primaryButton} disabled={loading}>
            {loading ? 'Registrando...' : 'Crear Cuenta'}
          </button>
        </form>

        <div style={styles.authFooter}>
          <span style={styles.footerText}>¿Ya tienes cuenta?</span>
          <button onClick={onSwitchToLogin} style={styles.linkButton}>
            Inicia sesión
          </button>
        </div>
      </div>
    </div>
  );
}

// ===== DASHBOARD CLIENTE =====
function ClienteDashboard({ token, usuario, onLogout }) {
  const [view, setView] = useState('productos');
  const [productos, setProductos] = useState([]);
  const [carrito, setCarrito] = useState([]);
  const [misPedidos, setMisPedidos] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    cargarProductos();
    cargarMisPedidos();
  }, []);

  const cargarProductos = async () => {
    try {
      const response = await fetch(`${API_URL}/productos`);
      const data = await response.json();
      setProductos(data);
    } catch (err) {
      console.error('Error al cargar productos:', err);
    } finally {
      setLoading(false);
    }
  };

  const cargarMisPedidos = async () => {
    try {
      const response = await fetch(`${API_URL}/mis-pedidos`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      setMisPedidos(data);
    } catch (err) {
      console.error('Error al cargar pedidos:', err);
    }
  };

  const agregarAlCarrito = (producto) => {
    const itemExistente = carrito.find(item => item.producto_id === producto.id);
    
    if (itemExistente) {
      setCarrito(carrito.map(item =>
        item.producto_id === producto.id
          ? { ...item, cantidad: item.cantidad + 1 }
          : item
      ));
    } else {
      setCarrito([...carrito, {
        producto_id: producto.id,
        nombre: producto.nombre,
        precio_unitario: producto.precio,
        unidad: producto.unidad,
        cantidad: 1
      }]);
    }
  };

  const actualizarCantidad = (producto_id, nuevaCantidad) => {
    if (nuevaCantidad <= 0) {
      setCarrito(carrito.filter(item => item.producto_id !== producto_id));
    } else {
      setCarrito(carrito.map(item =>
        item.producto_id === producto_id
          ? { ...item, cantidad: nuevaCantidad }
          : item
      ));
    }
  };

  const calcularTotal = () => {
    return carrito.reduce((total, item) => total + (item.cantidad * item.precio_unitario), 0);
  };

  return (
    <div style={styles.dashboard}>
      <nav style={styles.navbar}>
        <div style={styles.navContent}>
          <h2 style={styles.navTitle}>Artesano</h2>
          <div style={styles.navButtons}>
            <button
              onClick={() => setView('productos')}
              style={{
                ...styles.navButton,
                ...(view === 'productos' ? styles.navButtonActive : {})
              }}
            >
              Productos
            </button>
            <button
              onClick={() => setView('carrito')}
              style={{
                ...styles.navButton,
                ...(view === 'carrito' ? styles.navButtonActive : {})
              }}
            >
              Carrito ({carrito.length})
            </button>
            <button
              onClick={() => setView('mis-pedidos')}
              style={{
                ...styles.navButton,
                ...(view === 'mis-pedidos' ? styles.navButtonActive : {})
              }}
            >
              Mis Pedidos
            </button>
          </div>
          <div style={styles.userInfo}>
            <span style={styles.userName}>{usuario.nombre}</span>
            <button onClick={onLogout} style={styles.logoutButton}>Salir</button>
          </div>
        </div>
      </nav>

      <div style={styles.mainContent}>
        {view === 'productos' && (
          <ProductosCliente
            productos={productos}
            onAgregarAlCarrito={agregarAlCarrito}
            loading={loading}
          />
        )}
        {view === 'carrito' && (
          <CarritoCompra
            carrito={carrito}
            onActualizarCantidad={actualizarCantidad}
            onFinalizarCompra={() => setView('checkout')}
            calcularTotal={calcularTotal}
          />
        )}
        {view === 'checkout' && (
          <Checkout
            carrito={carrito}
            token={token}
            usuario={usuario}
            calcularTotal={calcularTotal}
            onPedidoExitoso={() => {
              setCarrito([]);
              setView('mis-pedidos');
              cargarMisPedidos();
            }}
            onVolver={() => setView('carrito')}
          />
        )}
        {view === 'mis-pedidos' && (
          <MisPedidos pedidos={misPedidos} token={token} />
        )}
      </div>
    </div>
  );
}

// Componente de productos para clientes
function ProductosCliente({ productos, onAgregarAlCarrito, loading }) {
  if (loading) {
    return <div style={styles.loading}>Cargando productos...</div>;
  }

  return (
    <div style={styles.section} className="fade-in-up">
      <h2 style={styles.sectionTitle}>Nuestros Productos</h2>
      <div style={styles.productGrid}>
        {productos.map((producto, index) => (
          <div
            key={producto.id}
            style={styles.productCard}
            className="slide-in"
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-8px)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
            }}
          >
            <div style={styles.productImagePlaceholder}>
              <span style={styles.productEmoji}>🥖</span>
            </div>
            <h3 style={styles.productName}>{producto.nombre}</h3>
            <p style={styles.productDescription}>{producto.descripcion}</p>
            <div style={styles.productFooter}>
              <div>
                <span style={styles.productPrice}>{formatCurrency(producto.precio)}</span>
                <span style={styles.productUnit}> / {producto.unidad}</span>
              </div>
              <button
                onClick={() => onAgregarAlCarrito(producto)}
                style={styles.addButton}
              >
                Agregar
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// Componente del carrito
function CarritoCompra({ carrito, onActualizarCantidad, onFinalizarCompra, calcularTotal }) {
  if (carrito.length === 0) {
    return (
      <div style={styles.emptyState}>
        <h2 style={styles.emptyTitle}>Tu carrito está vacío</h2>
        <p style={styles.emptyText}>Agrega productos para hacer tu pedido</p>
      </div>
    );
  }

  return (
    <div style={styles.section} className="fade-in-up">
      <h2 style={styles.sectionTitle}>Tu Carrito</h2>
      <div style={styles.carritoContainer}>
        {carrito.map((item) => (
          <div key={item.producto_id} style={styles.carritoItem}>
            <div style={styles.carritoItemInfo}>
              <h3 style={styles.carritoItemName}>{item.nombre}</h3>
              <p style={styles.carritoItemPrice}>
                {formatCurrency(item.precio_unitario)} / {item.unidad}
              </p>
            </div>
            <div style={styles.carritoItemActions}>
              <button
                onClick={() => onActualizarCantidad(item.producto_id, item.cantidad - 1)}
                style={styles.quantityButton}
              >
                -
              </button>
              <span style={styles.quantity}>{item.cantidad}</span>
              <button
                onClick={() => onActualizarCantidad(item.producto_id, item.cantidad + 1)}
                style={styles.quantityButton}
              >
                +
              </button>
              <span style={styles.itemTotal}>
                {formatCurrency(item.cantidad * item.precio_unitario)}
              </span>
            </div>
          </div>
        ))}
        <div style={styles.carritoTotal}>
          <span style={styles.totalLabel}>Total:</span>
          <span style={styles.totalAmount}>{formatCurrency(calcularTotal())}</span>
        </div>
        <button onClick={onFinalizarCompra} style={styles.checkoutButton}>
          Finalizar Pedido
        </button>
      </div>
    </div>
  );
}

// Componente de checkout
function Checkout({ carrito, token, usuario, calcularTotal, onPedidoExitoso, onVolver }) {
  const [formData, setFormData] = useState({
    direccion_entrega: usuario.direccion || '',
    fecha_deseada: '',
    notas: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await fetch(`${API_URL}/pedidos`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          items: carrito,
          ...formData
        })
      });

      const data = await response.json();

      if (response.ok) {
        alert('¡Pedido realizado exitosamente!');
        onPedidoExitoso();
      } else {
        setError(data.error || 'Error al realizar el pedido');
      }
    } catch (err) {
      setError('Error de conexión con el servidor');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.section} className="fade-in-up">
      <h2 style={styles.sectionTitle}>Finalizar Pedido</h2>
      <div style={styles.checkoutContainer}>
        <div style={styles.checkoutSummary}>
          <h3 style={styles.summaryTitle}>Resumen del pedido</h3>
          {carrito.map((item) => (
            <div key={item.producto_id} style={styles.summaryItem}>
              <span>{item.nombre} x {item.cantidad}</span>
              <span>{formatCurrency(item.cantidad * item.precio_unitario)}</span>
            </div>
          ))}
          <div style={styles.summaryTotal}>
            <span>Total:</span>
            <span style={styles.summaryTotalAmount}>{formatCurrency(calcularTotal())}</span>
          </div>
        </div>

        <form onSubmit={handleSubmit} style={styles.checkoutForm}>
          <div style={styles.formGroup}>
            <label style={styles.label}>Dirección de entrega *</label>
            <input
              type="text"
              value={formData.direccion_entrega}
              onChange={(e) => setFormData({ ...formData, direccion_entrega: e.target.value })}
              style={styles.input}
              required
              placeholder="Calle 123 #45-67"
            />
          </div>

          <div style={styles.formGroup}>
            <label style={styles.label}>Fecha deseada de entrega</label>
            <input
              type="date"
              value={formData.fecha_deseada}
              onChange={(e) => setFormData({ ...formData, fecha_deseada: e.target.value })}
              style={styles.input}
              min={new Date().toISOString().split('T')[0]}
            />
          </div>

          <div style={styles.formGroup}>
            <label style={styles.label}>Notas especiales</label>
            <textarea
              value={formData.notas}
              onChange={(e) => setFormData({ ...formData, notas: e.target.value })}
              style={styles.textarea}
              placeholder="Instrucciones de entrega, preferencias especiales, etc."
              rows="4"
            />
          </div>

          {error && <div style={styles.error}>{error}</div>}

          <div style={styles.checkoutActions}>
            <button type="button" onClick={onVolver} style={styles.secondaryButton}>
              Volver al carrito
            </button>
            <button type="submit" style={styles.primaryButton} disabled={loading}>
              {loading ? 'Procesando...' : 'Confirmar Pedido'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// Componente de mis pedidos
function MisPedidos({ pedidos, token }) {
  const [pedidoDetalle, setPedidoDetalle] = useState(null);

  const cargarDetalle = async (pedidoId) => {
    try {
      const response = await fetch(`${API_URL}/pedidos/${pedidoId}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      setPedidoDetalle(data);
    } catch (err) {
      console.error('Error al cargar detalle:', err);
    }
  };

  if (pedidoDetalle) {
    return (
      <div style={styles.section} className="fade-in-up">
        <button
          onClick={() => setPedidoDetalle(null)}
          style={styles.backButton}
        >
          ← Volver a mis pedidos
        </button>
        <h2 style={styles.sectionTitle}>Detalle del Pedido #{pedidoDetalle.id}</h2>
        <div style={styles.pedidoDetalle}>
          <div style={styles.detalleInfo}>
            <div style={styles.detalleRow}>
              <span style={styles.detalleLabel}>Estado:</span>
              <span style={{
                ...styles.estadoBadge,
                backgroundColor: pedidoDetalle.estado === 'completado' ? '#4CAF50' : '#FF9800'
              }}>
                {pedidoDetalle.estado}
              </span>
            </div>
            <div style={styles.detalleRow}>
              <span style={styles.detalleLabel}>Fecha del pedido:</span>
              <span>{formatDate(pedidoDetalle.fecha_pedido)}</span>
            </div>
            <div style={styles.detalleRow}>
              <span style={styles.detalleLabel}>Fecha deseada:</span>
              <span>{formatDate(pedidoDetalle.fecha_deseada)}</span>
            </div>
            <div style={styles.detalleRow}>
              <span style={styles.detalleLabel}>Dirección de entrega:</span>
              <span>{pedidoDetalle.direccion_entrega}</span>
            </div>
            {pedidoDetalle.notas && (
              <div style={styles.detalleRow}>
                <span style={styles.detalleLabel}>Notas:</span>
                <span>{pedidoDetalle.notas}</span>
              </div>
            )}
          </div>

          <h3 style={styles.detalleSubtitle}>Productos</h3>
          {pedidoDetalle.items.map((item) => (
            <div key={item.id} style={styles.detalleItem}>
              <span style={styles.detalleItemName}>{item.producto_nombre}</span>
              <span>{item.cantidad} {item.unidad}</span>
              <span>{formatCurrency(item.subtotal)}</span>
            </div>
          ))}

          <div style={styles.detalleTotal}>
            <span style={styles.detalleTotalLabel}>Total:</span>
            <span style={styles.detalleTotalAmount}>{formatCurrency(pedidoDetalle.total)}</span>
          </div>
        </div>
      </div>
    );
  }

  if (pedidos.length === 0) {
    return (
      <div style={styles.emptyState}>
        <h2 style={styles.emptyTitle}>No tienes pedidos</h2>
        <p style={styles.emptyText}>Tus pedidos aparecerán aquí</p>
      </div>
    );
  }

  return (
    <div style={styles.section} className="fade-in-up">
      <h2 style={styles.sectionTitle}>Mis Pedidos</h2>
      <div style={styles.pedidosList}>
        {pedidos.map((pedido) => (
          <div
            key={pedido.id}
            style={styles.pedidoCard}
            onClick={() => cargarDetalle(pedido.id)}
          >
            <div style={styles.pedidoHeader}>
              <span style={styles.pedidoId}>Pedido #{pedido.id}</span>
              <span style={{
                ...styles.estadoBadge,
                backgroundColor: pedido.estado === 'completado' ? '#4CAF50' : '#FF9800'
              }}>
                {pedido.estado}
              </span>
            </div>
            <div style={styles.pedidoInfo}>
              <p style={styles.pedidoFecha}>{formatDate(pedido.fecha_pedido)}</p>
              <p style={styles.pedidoTotal}>{formatCurrency(pedido.total)}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ===== DASHBOARD ADMIN =====
function AdminDashboard({ token, usuario, onLogout }) {
  const [view, setView] = useState('pedidos');
  const [pedidos, setPedidos] = useState([]);
  const [productos, setProductos] = useState([]);
  const [estadisticas, setEstadisticas] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    cargarPedidos();
    cargarProductos();
    cargarEstadisticas();
  }, []);

  const cargarPedidos = async () => {
    try {
      const response = await fetch(`${API_URL}/pedidos`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      setPedidos(data);
    } catch (err) {
      console.error('Error al cargar pedidos:', err);
    } finally {
      setLoading(false);
    }
  };

  const cargarProductos = async () => {
    try {
      const response = await fetch(`${API_URL}/productos`);
      const data = await response.json();
      setProductos(data);
    } catch (err) {
      console.error('Error al cargar productos:', err);
    }
  };

  const cargarEstadisticas = async () => {
    try {
      const response = await fetch(`${API_URL}/estadisticas`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      setEstadisticas(data);
    } catch (err) {
      console.error('Error al cargar estadísticas:', err);
    }
  };

  const cambiarEstadoPedido = async (pedidoId, nuevoEstado) => {
    try {
      await fetch(`${API_URL}/pedidos/${pedidoId}/estado`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ estado: nuevoEstado })
      });
      cargarPedidos();
      cargarEstadisticas();
    } catch (err) {
      console.error('Error al cambiar estado:', err);
    }
  };

  return (
    <div style={styles.dashboard}>
      <nav style={styles.navbar}>
        <div style={styles.navContent}>
          <h2 style={styles.navTitle}>Artesano Admin</h2>
          <div style={styles.navButtons}>
            <button
              onClick={() => setView('pedidos')}
              style={{
                ...styles.navButton,
                ...(view === 'pedidos' ? styles.navButtonActive : {})
              }}
            >
              Pedidos
            </button>
            <button
              onClick={() => setView('productos')}
              style={{
                ...styles.navButton,
                ...(view === 'productos' ? styles.navButtonActive : {})
              }}
            >
              Productos
            </button>
            <button
              onClick={() => setView('estadisticas')}
              style={{
                ...styles.navButton,
                ...(view === 'estadisticas' ? styles.navButtonActive : {})
              }}
            >
              Estadísticas
            </button>
          </div>
          <div style={styles.userInfo}>
            <span style={styles.userName}>{usuario.nombre}</span>
            <button onClick={onLogout} style={styles.logoutButton}>Salir</button>
          </div>
        </div>
      </nav>

      <div style={styles.mainContent}>
        {view === 'pedidos' && (
          <PedidosAdmin
            pedidos={pedidos}
            token={token}
            onCambiarEstado={cambiarEstadoPedido}
            loading={loading}
          />
        )}
        {view === 'productos' && (
          <ProductosAdmin
            productos={productos}
            token={token}
            onRecargar={cargarProductos}
          />
        )}
        {view === 'estadisticas' && (
          <EstadisticasAdmin estadisticas={estadisticas} />
        )}
      </div>
    </div>
  );
}

// Componente de pedidos para admin
function PedidosAdmin({ pedidos, token, onCambiarEstado, loading }) {
  const [pedidoDetalle, setPedidoDetalle] = useState(null);

  const cargarDetalle = async (pedidoId) => {
    try {
      const response = await fetch(`${API_URL}/pedidos/${pedidoId}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      setPedidoDetalle(data);
    } catch (err) {
      console.error('Error al cargar detalle:', err);
    }
  };

  if (pedidoDetalle) {
    return (
      <div style={styles.section} className="fade-in-up">
        <button
          onClick={() => setPedidoDetalle(null)}
          style={styles.backButton}
        >
          ← Volver a pedidos
        </button>
        <h2 style={styles.sectionTitle}>Pedido #{pedidoDetalle.id}</h2>
        <div style={styles.pedidoDetalle}>
          <div style={styles.detalleInfo}>
            <h3 style={styles.detalleSubtitle}>Información del Cliente</h3>
            <div style={styles.detalleRow}>
              <span style={styles.detalleLabel}>Nombre:</span>
              <span>{pedidoDetalle.cliente_nombre}</span>
            </div>
            <div style={styles.detalleRow}>
              <span style={styles.detalleLabel}>Email:</span>
              <span>{pedidoDetalle.cliente_email}</span>
            </div>
            <div style={styles.detalleRow}>
              <span style={styles.detalleLabel}>Teléfono:</span>
              <span>{pedidoDetalle.cliente_telefono || 'No proporcionado'}</span>
            </div>

            <h3 style={styles.detalleSubtitle}>Información del Pedido</h3>
            <div style={styles.detalleRow}>
              <span style={styles.detalleLabel}>Estado:</span>
              <select
                value={pedidoDetalle.estado}
                onChange={(e) => {
                  onCambiarEstado(pedidoDetalle.id, e.target.value);
                  setPedidoDetalle({ ...pedidoDetalle, estado: e.target.value });
                }}
                style={styles.select}
              >
                <option value="pendiente">Pendiente</option>
                <option value="en_preparacion">En Preparación</option>
                <option value="completado">Completado</option>
                <option value="cancelado">Cancelado</option>
              </select>
            </div>
            <div style={styles.detalleRow}>
              <span style={styles.detalleLabel}>Fecha del pedido:</span>
              <span>{formatDate(pedidoDetalle.fecha_pedido)}</span>
            </div>
            <div style={styles.detalleRow}>
              <span style={styles.detalleLabel}>Fecha deseada:</span>
              <span>{formatDate(pedidoDetalle.fecha_deseada)}</span>
            </div>
            <div style={styles.detalleRow}>
              <span style={styles.detalleLabel}>Dirección de entrega:</span>
              <span>{pedidoDetalle.direccion_entrega}</span>
            </div>
            {pedidoDetalle.notas && (
              <div style={styles.detalleRow}>
                <span style={styles.detalleLabel}>Notas:</span>
                <span>{pedidoDetalle.notas}</span>
              </div>
            )}
          </div>

          <h3 style={styles.detalleSubtitle}>Productos</h3>
          {pedidoDetalle.items.map((item) => (
            <div key={item.id} style={styles.detalleItem}>
              <span style={styles.detalleItemName}>{item.producto_nombre}</span>
              <span>{item.cantidad} {item.unidad}</span>
              <span>{formatCurrency(item.subtotal)}</span>
            </div>
          ))}

          <div style={styles.detalleTotal}>
            <span style={styles.detalleTotalLabel}>Total:</span>
            <span style={styles.detalleTotalAmount}>{formatCurrency(pedidoDetalle.total)}</span>
          </div>
        </div>
      </div>
    );
  }

  if (loading) {
    return <div style={styles.loading}>Cargando pedidos...</div>;
  }

  return (
    <div style={styles.section} className="fade-in-up">
      <h2 style={styles.sectionTitle}>Pedidos Entrantes</h2>
      <div style={styles.pedidosList}>
        {pedidos.map((pedido) => (
          <div
            key={pedido.id}
            style={styles.pedidoCard}
            onClick={() => cargarDetalle(pedido.id)}
          >
            <div style={styles.pedidoHeader}>
              <span style={styles.pedidoId}>Pedido #{pedido.id}</span>
              <span style={{
                ...styles.estadoBadge,
                backgroundColor: pedido.estado === 'completado' ? '#4CAF50' :
                               pedido.estado === 'en_preparacion' ? '#2196F3' : '#FF9800'
              }}>
                {pedido.estado}
              </span>
            </div>
            <div style={styles.pedidoInfo}>
              <p style={styles.pedidoCliente}>Cliente: {pedido.cliente_nombre}</p>
              <p style={styles.pedidoFecha}>{formatDate(pedido.fecha_pedido)}</p>
              <p style={styles.pedidoTotal}>{formatCurrency(pedido.total)}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// Componente de productos para admin
function ProductosAdmin({ productos, token, onRecargar }) {
  const [editando, setEditando] = useState(null);
  const [nuevoProducto, setNuevoProducto] = useState({
    nombre: '',
    descripcion: '',
    precio: '',
    unidad: 'unidad'
  });

  const guardarProducto = async () => {
    try {
      const response = await fetch(`${API_URL}/productos`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(nuevoProducto)
      });

      if (response.ok) {
        alert('Producto creado exitosamente');
        setNuevoProducto({ nombre: '', descripcion: '', precio: '', unidad: 'unidad' });
        onRecargar();
      }
    } catch (err) {
      console.error('Error al crear producto:', err);
    }
  };

  return (
    <div style={styles.section} className="fade-in-up">
      <h2 style={styles.sectionTitle}>Gestión de Productos</h2>
      
      <div style={styles.nuevoProductoForm}>
        <h3 style={styles.formTitle}>Agregar Nuevo Producto</h3>
        <div style={styles.formRow}>
          <input
            type="text"
            placeholder="Nombre del producto"
            value={nuevoProducto.nombre}
            onChange={(e) => setNuevoProducto({ ...nuevoProducto, nombre: e.target.value })}
            style={styles.input}
          />
          <input
            type="number"
            placeholder="Precio"
            value={nuevoProducto.precio}
            onChange={(e) => setNuevoProducto({ ...nuevoProducto, precio: e.target.value })}
            style={styles.input}
          />
        </div>
        <input
          type="text"
          placeholder="Descripción"
          value={nuevoProducto.descripcion}
          onChange={(e) => setNuevoProducto({ ...nuevoProducto, descripcion: e.target.value })}
          style={styles.input}
        />
        <div style={styles.formRow}>
          <select
            value={nuevoProducto.unidad}
            onChange={(e) => setNuevoProducto({ ...nuevoProducto, unidad: e.target.value })}
            style={styles.select}
          >
            <option value="unidad">Unidad</option>
            <option value="paquete">Paquete</option>
            <option value="frasco">Frasco</option>
            <option value="porción">Porción</option>
            <option value="kg">Kilogramo</option>
            <option value="libra">Libra</option>
          </select>
          <button onClick={guardarProducto} style={styles.primaryButton}>
            Agregar Producto
          </button>
        </div>
      </div>

      <div style={styles.productosAdminList}>
        {productos.map((producto) => (
          <div key={producto.id} style={styles.productoAdminCard}>
            <div>
              <h3 style={styles.productoAdminName}>{producto.nombre}</h3>
              <p style={styles.productoAdminDesc}>{producto.descripcion}</p>
              <p style={styles.productoAdminPrice}>
                {formatCurrency(producto.precio)} / {producto.unidad}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// Componente de estadísticas
function EstadisticasAdmin({ estadisticas }) {
  if (!estadisticas) {
    return <div style={styles.loading}>Cargando estadísticas...</div>;
  }

  return (
    <div style={styles.section} className="fade-in-up">
      <h2 style={styles.sectionTitle}>Estadísticas del Negocio</h2>
      <div style={styles.statsGrid}>
        <div style={styles.statCard}>
          <span style={styles.statNumber}>{estadisticas.total_pedidos}</span>
          <span style={styles.statLabel}>Total Pedidos</span>
        </div>
        <div style={styles.statCard}>
          <span style={styles.statNumber}>{estadisticas.pedidos_pendientes}</span>
          <span style={styles.statLabel}>Pedidos Pendientes</span>
        </div>
        <div style={styles.statCard}>
          <span style={styles.statNumber}>{estadisticas.pedidos_completados}</span>
          <span style={styles.statLabel}>Pedidos Completados</span>
        </div>
        <div style={styles.statCard}>
          <span style={styles.statNumber}>{estadisticas.total_clientes}</span>
          <span style={styles.statLabel}>Total Clientes</span>
        </div>
        <div style={{...styles.statCard, gridColumn: 'span 2'}}>
          <span style={styles.statNumber}>
            {formatCurrency(estadisticas.ventas_completadas || 0)}
          </span>
          <span style={styles.statLabel}>Ventas Completadas</span>
        </div>
      </div>
    </div>
  );
}

// ===== ESTILOS =====
const styles = {
  authContainer: {
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '2rem'
  },
  authCard: {
    background: 'var(--warm-white)',
    borderRadius: '20px',
    padding: '3rem',
    maxWidth: '500px',
    width: '100%',
    boxShadow: '0 20px 60px rgba(0,0,0,0.1)',
    border: '2px solid var(--sand)'
  },
  authHeader: {
    textAlign: 'center',
    marginBottom: '2rem'
  },
  authTitle: {
    fontSize: '3rem',
    color: 'var(--charcoal)',
    marginBottom: '0.5rem'
  },
  authSubtitle: {
    fontSize: '1.1rem',
    color: 'var(--olive)',
    fontWeight: '300'
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1.5rem'
  },
  formGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.5rem'
  },
  label: {
    fontSize: '0.9rem',
    fontWeight: '500',
    color: 'var(--charcoal)',
    letterSpacing: '0.5px'
  },
  input: {
    padding: '1rem',
    borderRadius: '12px',
    border: '2px solid var(--sand)',
    fontSize: '1rem',
    fontFamily: 'Outfit, sans-serif',
    transition: 'all 0.3s',
    background: 'var(--warm-white)',
    outline: 'none'
  },
  textarea: {
    padding: '1rem',
    borderRadius: '12px',
    border: '2px solid var(--sand)',
    fontSize: '1rem',
    fontFamily: 'Outfit, sans-serif',
    transition: 'all 0.3s',
    background: 'var(--warm-white)',
    outline: 'none',
    resize: 'vertical'
  },
  select: {
    padding: '1rem',
    borderRadius: '12px',
    border: '2px solid var(--sand)',
    fontSize: '1rem',
    fontFamily: 'Outfit, sans-serif',
    background: 'var(--warm-white)',
    outline: 'none',
    cursor: 'pointer'
  },
  primaryButton: {
    padding: '1rem 2rem',
    borderRadius: '12px',
    border: 'none',
    background: 'var(--terracotta)',
    color: 'white',
    fontSize: '1rem',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.3s',
    fontFamily: 'Outfit, sans-serif'
  },
  secondaryButton: {
    padding: '1rem 2rem',
    borderRadius: '12px',
    border: '2px solid var(--sand)',
    background: 'transparent',
    color: 'var(--charcoal)',
    fontSize: '1rem',
    fontWeight: '500',
    cursor: 'pointer',
    transition: 'all 0.3s',
    fontFamily: 'Outfit, sans-serif'
  },
  error: {
    padding: '1rem',
    borderRadius: '12px',
    background: '#FFEBEE',
    color: '#C62828',
    fontSize: '0.9rem',
    border: '1px solid #EF9A9A'
  },
  authFooter: {
    textAlign: 'center',
    marginTop: '2rem',
    display: 'flex',
    gap: '0.5rem',
    justifyContent: 'center',
    alignItems: 'center'
  },
  footerText: {
    color: 'var(--olive)',
    fontSize: '0.95rem'
  },
  linkButton: {
    background: 'none',
    border: 'none',
    color: 'var(--terracotta)',
    fontWeight: '600',
    cursor: 'pointer',
    fontSize: '0.95rem',
    fontFamily: 'Outfit, sans-serif',
    textDecoration: 'underline'
  },
  demoCredentials: {
    marginTop: '2rem',
    padding: '1rem',
    background: 'var(--sand)',
    borderRadius: '12px',
    textAlign: 'center'
  },
  demoTitle: {
    fontWeight: '600',
    marginBottom: '0.5rem',
    color: 'var(--charcoal)'
  },
  demoText: {
    fontSize: '0.85rem',
    color: 'var(--dark-olive)'
  },
  dashboard: {
    minHeight: '100vh'
  },
  navbar: {
    background: 'var(--warm-white)',
    borderBottom: '2px solid var(--sand)',
    padding: '1.5rem 2rem',
    position: 'sticky',
    top: 0,
    zIndex: 100,
    backdropFilter: 'blur(10px)'
  },
  navContent: {
    maxWidth: '1400px',
    margin: '0 auto',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: '1rem'
  },
  navTitle: {
    fontSize: '2rem',
    color: 'var(--charcoal)',
    fontFamily: 'Cormorant Garamond, serif'
  },
  navButtons: {
    display: 'flex',
    gap: '0.5rem'
  },
  navButton: {
    padding: '0.75rem 1.5rem',
    borderRadius: '10px',
    border: 'none',
    background: 'transparent',
    color: 'var(--charcoal)',
    fontSize: '0.95rem',
    fontWeight: '500',
    cursor: 'pointer',
    transition: 'all 0.3s',
    fontFamily: 'Outfit, sans-serif'
  },
  navButtonActive: {
    background: 'var(--terracotta)',
    color: 'white'
  },
  userInfo: {
    display: 'flex',
    alignItems: 'center',
    gap: '1rem'
  },
  userName: {
    fontSize: '0.95rem',
    color: 'var(--charcoal)',
    fontWeight: '500'
  },
  logoutButton: {
    padding: '0.5rem 1rem',
    borderRadius: '8px',
    border: '1px solid var(--sand)',
    background: 'transparent',
    color: 'var(--charcoal)',
    fontSize: '0.9rem',
    cursor: 'pointer',
    transition: 'all 0.3s',
    fontFamily: 'Outfit, sans-serif'
  },
  mainContent: {
    maxWidth: '1400px',
    margin: '0 auto',
    padding: '3rem 2rem'
  },
  section: {
    marginBottom: '3rem'
  },
  sectionTitle: {
    fontSize: '2.5rem',
    color: 'var(--charcoal)',
    marginBottom: '2rem',
    fontFamily: 'Cormorant Garamond, serif'
  },
  productGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
    gap: '2rem'
  },
  productCard: {
    background: 'var(--warm-white)',
    borderRadius: '16px',
    padding: '1.5rem',
    border: '2px solid var(--sand)',
    transition: 'all 0.3s',
    cursor: 'pointer'
  },
  productImagePlaceholder: {
    width: '100%',
    height: '150px',
    background: 'var(--sand)',
    borderRadius: '12px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: '1rem'
  },
  productEmoji: {
    fontSize: '3rem'
  },
  productName: {
    fontSize: '1.3rem',
    color: 'var(--charcoal)',
    marginBottom: '0.5rem',
    fontFamily: 'Cormorant Garamond, serif'
  },
  productDescription: {
    fontSize: '0.9rem',
    color: 'var(--olive)',
    marginBottom: '1rem',
    minHeight: '40px'
  },
  productFooter: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  productPrice: {
    fontSize: '1.2rem',
    fontWeight: '600',
    color: 'var(--terracotta)'
  },
  productUnit: {
    fontSize: '0.9rem',
    color: 'var(--olive)'
  },
  addButton: {
    padding: '0.6rem 1.2rem',
    borderRadius: '8px',
    border: 'none',
    background: 'var(--terracotta)',
    color: 'white',
    fontSize: '0.9rem',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.3s',
    fontFamily: 'Outfit, sans-serif'
  },
  carritoContainer: {
    background: 'var(--warm-white)',
    borderRadius: '16px',
    padding: '2rem',
    border: '2px solid var(--sand)'
  },
  carritoItem: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '1.5rem',
    background: 'var(--cream)',
    borderRadius: '12px',
    marginBottom: '1rem'
  },
  carritoItemInfo: {
    flex: 1
  },
  carritoItemName: {
    fontSize: '1.1rem',
    fontWeight: '600',
    color: 'var(--charcoal)',
    marginBottom: '0.3rem'
  },
  carritoItemPrice: {
    fontSize: '0.9rem',
    color: 'var(--olive)'
  },
  carritoItemActions: {
    display: 'flex',
    alignItems: 'center',
    gap: '1rem'
  },
  quantityButton: {
    width: '35px',
    height: '35px',
    borderRadius: '8px',
    border: '2px solid var(--sand)',
    background: 'white',
    color: 'var(--charcoal)',
    fontSize: '1.2rem',
    cursor: 'pointer',
    transition: 'all 0.3s',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  },
  quantity: {
    fontSize: '1.1rem',
    fontWeight: '600',
    minWidth: '30px',
    textAlign: 'center'
  },
  itemTotal: {
    fontSize: '1.1rem',
    fontWeight: '600',
    color: 'var(--terracotta)',
    minWidth: '100px',
    textAlign: 'right'
  },
  carritoTotal: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '1.5rem',
    marginTop: '1rem',
    borderTop: '2px solid var(--sand)'
  },
  totalLabel: {
    fontSize: '1.3rem',
    fontWeight: '600',
    color: 'var(--charcoal)'
  },
  totalAmount: {
    fontSize: '1.8rem',
    fontWeight: '700',
    color: 'var(--terracotta)',
    fontFamily: 'Cormorant Garamond, serif'
  },
  checkoutButton: {
    width: '100%',
    padding: '1.2rem',
    borderRadius: '12px',
    border: 'none',
    background: 'var(--terracotta)',
    color: 'white',
    fontSize: '1.1rem',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.3s',
    marginTop: '1rem',
    fontFamily: 'Outfit, sans-serif'
  },
  checkoutContainer: {
    display: 'grid',
    gridTemplateColumns: '1fr 1.5fr',
    gap: '2rem'
  },
  checkoutSummary: {
    background: 'var(--warm-white)',
    borderRadius: '16px',
    padding: '2rem',
    border: '2px solid var(--sand)',
    height: 'fit-content'
  },
  summaryTitle: {
    fontSize: '1.5rem',
    marginBottom: '1.5rem',
    color: 'var(--charcoal)',
    fontFamily: 'Cormorant Garamond, serif'
  },
  summaryItem: {
    display: 'flex',
    justifyContent: 'space-between',
    padding: '0.75rem 0',
    borderBottom: '1px solid var(--sand)'
  },
  summaryTotal: {
    display: 'flex',
    justifyContent: 'space-between',
    padding: '1.5rem 0',
    marginTop: '1rem',
    borderTop: '2px solid var(--sand)'
  },
  summaryTotalAmount: {
    fontSize: '1.5rem',
    fontWeight: '700',
    color: 'var(--terracotta)',
    fontFamily: 'Cormorant Garamond, serif'
  },
  checkoutForm: {
    background: 'var(--warm-white)',
    borderRadius: '16px',
    padding: '2rem',
    border: '2px solid var(--sand)'
  },
  checkoutActions: {
    display: 'flex',
    gap: '1rem',
    marginTop: '2rem'
  },
  pedidosList: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
    gap: '1.5rem'
  },
  pedidoCard: {
    background: 'var(--warm-white)',
    borderRadius: '16px',
    padding: '1.5rem',
    border: '2px solid var(--sand)',
    cursor: 'pointer',
    transition: 'all 0.3s'
  },
  pedidoHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '1rem'
  },
  pedidoId: {
    fontSize: '1.1rem',
    fontWeight: '600',
    color: 'var(--charcoal)'
  },
  estadoBadge: {
    padding: '0.4rem 0.8rem',
    borderRadius: '8px',
    color: 'white',
    fontSize: '0.8rem',
    fontWeight: '600',
    textTransform: 'capitalize'
  },
  pedidoInfo: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.5rem'
  },
  pedidoCliente: {
    fontSize: '0.95rem',
    color: 'var(--charcoal)',
    fontWeight: '500'
  },
  pedidoFecha: {
    fontSize: '0.9rem',
    color: 'var(--olive)'
  },
  pedidoTotal: {
    fontSize: '1.2rem',
    fontWeight: '700',
    color: 'var(--terracotta)'
  },
  pedidoDetalle: {
    background: 'var(--warm-white)',
    borderRadius: '16px',
    padding: '2rem',
    border: '2px solid var(--sand)'
  },
  detalleInfo: {
    marginBottom: '2rem'
  },
  detalleSubtitle: {
    fontSize: '1.5rem',
    color: 'var(--charcoal)',
    marginTop: '2rem',
    marginBottom: '1rem',
    fontFamily: 'Cormorant Garamond, serif'
  },
  detalleRow: {
    display: 'flex',
    justifyContent: 'space-between',
    padding: '0.75rem 0',
    borderBottom: '1px solid var(--sand)'
  },
  detalleLabel: {
    fontWeight: '600',
    color: 'var(--charcoal)'
  },
  detalleItem: {
    display: 'flex',
    justifyContent: 'space-between',
    padding: '1rem',
    background: 'var(--cream)',
    borderRadius: '12px',
    marginBottom: '0.75rem'
  },
  detalleItemName: {
    fontWeight: '600',
    flex: 1
  },
  detalleTotal: {
    display: 'flex',
    justifyContent: 'space-between',
    padding: '1.5rem',
    marginTop: '1rem',
    background: 'var(--sand)',
    borderRadius: '12px'
  },
  detalleTotalLabel: {
    fontSize: '1.3rem',
    fontWeight: '600'
  },
  detalleTotalAmount: {
    fontSize: '1.8rem',
    fontWeight: '700',
    color: 'var(--terracotta)',
    fontFamily: 'Cormorant Garamond, serif'
  },
  backButton: {
    padding: '0.75rem 1.5rem',
    borderRadius: '10px',
    border: '2px solid var(--sand)',
    background: 'transparent',
    color: 'var(--charcoal)',
    fontSize: '0.95rem',
    fontWeight: '500',
    cursor: 'pointer',
    marginBottom: '1.5rem',
    fontFamily: 'Outfit, sans-serif',
    transition: 'all 0.3s'
  },
  emptyState: {
    textAlign: 'center',
    padding: '4rem 2rem'
  },
  emptyTitle: {
    fontSize: '2rem',
    color: 'var(--charcoal)',
    marginBottom: '1rem',
    fontFamily: 'Cormorant Garamond, serif'
  },
  emptyText: {
    fontSize: '1.1rem',
    color: 'var(--olive)'
  },
  loading: {
    textAlign: 'center',
    padding: '3rem',
    fontSize: '1.2rem',
    color: 'var(--terracotta)'
  },
  statsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
    gap: '1.5rem'
  },
  statCard: {
    background: 'var(--warm-white)',
    borderRadius: '16px',
    padding: '2rem',
    border: '2px solid var(--sand)',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '0.5rem'
  },
  statNumber: {
    fontSize: '3rem',
    fontWeight: '700',
    color: 'var(--terracotta)',
    fontFamily: 'Cormorant Garamond, serif'
  },
  statLabel: {
    fontSize: '1rem',
    color: 'var(--olive)',
    fontWeight: '500'
  },
  nuevoProductoForm: {
    background: 'var(--warm-white)',
    borderRadius: '16px',
    padding: '2rem',
    border: '2px solid var(--sand)',
    marginBottom: '2rem'
  },
  formTitle: {
    fontSize: '1.5rem',
    marginBottom: '1.5rem',
    color: 'var(--charcoal)',
    fontFamily: 'Cormorant Garamond, serif'
  },
  formRow: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '1rem',
    marginBottom: '1rem'
  },
  productosAdminList: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
    gap: '1.5rem'
  },
  productoAdminCard: {
    background: 'var(--warm-white)',
    borderRadius: '16px',
    padding: '1.5rem',
    border: '2px solid var(--sand)'
  },
  productoAdminName: {
    fontSize: '1.3rem',
    color: 'var(--charcoal)',
    marginBottom: '0.5rem',
    fontFamily: 'Cormorant Garamond, serif'
  },
  productoAdminDesc: {
    fontSize: '0.9rem',
    color: 'var(--olive)',
    marginBottom: '0.75rem'
  },
  productoAdminPrice: {
    fontSize: '1.1rem',
    fontWeight: '600',
    color: 'var(--terracotta)'
  }
};

// Renderizar la aplicación
ReactDOM.render(<App />, document.getElementById('root'));
